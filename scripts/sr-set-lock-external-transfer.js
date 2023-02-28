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
Usage: HARDHAT_NETWORK=<network> npx ts-node scripts/sr-set-lock-external-transfer.js <tokenId> <flag>
`);
    process.exit(-1);
  }

  const tokenId = process.argv[2];
  const flag = process.argv[3];

  suppressLoggerWarnings(hre.ethers);
  const srContract = await getContract(hre, "StartrailRegistry");
  const adminContract = await getAdministratorInstance(hre);

  console.log(
    `\nSending StartrailRegistry.setLockExternalTransfer transaction for ` +
    `[tokenId:${tokenId}, flag:${flag}]`
  );

  const { data: setLockExternalTransferCalldata } = await srContract.populateTransaction
    .setLockExternalTransfer(tokenId, flag);

  return adminContract.execTransaction({
    to: srContract.address,
    data: setLockExternalTransferCalldata,
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
