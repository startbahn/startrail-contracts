const { ContractKeys } = require("../../startrail-common-js/contracts/types");

const { addCustomHistoryType } = require("../add-custom-history-type");
const { nameRegistrySet } = require("../name-registry-set");
const {
  suppressLoggerWarnings,
  getContract,
  upgradeFromAdmin,
} = require("../hardhat-helpers");

const { deployContract } = require("./deploy-contract");
const { updateDeployJSON, loadDeployJSON } = require("./deploy-json");
const { updateImplJSON, loadImplJSON } = require("./impl-json");
const { deployProxy } = require("./deploy-proxy");

const deployStartrailRegistry = async (
  hre,
  newImplementationName,
  idGeneratorImplementationName,
  openSeaMetaTransactionImplementationName,
  startrailRegistryLibraryName,
) => {
  console.log(`\nDeploying the StartrailRegistry implementation:\n`);

  const isUpgrade = newImplementationName !== undefined;
  const implementationContractName = isUpgrade
    ? newImplementationName
    : "StartrailRegistryV1";
  const idGeneratorContractName = idGeneratorImplementationName
    ? idGeneratorImplementationName
    : 'IDGenerator'

  //
  // Deploy Implementation
  //

  const {
    idGeneratorLibraryAddress,
    metaTxForwarderProxyAddress,
    nameRegistryProxyAddress,
    openSeaMetaTransactionLibraryAddress,
    proxyAdminAddress,
    startrailRegistryLibraryAddress
  } = loadDeployJSON(hre);

  const libraries = {
    [idGeneratorContractName]: idGeneratorLibraryAddress,
  }
  if (openSeaMetaTransactionImplementationName) {
    libraries[openSeaMetaTransactionImplementationName] =
      openSeaMetaTransactionLibraryAddress
  }
  if (startrailRegistryLibraryName) {
    libraries[startrailRegistryLibraryName] =
      startrailRegistryLibraryAddress
  }

  suppressLoggerWarnings(hre.ethers);
  const startrailRegistryImpl = await deployContract(
    hre,
    implementationContractName,
    [], // constructor args
    libraries
  );
  updateImplJSON(hre, {
    startrailRegistryImplementationAddress: startrailRegistryImpl.address,
  });
  console.log(
    `${implementationContractName} (implementation) deployed: ` +
    startrailRegistryImpl.address
  );

  //
  // Deploy Proxy
  // If this is not the initial release, upgrade the implementation in the proxy.
  //
  let startrailRegistryProxy;
  if (isUpgrade === false) {
    console.log(`\nDeploying the StartrailRegistry proxy:\n`);

    const TOKEN_NAME = "Startrail Registry Record";
    const TOKEN_SYMBOL = "SRR";
    const SCHEMA_URI_PREFIX =
      process.env.SCHEMA_URI_PREFIX ||
      "https://api.startrail.io/api/v1/metadata/";
    const SCHEMA_URI_POSTFIX = process.env.SCHEMA_URI_POSTFIX || ".json";

    startrailRegistryProxy = await deployProxy({
      hre,
      implContract: startrailRegistryImpl,
      proxyAdminAddress,
      initializerArgs: [
        nameRegistryProxyAddress,
        metaTxForwarderProxyAddress, // EIP2771 trusted forwarder
        TOKEN_NAME,
        TOKEN_SYMBOL,
        SCHEMA_URI_PREFIX,
        SCHEMA_URI_POSTFIX,
      ],
    });
    updateDeployJSON(hre, {
      startrailRegistryProxyAddress: startrailRegistryProxy.address,
    });
    console.log(
      `StartrailRegistry (proxy) deployed: ${startrailRegistryProxy.address}`
    );

    //
    // Set address in NameRegistry
    //
    await nameRegistrySet(
      hre,
      ContractKeys.StartrailRegistry,
      startrailRegistryProxy.address
    );

    //
    // Add history types(s)
    //
    await addCustomHistoryType(hre, "auction");
    await addCustomHistoryType(hre, "exhibition");
  } else {
    console.log(
      `\nUpgrading the StartrailRegistry proxy to` +
      `${implementationContractName}:\n`
    );
    startrailRegistryProxy = await getContract(hre, "StartrailRegistry");
    await upgradeFromAdmin(
      hre,
      startrailRegistryProxy.address,
      startrailRegistryImpl.address
    );

    console.log(
      `StartrailRegistry (proxy) updated with implementation ` +
      startrailRegistryImpl.address
    );
  }

  return startrailRegistryProxy.address;
};

module.exports = { deployStartrailRegistry };
