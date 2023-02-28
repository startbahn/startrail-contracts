const { deployStartrailRegistry } = require("./deploy-startrail-registry");

const deployProvenanceCreatedAtFix = async (hre) => {
  console.log("\n=====    deployProvenanceCreatedAtFix invoked    ======\n");

  await deployStartrailRegistry(hre, `StartrailRegistryV5`);
};

module.exports = { deployProvenanceCreatedAtFix };
