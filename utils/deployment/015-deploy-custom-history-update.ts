import { deployStartrailRegistry } from "./deploy-startrail-registry";

const deployCustomHistoryUpdate = async (hre) => {
  console.log("\n=====    deployCustomHistoryUpdate invoked    ======\n");

  await deployStartrailRegistry(
    hre,
    `StartrailRegistryV14`,
    `IDGeneratorV2`,
    `OpenSeaMetaTransactionLibrary`,
    `StartrailRegistryLibraryV1`
  );
};

export { deployCustomHistoryUpdate };
