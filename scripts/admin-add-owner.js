const fs = require("fs");
const hre = require("hardhat");

const { getAdministratorInstance } = require("../utils/hardhat-helpers");

async function main() {
  if (process.argv.length < 3) {
    console.log(`
Usage: HARDHAT_NETWORK=<network> npx ts-node scripts/admin-add-owner.js <owner address>
`);
    process.exit(-1);
  }

  const newOwner = process.argv[2];

  console.log(`\n\n-----------    Adding Owner ${newOwner}    -----------\n`);

  const admin = await getAdministratorInstance(hre);

  const {
    data: addOwnerCallData,
  } = await admin.contract.populateTransaction.addOwnerWithThreshold(
    newOwner,
    1
  );
  const txReceipt = await admin.execTransaction({
    to: admin.contract.address,
    data: addOwnerCallData,
    gasLimit: 500000,
  });

  // const eventDecoded = decodeEventLog(
  //   admin.contract,
  //   "AddedOwner",
  //   txReceipt.logs[0]
  // );

  console.log(`\nUpdated owner list [${await admin.contract.getOwners()}]\n`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
