const GnosisSafeJSON = require(`@gnosis.pm/safe-contracts/build/contracts/GnosisSafe.json`);
const GnosisSafeProxyFactoryJSON = require(`@gnosis.pm/safe-contracts/build/contracts/GnosisSafeProxyFactory.json`);
const MultiSendJSON = require(`@gnosis.pm/safe-contracts/build/contracts/MultiSend.json`);

const { ContractKeys } = require("../../startrail-common-js/contracts/types");
const {
  getDeployer,
  waitTxHH,
} = require("../hardhat-helpers");
const { logLine } = require("../logging");
const { decodeEventLog } = require("../../startrail-common-js/ethereum/tx-helpers");
const { updateDeployJSON, loadDeployJSON } = require("./deploy-json");
const chainIds = require('../chain-ids');

const ADMINISTRATOR_CONTRACT_NAME = "StartrailAdministrator";

/**
 * Get the admin owner list from the hardhat configuration
 * (owners set in hardhat.config.ts)
 * @param {HardhatRuntimeEnvironment} hre
 */
const getStartrailAdministratorConfig = (hre) => {
  const {
    startrailAdministrator: startrailAdministratorConfig,
  } = hre.config.networks[hre.network.name];

  if (
    !startrailAdministratorConfig ||
    !startrailAdministratorConfig.owners ||
    startrailAdministratorConfig.owners.length === 0
  ) {
    throw (
      `no owners defined for this network [${hre.network.name}] in ` +
      `hardhat.config.ts. Define an owner list in ` +
      `[network.startrailAdministrator.owners]. ` +
      `Exiting ...`
    );
  }

  return startrailAdministratorConfig;
};

/**
 * Helper to deploy a contract with the ethers hardhat extension.
 * @param {ethers} ethers A Hardhat ethers instance
 * @param {object} ContractJSON Contract JSON from solc
 */
const deployContract = async (ethers, ContractJSON, deployer) => {
  const factory = await ethers.getContractFactory(
    ContractJSON.abi,
    ContractJSON.bytecode,
    deployer
  );
  const contract = await factory.deploy();
  await waitTxHH(hre, contract);
  return contract;
};

/**
 * Deploy the Startrail administrator multisig contract (a GnosisSafe instance).
 *
 * Changes the administator in NameRegistry from the deployer address to this address.
 *
 * Depends on:
 *  - NameRegistry.sol upgrade that adds administrator() and new Contracts.sol entry
 */

const deployAdministratorContract = async (hre) => {
  console.log("\n=====    deployAdministrator invoked    ======");

  const ethers = hre.ethers;
  const deployer = await getDeployer(hre);

  // Gnosis contracts are already deployed on mainnet, rinkeby, görli and kovan
  const { chainId } = await ethers.provider.getNetwork();
  const isGnosisDeployed =
    [
      1, // Ethereum
      4, // Rinkeby
      5, // Ropsten
      42, // Kovan
      chainIds.polygon,
      chainIds.mumbai,
    ].indexOf(chainId) !== -1;

  //
  // Gnosis contracts:
  //  - local network - deploy contracts
  //  - mainnet/testnet - setup handles to already deployed contracts
  //

  let gnosisSafe, gnosisSafeFactory, multiSend;

  if (!isGnosisDeployed) {
    console.log(`\nDeploying GnosisSafe:`);
    gnosisSafe = await deployContract(ethers, GnosisSafeJSON, deployer);

    console.log(`\nDeploying GnosisSafeFactory:`);
    gnosisSafeFactory = await deployContract(
      ethers,
      GnosisSafeProxyFactoryJSON,
      deployer
    );

    console.log(`\nDeploying MultiSend:`);
    multiSend = await deployContract(ethers, MultiSendJSON, deployer);
  } else {
    // Commented out the following because the Polygon networks are not in
    // there. The addresses are fixed anyway and the same on all networks
    // so just hard code those address in below:

    // const gnosisNetworks = require(`@gnosis.pm/safe-contracts/networks.json`);
    gnosisSafe = await ethers.getContractAt(
      GnosisSafeJSON.abi,
      `0x6851D6fDFAfD08c0295C392436245E5bc78B0185`,
      deployer
    );
    gnosisSafeFactory = await ethers.getContractAt(
      GnosisSafeProxyFactoryJSON.abi,
      `0x76E2cFc1F5Fa8F6a5b3fC4c8F4788F0116861F9B`,
      deployer
    );
    multiSend = await ethers.getContractAt(
      MultiSendJSON.abi,
      `0x8D29bE29923b68abfDD21e541b9374737B49cdAD`,
      deployer
    );
  }

  console.log(`\nGnosisSafe: ${gnosisSafe.address}`);
  console.log(`GnosisSafeFactory: ${gnosisSafeFactory.address}`);

  console.log(`MultiSend: ${multiSend.address}\n`);
  updateDeployJSON(hre, {
    // save MultiSend for lookup with administrator creation
    multiSendAddress: multiSend.address,
  });

  logLine();

  //
  // Create Administrator instance
  //

  const { owners, threshold } = getStartrailAdministratorConfig(hre);
  const { data: setupCalldata } = await gnosisSafe.populateTransaction.setup(
    owners,
    threshold,
    ethers.constants.AddressZero,
    Buffer.from(""),
    ethers.constants.AddressZero,
    ethers.constants.AddressZero,
    0,
    ethers.constants.AddressZero
  );

  console.log(`\nCreating Administrator contract:`);
  const createProxyTxRsp = await gnosisSafeFactory.createProxy(
    gnosisSafe.address,
    setupCalldata
  );
  const createProxyTxReceipt = await waitTxHH(hre, createProxyTxRsp);
  const createProxyEventArgs = decodeEventLog(
    gnosisSafeFactory,
    "ProxyCreation",
    createProxyTxReceipt.logs[0]
  );
  const startrailAdministratorAddress = createProxyEventArgs[0];
  const startrailAdministrator = await ethers.getContractAt(
    GnosisSafeJSON.abi,
    startrailAdministratorAddress,
    deployer
  );

  console.log(
    `\n${ADMINISTRATOR_CONTRACT_NAME}: ${startrailAdministrator.address}`
  );
  console.log(`\towners: ${await startrailAdministrator.getOwners()}`);
  console.log(`\tthreshold: ${await startrailAdministrator.getThreshold()}\n`);
  logLine();

  updateDeployJSON(hre, {
    startrailAdministratorAddress: startrailAdministrator.address,
  });

  return startrailAdministrator.address;
};

//
// Set NameRegistry.ADMINISTRATOR to this new contract
//

const setNameRegistryAdministrator = async (hre, administratorAddress) => {
  const deployJSON = loadDeployJSON(hre);
  const deployer = await getDeployer(hre);
  const nameRegistry = await ethers.getContractAt(
    "NameRegistry",
    deployJSON.nameRegistryProxyAddress,
    deployer
  );

  console.log(`\nUpdating NameRegistry entry for Administrator:`);
  console.log(`owner: ${await nameRegistry.owner()}`);
  const setAdminTxRsp = await nameRegistry.set(
    ContractKeys.Administrator,
    administratorAddress
  );
  await waitTxHH(hre, setAdminTxRsp);
  console.log(
    `\nNameRegistry(Administrator) updated to ${administratorAddress}\n`
  );
  logLine();
};

module.exports = {
  deployAdministratorContract,
  setNameRegistryAdministrator,
};
