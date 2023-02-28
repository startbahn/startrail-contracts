const { red } = require("colors");
const fs = require("fs");
const hre = require("hardhat");

const { loadDeployJSON } = require("../utils/deployment/deploy-json");
const {
  getContract,
  suppressLoggerWarnings,
  parseLogs,
  waitTxHH,
} = require("../utils/hardhat-helpers");

async function main() {
  if (process.argv.length < 3) {
    console.log(`
Usage: HARDHAT_NETWORK=<network> npx ts-node scripts/srr-transfer-by-reveal.js <transfer.json>
    
transfer.json example (see scripts/data for files):
{
  "tokenId": 54962087,
  "revealHash": "0x5b3fe7fd204d1f0e7f502179c202a66dc74652e561135f569f063c86e04bc4a4",
  "toAddress": "0x96b25cE60a6628B3c63D9cF1a7C649EA3Aeb154C"
}
`);
    process.exit(-1);
  }

  const deployJSON = loadDeployJSON(hre);
  suppressLoggerWarnings(hre.ethers);

  const sr = await getContract(hre, "StartrailRegistry");

  const transferInput = JSON.parse(fs.readFileSync(process.argv[2]).toString());
  const { toAddress, revealHash, tokenId, isIntermediary } = transferInput;
  const transferResult = await sr["transferSRRByReveal(address,bytes32,uint256,bool)"](
    toAddress,
    revealHash,
    tokenId,
    isIntermediary
  );

  const transferReceipt = await waitTxHH(hre, transferResult, 0);
  console.log(
    `\nlogs: ${JSON.stringify(
      await parseLogs(hre, deployJSON, transferReceipt.logs),
      null,
      2
    )}`
  );

  console.log(`\nstatus: ${transferReceipt.status}\n`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(red(`\nFailure: ${error.toString()}\n`));
    process.exit(1);
  });
