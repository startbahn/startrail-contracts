const { MetaTxRequestType } = require("../../startrail-common-js/meta-tx/types");
const { deployBulkTransfer } = require("./deploy-bulk-transfer");
const { deployStartrailRegistry } = require("./deploy-startrail-registry");
const { registerRequestTypes } = require("../register-request-types");

/**
 * Deploy initial set of bulk transfer contracts.
 */

const deployInitialBulkTransfer = async (hre) => {
  console.log("\n=====    deployBulkTransfer invoked    ======\n");
  await deployStartrailRegistry(hre, `StartrailRegistryV2`);
  await deployBulkTransfer(hre);
  await registerRequestTypes(hre, [MetaTxRequestType.BulkTransferSendBatch]);
};

module.exports = { deployInitialBulkTransfer };
