const hre = require("hardhat");

const { deployInitial } = require("../../utils/deployment/001-deploy-initial");

deployInitial(hre).catch((error) => {
  console.error(error);
  process.exit(1);
});
