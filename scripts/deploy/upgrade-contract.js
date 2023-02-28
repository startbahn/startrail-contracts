const hre = require("hardhat");

const lowerFirst = require('lodash/lowerFirst')

const { deployContract } = require("../../utils/deployment/deploy-contract");
const { updateDeployJSON, loadDeployJSON } = require("../../utils/deployment/deploy-json");
const {
  getContract,
  upgradeFromAdmin,
} = require("../../utils/hardhat-helpers");

const upgradeContract = async (hre, contractName) => {
  console.log(`\nUpgrading ${contractName} implementation:\n`);

  //
  // Deploy Implementation
  //

  const {
    idGeneratorLibraryAddress,
  } = loadDeployJSON(hre);

  const implementationContract = await deployContract(
    hre,
    contractName,
    [], // constructor args
    {
      IDGenerator: idGeneratorLibraryAddress,
    }
  );

  updateDeployJSON(hre, {
    [`${lowerFirst(contractName)}ImplementationAddress`]: implementationContract.address,
  });
  console.log(
    `${contractName} (implementation) deployed: ` +
    implementationContract.address
  );

  //
  // Upgrade
  //

  console.log(
    `\nUpgrading the ${contractName} proxy:\n`
  );
  const proxyContract = await getContract(hre, contractName);
  await upgradeFromAdmin(
    hre,
    proxyContract.address,
    implementationContract.address
  );

  console.log(
    `${contractName} (proxy) updated with implementation ` +
    implementationContract.address
  );

  return proxyContract.address;
};

const contractName = process.argv[2]

upgradeContract(hre, contractName).catch((error) => {
  console.error(error);
  process.exit(1);
});
