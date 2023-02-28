const hre = require("hardhat");

const {
  disableLicensedUserLegacyWallets,
} = require("../../utils/deployment/migrate-lu/disable-lu-legacy");

const main = async () => {
  await disableLicensedUserLegacyWallets(hre);
};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
