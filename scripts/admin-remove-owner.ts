import hre from 'hardhat'

import { getAdministratorInstance } from '../utils/hardhat-helpers'

async function main() {
  if (process.argv.length < 4) {
    console.log(`
Usage: HARDHAT_NETWORK=<network> npx ts-node scripts/admin-remove-owner.js <prev owner address> <owner address>
`);
    process.exit(-1);
  }

  const prevOwner = process.argv[2];
  const owner = process.argv[3];
  const threshold = 1;

  console.log(`\n\n-----------    Prev Owner ${prevOwner}    -----------\n`);
  console.log(`\n\n-----------    Remove Owner ${owner}    -----------\n`);

  const admin = await getAdministratorInstance(hre);

  const {
    data: addOwnerCallData,
  } = await admin.contract.populateTransaction.removeOwner(
    prevOwner,
    owner,
    threshold,
  );
  const txReceipt = await admin.execTransaction({
    to: admin.contract.address,
    data: addOwnerCallData,
  });

  // const eventDecoded = decodeEventLog(
  //   admin.contract,
  //   "RemovedOwner",
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
