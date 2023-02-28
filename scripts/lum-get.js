const hre = require("hardhat");

const { licensedUserArrayToRecord } = require("../test/helpers/utils");
const { getContract } = require("../utils/hardhat-helpers");

async function main() {
  if (process.argv.length < 3) {
    console.log(`
Usage: HARDHAT_NETWORK=<network> npx ts-node scripts/lum-get.js <wallet address>
`);
    process.exit(-1);
  }

  const luAddress = process.argv[2];
  const licensedUserManager = await getContract(hre, "LicensedUserManager");
  console.log(
    `licensedUser(${luAddress}): ${JSON.stringify(
      licensedUserArrayToRecord(
        await licensedUserManager.getLicensedUser(luAddress)
      ),
      null,
      2
    )}`
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
