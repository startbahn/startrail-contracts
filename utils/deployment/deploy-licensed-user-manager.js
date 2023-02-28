const stripHexPrefix = require("strip-hex-prefix");

const {
  encodeMultiSendTransactions,
} = require("../../startrail-common-js/contracts/administrator/multi-send");
const {
  ContractKeys,
  Operation,
} = require("../../startrail-common-js/contracts/types");

const { loadDeployJSON, updateDeployJSON } = require("./deploy-json");
const { updateImplJSON } = require("./impl-json");

const { logLine } = require("../logging");
const {
  assertContractDeployed,
  assertContractNotDeployed,
  getAdministratorInstance,
  waitTxHH,
} = require("../hardhat-helpers");
const { nameRegistrySet } = require("../name-registry-set");
const {
  deployEIP2470SingletonFactory,
  deploySingleton,
  encodeDeploySingleton,
  isEIP2470Deployed,
  SINGLETON_FACTORY_ADDRESS,
} = require("./deploy-eip2470-singleton-factory");

const FACTORY_SALT_LUM_IMPLEMENTATION =
  "0x415a817a056348b03262d7e3a6adf1b95beda769af089aec36bd95b670057b5e"; // 0xCAFE33f4AD40b5E03E245F23A8684f3dFc289ec5

const FACTORY_SALT_LUM_PROXY =
  "0x7da1e2b16f45bc6cdebc856d5b774109788975ad8089cd4b5ecb8762cab30419"; // 0xA12739B576D455B504f783A9B46b354602A4775B

/**
 * Check if the EIP2470 SingletonFactory is already deployed.
 * If it isn't we are probably running a local test node so
 * deploy it to that local network.
 * @param {HardhatRuntimeEnvironment} hre
 */
const deployEIP2470 = async (hre) => {
  if (!(await isEIP2470Deployed(hre))) {
    console.log(`\nDeploy EIP2470 SingletonFactory`);
    await deployEIP2470SingletonFactory();
    // check now deployed
    if (!(await isEIP2470Deployed(hre))) {
      throw new Error(`SingletonFactory deployment failed`);
    }
    console.log(`done`);
  } else {
    console.log(
      `EIP2470 SingletonFactory already exists on this chain with code ` +
        `length: ${
          (await hre.ethers.provider.getCode(SINGLETON_FACTORY_ADDRESS)).length
        }`
    );
  }
};

/**
 * Deploy the LUM Implementation contract using EIP2470 SingletonFactory
 * @param {HardhatRuntimeEnvironment} hre
 * @return {string} deployed contract address
 */
const deployImplementation = async (hre) => {
  console.log(`\nDeploying the LicensedUserManager implementation:\n`);

  const ethers = hre.ethers;

  const { bytecode: lumBytecode } = await ethers.getContractFactory(
    "LicensedUserManager"
  );
  console.log(`lum bytecodeHash = ${ethers.utils.keccak256(lumBytecode)}`);

  // Pre-compute the Create2 address
  const lumImplAddress = ethers.utils.getCreate2Address(
    SINGLETON_FACTORY_ADDRESS,
    FACTORY_SALT_LUM_IMPLEMENTATION,
    ethers.utils.keccak256(lumBytecode)
  );
  console.log(`calculated lulImplAddress: ${lumImplAddress}`);
  await assertContractNotDeployed(
    hre,
    "LicensedUserManager implementation",
    lumImplAddress
  );

  console.log(`\nInvoke deploySingleton to deploy LUM implementation:`);
  const lumImplTx = await deploySingleton(
    hre,
    lumBytecode,
    FACTORY_SALT_LUM_IMPLEMENTATION
  );
  await waitTxHH(hre, lumImplTx);
  await assertContractDeployed(
    hre,
    "LicensedUserManager implementation",
    lumImplAddress
  );

  updateImplJSON(hre, {
    licensedUserManagerImplementationAddress: lumImplAddress,
  });
  console.log(`\nLicensedUserManager (implementation): ${lumImplAddress}\n`);
  logLine();

  return lumImplAddress;
};

/**
 * Initcode is the concatenation of the StartrailProxyLUM contract bytecode
 * and the constructor arguments - the LUM implementation address and empty
 * pass through data.
 *
 * @param {HardhatRuntimeEnvironment} hre
 * @param {string} lumImplAddress
 * @return {string} Init bytecode as hex string
 */
const computeCreateProxyInitcode = async (hre, lumImplAddress) => {
  const ethers = hre.ethers;
  const { bytecode: lumProxyBytecode } = await ethers.getContractFactory(
    "StartrailProxyLUM"
  );
  const constructorCallBytecode = ethers.utils.defaultAbiCoder.encode(
    ["address", "bytes"], // _logic
    [lumImplAddress, "0x"] // _data
  );
  const lumProxyInitcode =
    lumProxyBytecode + stripHexPrefix(constructorCallBytecode);
  console.log(
    `lumProxyInitcode hash = ${ethers.utils.keccak256(lumProxyInitcode)}`
  );

  return lumProxyInitcode;
};

/**
 * Deploy the LUM Proxy contract using EIP2470 SingletonFactory.
 *
 * Deployment is proxied through the Administrator contract using MultiSend
 * to bundle 3 transactions (create contract, init admin, init LUM) in one.
 * This ensures we safely and atomically initialise the contract.
 *
 * @param {HardhatRuntimeEnvironment} hre
 * @param {string} lumImplAddress LicensedUserManager impleentation address
 * @param {string} nameRegistryProxyAddress NameRegistry address
 * @param {string} proxyAdminAddress ProxyAdmin address
 * @return {string} deployed contract address
 */
