import { deployStartrailRegistry } from "./deploy-startrail-registry";

const deployAuditFixes = async (hre) => {
  console.log("\n=====    deploy V16 invoked    ======\n");

  await deployStartrailRegistry(
    hre,
    `StartrailRegistryV16`,
    `IDGeneratorV2`,
    `OpenSeaMetaTransactionLibrary`,
    `StartrailRegistryLibraryV1`
  );
};

export { deployAuditFixes };
