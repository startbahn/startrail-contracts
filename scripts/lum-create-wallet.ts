import fs, { writeFileSync } from 'fs'

import { lumCreateWallet } from '../utils/lum-create-wallet'

const main = async () => {
  if (process.argv.length < 3) {
    console.log(`
Usage: HARDHAT_NETWORK=<network> npx ts-node scripts/lum-create-wallet <wallet.json> [luaddress.txt]
    
wallet.json example:
{
  "owners": ["0x8ce5bDb66eeeb54B5A038786EA0ADaC367F14FE0"],
  "threshold": 1,
  "englishName: "Artist A",
  "originalName: "アーティストA",
  "userType: "artist",
  "salt": "0x64e604787cbf194841e7b68d7cd28786f6c9a0a3ab9f8b0a0e87cb4387ab0107"
}

luaddress.txt:

if given the address of the created LU will be written to this file
`);
    process.exit(-1);
  }

  console.log(`\n\n-----------    Creating new LUW    -----------\n`);
  const wallet = JSON.parse(fs.readFileSync(process.argv[2]).toString());
  const luAddress = await lumCreateWallet(wallet);
  if (process.argv[3]) {
    writeFileSync(process.argv[3], luAddress);
  }
};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
