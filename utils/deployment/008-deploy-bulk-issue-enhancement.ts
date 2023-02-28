import { deployBulkIssue } from './deploy-bulk-issue'
import { deployContract } from './deploy-contract'
import { updateDeployJSON } from './deploy-json'
import { deployStartrailRegistry } from './deploy-startrail-registry'
const { registerRequestTypes } = require("../register-request-types");
const { MetaTxRequestType } = require("../../startrail-common-js/meta-tx/types");

const deployBulkIssueEnhancement = async (hre) => {
  console.log("\n=====    deployBulkIssueEnhancement invoked    ======\n");

  const idGenerator = await deployContract(hre, "IDGeneratorV2");
  updateDeployJSON(hre, { idGeneratorLibraryAddress: idGenerator.address });
  console.log(`IDGeneratorV2 library deployed: ${idGenerator.address}`);

  await deployStartrailRegistry(hre, `StartrailRegistryV7`, `IDGeneratorV2`);
  await registerRequestTypes(hre, [
    MetaTxRequestType.StartrailRegistryTransferFromWithProvenance
  ]);

  await deployBulkIssue(hre, `BulkIssueV3`);
};

export { deployBulkIssueEnhancement };
