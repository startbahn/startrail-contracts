const { red } = require("colors");
const hre = require("hardhat");

const {
  getAdministratorInstance,
  getContract,
  suppressLoggerWarnings
} = require("../utils/hardhat-helpers");

async function main() {
  if (process.argv.length < 3) {
    console.log(`
Usage: HARDHAT_NETWORK=<network> npx ts-node scripts/sr-set-contract-uri.js <contractURI>
`);
    process.exit(-1);
  }

  const contractURI = process.argv[2];

  suppressLoggerWarnings(hre.ethers);
  const srContract = await getContract(hre, "StartrailRegistry");
  const adminContract = await getAdministratorInstance(hre);

  console.log(
    `\nSending StartrailRegistry.setContractURI transaction for ` +
    `[contractURI:${contractURI}]`
  );

  const { data: setContrctURICalldata } = await srContract.populateTransaction
    .setContractURI(contractURI);

  return adminContract.execTransaction({
    to: srContract.address,
    data: setContrctURICalldata,
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
