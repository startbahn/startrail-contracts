const hre = require("hardhat");

const { srrArrayToRecord } = require("../test/helpers/utils");
const {
  getContract,
  suppressLoggerWarnings,
} = require("../utils/hardhat-helpers");

async function main() {
  if (process.argv.length < 3) {
    console.log(`
Usage: HARDHAT_NETWORK=<network> npx ts-node scripts/srr-get.js <tokenId>
`);
    process.exit(-1);
  }

  const tokenId = process.argv[2];
  suppressLoggerWarnings(hre.ethers);
  const sr = await getContract(hre, "StartrailRegistry");
  // const sr = await hre.ethers.getContractAt(
  //   "StartrailRegistry_1_2_1",
  //   "0x7f556e211a3E4b57d005D3aa49a31306FA8Bb34d"
  // );

  const srrRecord = srrArrayToRecord(await sr.getSRR(tokenId));
  srrRecord.owner = await sr.ownerOf(tokenId);
  srrRecord.commitment = await sr.getSRRCommitment(tokenId);
  srrRecord.tokenURI_byId = await sr['tokenURI(uint256)'](tokenId);
  srrRecord.tokenURI_byDigest = await sr['tokenURI(string)'](srrRecord.metadataDigest);

  console.log(`SRR(${tokenId}): ${JSON.stringify(srrRecord, null, 2)}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
