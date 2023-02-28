const { lumRemoveOwner } = require("../utils/lum-remove-owner");

async function main() {
  if (process.argv.length < 3) {
    console.log(`
Usage: HARDHAT_NETWORK=<network> npx ts-node scripts/lum-remove-owner.js <luwAddress> <ownerAddress>

eg. HARDHAT_NETWORK=localhost npx ts-node scripts/lum-remove-owner.js 0xc56420E4dADA70A9Ae503d6d6eE28d94341e19D2 0x1030496192316950406F0a4d6C90DAF1B12DAfD4
`);
    process.exit(-1);
  }

  console.log(`\n\n-----------  Remove Owner from LUW  -----------\n`);
  const luAddress = process.argv[2];
  const ownerToRemove = process.argv[3];
  await lumRemoveOwner(luAddress, ownerToRemove);
  console.log(`\n\n-----------  Owner removed from LUW -----------\n`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
