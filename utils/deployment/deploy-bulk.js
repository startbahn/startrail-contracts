const { ContractKeys } = require("../../startrail-common-js/contracts/types");

const { nameRegistrySet } = require("../name-registry-set");

const { deployContract } = require("./deploy-contract");
const { updateDeployJSON, loadDeployJSON } = require("./deploy-json");
const { updateImplJSON } = require("./impl-json");
const { deployProxy } = require("./deploy-proxy");

const {
  suppressLoggerWarnings,
  getContract,
  upgradeFromAdmin,
} = require("../hardhat-helpers");

const deployBulk = async (hre, newImplementationName) => {
  console.log(`\nDeploying the Bulk implementation:\n`);
  const isUpgrade = newImplementationName !== undefined;
  const implementationContractName = isUpgrade
    ? newImplementationName
    : "BulkV1";

  const {
    metaTxForwarderProxyAddress,
    nameRegistryProxyAddress,
    proxyAdminAddress,
  } = loadDeployJSON(hre);
  
  suppressLoggerWarnings(hre.ethers);
  const bulkImpl = await deployContract(hre, implementationContractName);
  updateImplJSON(hre, {
    bulkImplementationAddress: bulkImpl.address,
  });
  console.log(`${implementationContractName} (implementation) deployed: ${bulkImpl.address}`);

  //
  // Deploy Proxy
  // If this is not the initial release, upgrade the implementation in the proxy.
  //
  let bulkProxy;
  if (isUpgrade === false) {
    console.log(`\nDeploying the Bulk proxy:\n`);
    bulkProxy = await deployProxy({
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

  } else {
    console.log(
      `\nUpgrading the Bulk proxy to ` +
      `${implementationContractName}:\n`
    );
    bulkProxy = await getContract(hre, "Bulk");
    await upgradeFromAdmin(
      hre,
      bulkProxy.address,
      bulkImpl.address
    );

    console.log(
      `Bulk (proxy) updated with implementation ` +
      bulkImpl.address
    );
  }

  return bulkProxy.address;
};

module.exports = { deployBulk };
