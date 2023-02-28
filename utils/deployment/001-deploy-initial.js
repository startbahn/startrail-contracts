const { ContractKeys } = require("../../startrail-common-js/contracts/types");

const { nameRegistrySet } = require("../name-registry-set");
const { registerRequestTypesGenesisSet } = require("../register-request-types");

const { deployAdministratorContract } = require("./deploy-administrator");
const { deployBulkIssue } = require("./deploy-bulk-issue");
const { deployContract } = require("./deploy-contract");
const { deployMetaTxForwarder } = require("./deploy-meta-tx-forwarder");
const { deployLUM } = require("./deploy-licensed-user-manager");
const { saveDeployJSON, updateDeployJSON } = require("./deploy-json");
const { deployNameRegistry } = require("./deploy-name-registry");
const { deployStartrailRegistry } = require("./deploy-startrail-registry");

/**
 * Deploy initial set of contracts.
 */

const deployInitial = async (hre) => {
  console.log("\n=====    deployInitial invoked    ======\n");

  const idGenerator = await deployContract(hre, "IDGenerator");
  saveDeployJSON(hre, { idGeneratorLibraryAddress: idGenerator.address });
  console.log(`IDGenerator library deployed: ${idGenerator.address}`);

  const adminContractAddr = await deployAdministratorContract(hre);

  const startrailProxyAdmin = await deployContract(hre, "StartrailProxyAdmin");
  updateDeployJSON(hre, { proxyAdminAddress: startrailProxyAdmin.address });
  await startrailProxyAdmin
    .transferOwnership(adminContractAddr)
    .then((txRsp) => txRsp.wait());
  console.log(
    `StartrailProxyAdmin deployed: ${startrailProxyAdmin.address
    } with owner: ${await startrailProxyAdmin.owner()}`
  );

  await deployNameRegistry(hre);
  await nameRegistrySet(
    hre,
    ContractKeys.StartrailProxyAdmin,
    startrailProxyAdmin.address
  );

  await deployMetaTxForwarder(hre);
  await deployLUM(hre);
  await deployStartrailRegistry(hre);
  await deployBulkIssue(hre);
  await registerRequestTypesGenesisSet(hre)
};

module.exports = { deployInitial };
