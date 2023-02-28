const { ContractKeysLegacy } = require("../../../startrail-common-js/contracts/types");

const { updateDeployJSON, loadDeployJSON } = require("../deploy-json");
const { getDeployer, waitTxHH } = require("../../hardhat-helpers");
const { logLine } = require("../../logging");

const deployLicensedUserLegacyContract = async (hre) => {
  console.log("\nDeploy LicensedUserLegacyDisabled contract:");

  const deployer = await getDeployer(hre);
  const luDisabledFactory = await hre.ethers.getContractFactory(
    "LicensedUserLegacyDisabled",
    deployer
  );
  const luDisabledImpl = await luDisabledFactory.deploy();
  await waitTxHH(hre, luDisabledImpl);

  updateDeployJSON(hre, {
    licensedUserLegacyDisabledAddress: luDisabledImpl.address,
  });

  console.log(
    `\nLicensedUserLegacyDisabled deployed: ${luDisabledImpl.address}\n`
  );
  logLine();
};

/**
 * Switch LicensedUserLogic to the skeleton LicensedUserLogic implementation
 * that disables everything except for upgrade.
 */
const disableLicensedUserLegacyWallets = async (hre) => {
  console.log("\n=====    disableLicensedUserLegacyWallets invoked    ======");

  console.log(`\nUpdating NameRegistry entry for LicensedUserLogic:`);

  const deployJSON = loadDeployJSON(hre);
  const deployer = await getDeployer(hre);

  const nameRegistry = await hre.ethers.getContractAt(
    "NameRegistry",
    deployJSON.nameRegistryProxyAddress,
    deployer
  );
  await nameRegistry.set(
    ContractKeysLegacy.LicensedUserLogic,
    deployJSON.licensedUserLegacyDisabledAddress
  );
  updateDeployJSON(hre, {
    licensedUserLogicAddress: deployJSON.licensedUserLegacyDisabledAddress,
  });
  console.log(
    `\nNameRegistry(LicensedUserLogic) updated to ${deployJSON.licensedUserLegacyDisabledAddress}\n`
  );
  logLine();
};

module.exports = {
  deployLicensedUserLegacyContract,
  disableLicensedUserLegacyWallets,
};
