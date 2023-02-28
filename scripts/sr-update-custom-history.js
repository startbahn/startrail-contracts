const { red } = require("colors");
const hre = require("hardhat");

const {
  getAdministratorInstance,
  getContract,
  suppressLoggerWarnings
} = require("../utils/hardhat-helpers");

async function main() {
  if (process.argv.length < 4) {
    console.log(`Usage: HARDHAT_NETWORK=<network> npx ts-node scripts/sr-update-custom-history.js <customHistoryId> <metadataDigest>`);
    process.exit(-1);
  }

  const historyId = process.argv[2];
  const metadataDigest = process.argv[3];

  const adminContract = await getAdministratorInstance(hre);

  suppressLoggerWarnings(hre.ethers);
  const srContract = await getContract(hre, "StartrailRegistry");

  const { data: updateHistoryCalldata } = await srContract.populateTransaction
    .updateCustomHistory(historyId, metadataDigest)
  console.log(
    `\nSending StartrailRegistry.updateCustomHistory transaction for id: ` +
    `[${historyId}]`
  );

  return adminContract.execTransaction({
    to: srContract.address,
    data: updateHistoryCalldata,
    waitConfirmed: true,
  });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(
      red(`\nFailure: ${error.toString()}\n\nstack: ${error.stack}`)
    );
    process.exit(1);
  });
