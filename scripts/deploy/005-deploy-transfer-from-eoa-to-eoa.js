const hre = require("hardhat");

const { deployTransferFromEOAToEOA } = require("../../utils/deployment/005-deploy-transfer-from-eoa-to-eoa");

deployTransferFromEOAToEOA(hre).catch((error) => {
  console.error(error);
  process.exit(1);
});
