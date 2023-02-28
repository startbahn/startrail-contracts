import { deployStartrailRegistry } from "./deploy-startrail-registry";

/**
 * Deploy create SRR with recipient address.
 */

const deployRenameRecipient = async (hre) => {
  console.log("\n=====    deployRenameRecipient invoked    ======\n");

  await deployStartrailRegistry(
    hre,
    `StartrailRegistryV12`,
    `IDGeneratorV2`,
    `OpenSeaMetaTransactionLibrary`,
    `StartrailRegistryLibraryV1`
  );
};

export { deployRenameRecipient };
