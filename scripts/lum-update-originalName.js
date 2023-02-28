const fs = require("fs");

const { lumUpdateOriginalName } = require("../utils/lum-update-originalName");

async function main() {
  if (process.argv.length < 3) {
    console.log(`
Usage: HARDHAT_NETWORK=<network> npx ts-node scripts/lum-update-originalName.js scripts/__data__/updateOriginalName-28-4-2021.json
    
updateOriginalName.json example:
{
  "walletAddress": "0xaCF062690291d8997d6607Fb75c7e62a67E907d7",
  "originalName": "加藤 公佑"
}
`);
    process.exit(-1);
  }

  console.log(`\n\n-----------    Update Original Name  -----------\n`);
  const updateDetails = JSON.parse(fs.readFileSync(process.argv[2]).toString());
  console.log(updateDetails)
  // const { walletAddress, originalName } = updateDetails;
  // console.log("walletAddress" - walletAddress)
  // console.log("originalName" - originalName)
  await lumUpdateOriginalName(updateDetails);
  console.log(`\n\n-----------    Original Name  Updated -----------\n`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
