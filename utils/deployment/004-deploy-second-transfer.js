const { deployStartrailRegistry } = require("./deploy-startrail-registry");

/**
 * Upgrade for Second Transfer release
 */

const deploySecondTransfer = async (hre) => {
  console.log("\n=====    deploySecondTransfer invoked    ======\n");

  await deployStartrailRegistry(hre, `StartrailRegistryV4`);
};

module.exports = { deploySecondTransfer };
