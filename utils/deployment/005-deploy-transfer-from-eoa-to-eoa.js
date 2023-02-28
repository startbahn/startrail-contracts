const { deployMetaTxForwarder } = require("./deploy-meta-tx-forwarder");

/**
 * Upgrade for Second Transfer release
 */

const deployTransferFromEOAToEOA = async (hre) => {
  console.log("\n=====    deployTransferFromEOAToEOA invoked    ======\n");

  await deployMetaTxForwarder(hre, `MetaTxForwarderV2`);
};

module.exports = { deployTransferFromEOAToEOA };