const deployProxy = async (
  hre,
  lumImplAddress,
  metaTxForwarderProxyAddress,
  nameRegistryProxyAddress,
  proxyAdminAddress
) => {
  console.log(`\nDeploying the LicensedUserManager Proxy via MultiSend tx:\n`);

  const ethers = hre.ethers;

  const lumProxyInitcode = await computeCreateProxyInitcode(
    hre,
    lumImplAddress
  );

  // Pre-compute the Create2 address
  const lumProxyAddress = ethers.utils.getCreate2Address(
    SINGLETON_FACTORY_ADDRESS,
    FACTORY_SALT_LUM_PROXY,
    ethers.utils.keccak256(lumProxyInitcode)
  );
  console.log(`calculated lumProxyAddress: ${lumProxyAddress}`);

  await assertContractNotDeployed(
    hre,
    "LicensedUserManager proxy",
    lumProxyAddress
  );

  const deployLumProxyEncoded = await encodeDeploySingleton(
    hre,
    lumProxyInitcode,
    FACTORY_SALT_LUM_PROXY
  );

  const lumProxyDeployMultiSendRequest = {
    operation: Operation.CALL,
    to: SINGLETON_FACTORY_ADDRESS,
    data: deployLumProxyEncoded,
  };

  //
  // Encode StartrailProxyLUM.initializeAdmin transaction
  //

  const { abi: lumProxyABI } = await hre.artifacts.readArtifact(
    "StartrailProxyLUM"
  );
  const lumProxy = await hre.ethers.getContractAt(lumProxyABI, lumProxyAddress);
  const {
    data: initializeAdminEncoded,
  } = await lumProxy.populateTransaction.initializeAdmin(proxyAdminAddress);

  const lumInitializeAdminMultiSendRequest = {
    operation: Operation.CALL,
    to: lumProxyAddress,
    data: initializeAdminEncoded,
  };

  //
  // Encode LicensedUserManager.initialize transaction
  //

  const { abi: lumABI } = await hre.artifacts.readArtifact(
    "LicensedUserManager"
  );
  const lum = await hre.ethers.getContractAt(lumABI, lumProxyAddress);
  const { data: initializeEncoded } = await lum.populateTransaction.initialize(
    nameRegistryProxyAddress,
    metaTxForwarderProxyAddress
  );

  const lumInitializeMultiSendRequest = {
    operation: Operation.CALL,
    to: lumProxyAddress,
    data: initializeEncoded,
  };

  //
  // Execute a MultiSend transaction through Administrator contract that
  // executes the 3 transactions prepared above:
  //   - create LUM proxy using EIP2470
  //   - call setAdmin on the LUM proxy
  //   - call initialize on LUM through the proxy
  //

  const adminContract = await getAdministratorInstance(hre);

  console.log(
    `\nExecuting MultiSend transaction to deploy the ` +
      `LicensedUserManager Proxy:`
  );

  const multiSendEncoded = encodeMultiSendTransactions([
    lumProxyDeployMultiSendRequest,
    lumInitializeAdminMultiSendRequest,
    lumInitializeMultiSendRequest,
  ]);

  await adminContract.execTransaction({
    data: multiSendEncoded,
    multiSend: true,
    waitConfirmed: true,
    gasLimit: 1000000,
  });

  await assertContractDeployed(
    hre,
    "LicensedUserManager proxy",
    lumProxyAddress
  );

  updateDeployJSON(hre, {
    licensedUserManagerProxyAddress: lumProxyAddress,
  });
  console.log(`\nLicensedUserManager (proxy): ${lumProxyAddress}\n`);
  logLine();

  return lumProxyAddress;
};

/**
 * Deploy the LicensedUserManager contract
 * @param {HardhatRuntimeEnvironment} hre
 * @return {Record<string,string>} {lumProxyAddress, lumImplAddress}
 */
const deployLUM = async (hre) => {
  console.log("\n=====    deployLUM invoked    ======\n");

  const {
    metaTxForwarderProxyAddress,
    nameRegistryProxyAddress,
    proxyAdminAddress,
    startrailAdministratorAddress,
  } = loadDeployJSON(hre);

  await assertContractDeployed(
    hre,
    "Administrator",
    startrailAdministratorAddress
  );
  await assertContractDeployed(
    hre,
    "MetaTxForwarder",
    metaTxForwarderProxyAddress
  );
  await assertContractDeployed(hre, "NameRegistry", nameRegistryProxyAddress);
  await assertContractDeployed(hre, "ProxyAdmin", proxyAdminAddress);

  await deployEIP2470(hre);

  const lumImplAddress = await deployImplementation(hre);
  updateImplJSON(hre, {
    licensedUserManagerImplementationAddress: lumImplAddress,
  });

  const lumProxyAddress = await deployProxy(
    hre,
    lumImplAddress,
    metaTxForwarderProxyAddress,
    nameRegistryProxyAddress,
    proxyAdminAddress
  );
  updateDeployJSON(hre, {
    licensedUserManagerProxyAddress: lumProxyAddress,
  });

  await nameRegistrySet(hre, ContractKeys.LicensedUserManager, lumProxyAddress);

  return { lumProxyAddress, lumImplAddress };
};

module.exports = { deployLUM };
