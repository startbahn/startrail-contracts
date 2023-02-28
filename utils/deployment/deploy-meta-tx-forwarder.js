const { ContractKeys } = require("../../startrail-common-js/contracts/types");

const { nameRegistrySet } = require("../name-registry-set");
const {
  suppressLoggerWarnings,
  getContract,
  upgradeFromAdmin,
} = require("../hardhat-helpers");

const { deployContract } = require("./deploy-contract");
const { updateDeployJSON, loadDeployJSON } = require("./deploy-json");
const { updateImplJSON } = require("./impl-json");
const { deployProxy } = require("./deploy-proxy");

const deployMetaTxForwarder = async (hre, newImplementationName) => {
  console.log(`\nDeploying the MetaTxForwarder implementation:\n`);

  const isUpgrade = newImplementationName !== undefined;
  const implementationContractName = isUpgrade
    ? newImplementationName
    : "MetaTxForwarderV1";

  //
  // Deploy Implementation
  //

  const { nameRegistryProxyAddress, proxyAdminAddress } = loadDeployJSON(hre);

  suppressLoggerWarnings(hre.ethers);
  const metaTxForwarderImpl = await deployContract(
    hre,
    implementationContractName,
    [] // constructor args
  );
  updateImplJSON(hre, {
    metaTxForwarderImplementationAddress: metaTxForwarderImpl.address,
  });
  console.log(
    `MetaTxForwarder (implementation) deployed: ${metaTxForwarderImpl.address}`
  );

  //
  // Deploy Proxy
  // If this is not the initial release, upgrade the implementation in the proxy.
  //
  let metaTxForwarderProxy;
  if (isUpgrade === false) {
    console.log(`\nDeploying the MetaTxForwarder proxy:\n`);
    metaTxForwarderProxy = await deployProxy({
      hre,
      implContract: metaTxForwarderImpl,
      proxyAdminAddress,
      initializerArgs: [nameRegistryProxyAddress],
    });
    updateDeployJSON(hre, {
      metaTxForwarderProxyAddress: metaTxForwarderProxy.address,
    });
    console.log(
      `MetaTxForwarder (proxy) deployed: ${metaTxForwarderProxy.address}`
    );

    await nameRegistrySet(
      hre,
      ContractKeys.MetaTxForwarder,
      metaTxForwarderProxy.address
    );

  } else {
    console.log(
      `\nUpgrading the MetaTxForwarder proxy to ` +
      `${implementationContractName}:\n`
    );
    metaTxForwarderProxy = await getContract(hre, "MetaTxForwarder");
    await upgradeFromAdmin(
      hre,
      metaTxForwarderProxy.address,
      metaTxForwarderImpl.address
    );

    console.log(
      `MetaTxForwarder (proxy) updated with implementation ` +
      metaTxForwarderImpl.address
    );

  }

  return metaTxForwarderProxy.address;
};

module.exports = { deployMetaTxForwarder };
