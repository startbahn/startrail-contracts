const hre = require("hardhat");

const { deployExhibitionHistory } = require("../../utils/deployment/003-deploy-exhibition-history");

deployExhibitionHistory(hre).catch((error) => {
  console.error(error);
  process.exit(1);
});
