const fs = require("fs");

const { lumUpdateOriginalName } = require("../utils/lum-update-originalName");
const { lumUpdateEnglishName } = require("../utils/lum-update-englishName");

async function main() {
  if (process.argv.length < 3) {
    console.log(`
Usage: HARDHAT_NETWORK=<network> node scripts/lum-update-name.js  scripts/__data__/updateName.json
    
updateName.json example: if you want to update the original name pleaes put into the file along with wallet address
{
  "walletAddress": "0xaCF062690291d8997d6607Fb75c7e62a67E907d7",
  "originalName": "adem aydin"
}

updateName.json example: if you want to update the english name pleaes put into the file along with wallet address
{
  "walletAddress": "0xaCF062690291d8997d6607Fb75c7e62a67E907d7",
  "englishName": "adem aydin"
}

`);
    process.exit(-1);
  }
  const updateDetails = JSON.parse(fs.readFileSync(process.argv[2]).toString());

  if(updateDetails.originalName !== undefined){
    console.log(`\n\n-----------    Update Original Name  -----------\n`);
    console.log(updateDetails.originalName)
    await lumUpdateOriginalName(updateDetails);
    console.log(`\n\n-----------    Original Name  Updated -----------\n`);
  }


  if(updateDetails.englishName !== undefined){
    console.log(`\n\n-----------    Update English Name  -----------\n`);
    console.log(updateDetails.englishName)
    await lumUpdateEnglishName(updateDetails);
    console.log(`\n\n-----------    English Name Updated -----------\n`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
