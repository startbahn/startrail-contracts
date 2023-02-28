const { red } = require("colors");
const hre = require("hardhat");

const {
  getAdministratorInstance,
  getContract,
  suppressLoggerWarnings
} = require("../utils/hardhat-helpers");

async function main() {
  if (process.argv.length < 4) {
    console.log(`
Usage: HARDHAT_NETWORK=<network> npx ts-node scripts/sr-set-token-uri-parts.js <URIPrefix> <URIPostfix>
`);
    process.exit(-1);
  }

  const URIPrefix = process.argv[2];
  const URIPostfix = process.argv[3];

  suppressLoggerWarnings(hre.ethers);
  const srContract = await getContract(hre, "StartrailRegistry");
  const adminContract = await getAdministratorInstance(hre);

  console.log(
    `\nSending StartrailRegistry.setTokenURIParts transaction for ` +
    `[URIPrefix:${URIPrefix}, URIPostfix:${URIPostfix}]`
  );

  const { data: setTokenURIPartsCalldata } = await srContract.populateTransaction
    .setTokenURIParts(URIPrefix, URIPostfix);

  console.log(setTokenURIPartsCalldata);
  return adminContract.execTransaction({
    to: srContract.address,
    data: setTokenURIPartsCalldata,
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
