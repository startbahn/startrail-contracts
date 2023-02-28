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
Usage: HARDHAT_NETWORK=<network> npx ts-node scripts/sr-transfer-ownership.js <address>
`);
    process.exit(-1);
  }

  const newOwner = process.argv[2];

  suppressLoggerWarnings(hre.ethers);
  const srContract = await getContract(hre, "StartrailRegistry");
  const adminContract = await getAdministratorInstance(hre);

  console.log(
    `\nSending StartrailRegistry.transferOwnership transaction for ` +
    `[newOwner:${newOwner}`
  );

  const { data: transferOwnership } = await srContract.populateTransaction
    .transferOwnership(newOwner);

  const res = await adminContract.execTransaction({
    to: srContract.address,
    data: transferOwnership,
    waitConfirmed: true,
  });
 
  const owner = await srContract.owner();
  if(owner.toUpperCase() != newOwner.toUpperCase()) {
    throw Error(`owner is not ${newOwner}`);
  }
  return res
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(
      red(`\nFailure: ${error.toString()}\n\nstack: ${error.stack}`)
    );
    process.exit(1);
  });
