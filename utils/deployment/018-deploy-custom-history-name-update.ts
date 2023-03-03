import { deployStartrailRegistry } from "./deploy-startrail-registry";

const deployCustomHistoryNameUpdate = async (hre) => {
  console.log("\n=====    deploy V17 CustomHistoryNameUpdate invoked    ======\n");

  await deployStartrailRegistry(
    hre,
    `StartrailRegistryV17`,
    `IDGeneratorV2`,
    `OpenSeaMetaTransactionLibrary`,
    `StartrailRegistryLibraryV1`
  );
};

export { deployCustomHistoryNameUpdate };
