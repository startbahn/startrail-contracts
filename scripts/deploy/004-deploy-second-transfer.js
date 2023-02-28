const hre = require("hardhat");

const { deploySecondTransfer } = require("../../utils/deployment/004-deploy-second-transfer");

deploySecondTransfer(hre).catch((error) => {
  console.error(error);
  process.exit(1);
});
