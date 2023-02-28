const { MetaTxRequestType } = require("../../startrail-common-js/meta-tx/types");
const { deployStartrailRegistry } = require("./deploy-startrail-registry");
const {
  getAdministratorInstance,
  getContract,
} = require("../../utils/hardhat-helpers");
const { registerRequestTypes } = require("../register-request-types");

/**
 * Upgrade for Exhibition History release
 */

const deployExhibitionHistory = async (hre) => {
  console.log("\n=====    deployExhibitionHistory invoked    ======\n");

  await deployStartrailRegistry(hre, `StartrailRegistryV3`);
  const startrailRegistry = await getContract(hre, "StartrailRegistry");

  const {
    data: setMaxRecordsCallData,
  } = await startrailRegistry.populateTransaction.setMaxCombinedHistoryRecords(
    1000
  );
  const adminContract = await getAdministratorInstance(hre);
  await adminContract.execTransaction({
    to: startrailRegistry.address,
    data: setMaxRecordsCallData,
    waitConfirmed: true,
  });

  await registerRequestTypes(hre, [
    MetaTxRequestType.StartrailRegistryAddHistory,
  ]);
};

module.exports = { deployExhibitionHistory };
