const { red } = require("colors");
const hre = require("hardhat");

const { addCustomHistoryType } = require("../utils/add-custom-history-type");

async function main() {
  if (process.argv.length < 3) {
    console.log(`
Usage: HARDHAT_NETWORK=<network> npx ts-node scripts/sr-add-custom-history-type.js <historyTypeName>
`);
    process.exit(-1);
  }

  const historyTypeName = process.argv[2];

  return addCustomHistoryType(hre, historyTypeName);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(
      red(`\nFailure: ${error.toString()}\n\nstack: ${error.stack}`)
    );
    process.exit(1);
  });
