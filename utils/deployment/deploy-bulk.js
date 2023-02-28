const { ContractKeys } = require("../../startrail-common-js/contracts/types");

const { nameRegistrySet } = require("../name-registry-set");

const { deployContract } = require("./deploy-contract");
const { updateDeployJSON, loadDeployJSON } = require("./deploy-json");
const { deployProxy } = require("./deploy-proxy");

const deployBulk = async (hre) => {
  const {
    metaTxForwarderProxyAddress,
    nameRegistryProxyAddress,
    proxyAdminAddress,
  } = loadDeployJSON(hre);

  console.log(`\nDeploying the Bulk implementation:\n`);
  const bulkImpl = await deployContract(hre, "Bulk");
  updateDeployJSON(hre, {
    bulkImplementationAddress: bulkImpl.address,
  });
  console.log(`Bulk (implementation) deployed: ${bulkImpl.address}`);

  console.log(`\nDeploying the Bulk proxy:\n`);
  const bulkProxy = await deployProxy({
    hre,
    implContract: bulkImpl,
    proxyAdminAddress: proxyAdminAddress,
    initializerArgs: [
      nameRegistryProxyAddress,
      metaTxForwarderProxyAddress, // EIP2771 trusted forwarder
    ],
  });
  updateDeployJSON(hre, {
    bulkProxyAddress: bulkProxy.address,
  });
  console.log(`Bulk (proxy) deployed: ${bulkImpl.address}`);

  //
  // Set address in NameRegistry
  //

  await nameRegistrySet(hre, ContractKeys.Bulk, bulkProxy.address);

  return bulkProxy.address;
};

module.exports = { deployBulk };
