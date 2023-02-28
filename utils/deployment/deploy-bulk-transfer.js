const { ContractKeys } = require("../../startrail-common-js/contracts/types");

const { nameRegistrySet } = require("../name-registry-set");

const { deployContract } = require("./deploy-contract");
const { updateDeployJSON, loadDeployJSON } = require("./deploy-json");
const { updateImplJSON } = require("./impl-json");
const { deployProxy } = require("./deploy-proxy");

const deployBulkTransfer = async (hre) => {
  const {
    metaTxForwarderProxyAddress,
    nameRegistryProxyAddress,
    proxyAdminAddress,
  } = loadDeployJSON(hre);

  console.log(`\nDeploying the BulkTransfer implementation:\n`);
  const bulkTransferImpl = await deployContract(hre, "BulkTransfer");
  updateImplJSON(hre, {
    bulkTransferImplementationAddress: bulkTransferImpl.address,
  });
  console.log(`BulkTransfer (implementation) deployed: ${bulkTransferImpl.address}`);

  console.log(`\nDeploying the BulkTransfer proxy:\n`);
  const bulkTransferProxy = await deployProxy({
    hre,
    implContract: bulkTransferImpl,
    proxyAdminAddress: proxyAdminAddress,
    initializerArgs: [
      nameRegistryProxyAddress,
      metaTxForwarderProxyAddress, // EIP2771 trusted forwarder
    ],
  });
  updateDeployJSON(hre, {
    bulkTransferProxyAddress: bulkTransferProxy.address,
  });
  console.log(`BulkTransfer (proxy) deployed: ${bulkTransferImpl.address}`);

  //
  // Set address in NameRegistry
  //

  await nameRegistrySet(hre, ContractKeys.BulkTransfer, bulkTransferProxy.address);

  return bulkTransferProxy.address;
};

module.exports = { deployBulkTransfer };
