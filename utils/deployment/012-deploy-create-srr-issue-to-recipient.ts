import { MetaTxRequestType } from "../../startrail-common-js/meta-tx/types";

import { registerRequestTypes } from "../register-request-types";
import { deployContract } from "./deploy-contract";
import { updateDeployJSON } from "./deploy-json";
import { deployStartrailRegistry } from "./deploy-startrail-registry";

/**
 * Deploy create SRR with recipient address.
 */

const deployCreateSRRIssueToRecipient = async (hre) => {
  console.log("\n=====    deployCreateSRRIssueToRecipient invoked    ======\n");

  console.log(`\nDeploying library ...\n`);
  const srLibrary = await deployContract(hre, "StartrailRegistryLibraryV1");
  updateDeployJSON(hre, {
    startrailRegistryLibraryAddress: srLibrary.address,
  });
  console.log(`library deployed: ${srLibrary.address}`);

  await deployStartrailRegistry(
    hre,
    `StartrailRegistryV11`,
    `IDGeneratorV2`,
    `OpenSeaMetaTransactionLibrary`,
    `StartrailRegistryLibraryV1`
  );
  await registerRequestTypes(hre, [
    MetaTxRequestType.StartrailRegistryCreateSRRFromLicensedUser,
  ]);
};

export { deployCreateSRRIssueToRecipient };
