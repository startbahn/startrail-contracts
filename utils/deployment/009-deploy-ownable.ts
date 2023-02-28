import { deployStartrailRegistry } from './deploy-startrail-registry'

const deployOwnable = async (hre) => {
  console.log("\n=====    deployOwnable invoked    ======\n");
  await deployStartrailRegistry(hre, `StartrailRegistryV8`, `IDGeneratorV2`);
};

export { deployOwnable };
