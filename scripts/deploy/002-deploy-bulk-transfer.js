const hre = require("hardhat");

const { deployInitialBulkTransfer } = require("../../utils/deployment/002-deploy-bulk-transfer");

deployInitialBulkTransfer(hre).catch((error) => {
  console.error(error);
  process.exit(1);
});
