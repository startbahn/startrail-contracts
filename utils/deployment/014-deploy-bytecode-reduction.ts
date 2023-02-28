import { deployStartrailRegistry } from "./deploy-startrail-registry";

const deployBytecodeReduction = async (hre) => {
  console.log("\n=====    deployBytecodeReduction invoked    ======\n");

  await deployStartrailRegistry(
    hre,
    `StartrailRegistryV13`,
    `IDGeneratorV2`,
    `OpenSeaMetaTransactionLibrary`,
    `StartrailRegistryLibraryV1`
  );
};

export { deployBytecodeReduction };
