const { lumAddOwner } = require("../utils/lum-add-owner");

async function main() {
  if (process.argv.length < 3) {
    console.log(`
Usage: HARDHAT_NETWORK=<network> npx ts-node scripts/lum-add-owner.js <luwAddress> <newOwnerAddress>

eg. HARDHAT_NETWORK=localhost npx ts-node scripts/lum-add-owner.js 0xc56420E4dADA70A9Ae503d6d6eE28d94341e19D2 0x1030496192316950406F0a4d6C90DAF1B12DAfD4
`);
    process.exit(-1);
  }

  console.log(`\n\n-----------    Add new Owner into LUW  -----------\n`);
  const luAddress = process.argv[2];
  const newOwner = process.argv[3];
  await lumAddOwner(luAddress, newOwner);
  console.log(`\n\n-----------   New Owner added into LUW -----------\n`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
