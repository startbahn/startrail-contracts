const hre = require("hardhat");

const { deployProvenanceCreatedAtFix } = require("../../utils/deployment/006-deploy-provenance-created-at-fix");

deployProvenanceCreatedAtFix(hre).catch((error) => {
  console.error(error);
  process.exit(1);
});
