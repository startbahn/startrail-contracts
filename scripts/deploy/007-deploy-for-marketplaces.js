const hre = require("hardhat");

const { deployForMarketplaces } = require("../../utils/deployment/007-deploy-for-marketplaces");

deployForMarketplaces(hre).catch((error) => {
  console.error(error);
  process.exit(1);
});
