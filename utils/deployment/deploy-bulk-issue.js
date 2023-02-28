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

const deployBulkIssue = async (hre, newImplementationName) => {
  console.log(`\nDeploying the BulkIssue implementation:\n`);
  const isUpgrade = newImplementationName !== undefined;
  const implementationContractName = isUpgrade
    ? newImplementationName
    : "BulkIssueV1";

  const {
    metaTxForwarderProxyAddress,
    nameRegistryProxyAddress,
    proxyAdminAddress,
  } = loadDeployJSON(hre);
  
  suppressLoggerWarnings(hre.ethers);
  const bulkIssueImpl = await deployContract(hre, implementationContractName);
  updateImplJSON(hre, {
    bulkIssueImplementationAddress: bulkIssueImpl.address,
  });
  console.log(`${implementationContractName} (implementation) deployed: ${bulkIssueImpl.address}`);

  //
  // Deploy Proxy
  // If this is not the initial release, upgrade the implementation in the proxy.
  //
  let bulkIssueProxy;
  if (isUpgrade === false) {
    console.log(`\nDeploying the BulkIssue proxy:\n`);
    bulkIssueProxy = await deployProxy({
      hre,
      implContract: bulkIssueImpl,
      proxyAdminAddress: proxyAdminAddress,
      initializerArgs: [
        nameRegistryProxyAddress,
        metaTxForwarderProxyAddress, // EIP2771 trusted forwarder
      ],
    });
    updateDeployJSON(hre, {
      bulkIssueProxyAddress: bulkIssueProxy.address,
    });
    console.log(`BulkIssue (proxy) deployed: ${bulkIssueImpl.address}`);  

    //
    // Set address in NameRegistry
    //

    await nameRegistrySet(hre, ContractKeys.BulkIssue, bulkIssueProxy.address);

  } else {
    console.log(
      `\nUpgrading the BulkIssue proxy to ` +
      `${implementationContractName}:\n`
    );
    bulkIssueProxy = await getContract(hre, "BulkIssue");
    await upgradeFromAdmin(
      hre,
      bulkIssueProxy.address,
      bulkIssueImpl.address
    );

    console.log(
      `BulkIssue (proxy) updated with implementation ` +
      bulkIssueImpl.address
    );
  }

  return bulkIssueProxy.address;
};

module.exports = { deployBulkIssue };
