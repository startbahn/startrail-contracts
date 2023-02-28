import { deployStartrailRegistry } from "./deploy-startrail-registry";

const deployUpdateSRRAddHistoryPermission = async (hre) => {
  console.log("\n=====    deployUpdateSRRAddHistoryPermission invoked    ======\n");

  await deployStartrailRegistry(
    hre,
    `StartrailRegistryV15`,
    `IDGeneratorV2`,
    `OpenSeaMetaTransactionLibrary`,
    `StartrailRegistryLibraryV1`
  );
};

export { deployUpdateSRRAddHistoryPermission };
