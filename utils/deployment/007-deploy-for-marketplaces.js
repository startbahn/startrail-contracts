const { deployStartrailRegistry } = require("./deploy-startrail-registry");
const { MetaTxRequestType } = require("../../startrail-common-js/meta-tx/types");
const { registerRequestTypes } = require("../register-request-types");
const { deployBulkIssue } = require("./deploy-bulk-issue");

const deployForMarketplaces = async (hre) => {
  console.log("\n=====    deployForMarketplaces invoked    ======\n");

  await deployStartrailRegistry(hre, `StartrailRegistryV6`);
  await registerRequestTypes(hre, [
    MetaTxRequestType.StartrailRegistrySetLockExternalTransfer,
    MetaTxRequestType.StartrailRegistryCreateSRRWithLockExternalTransfer
  ]);
  await deployBulkIssue(hre, `BulkIssueV2`);
};

module.exports = { deployForMarketplaces };
