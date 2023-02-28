const { red } = require("colors");
const hre = require("hardhat");

const {
  getContract,
  suppressLoggerWarnings
} = require("../utils/hardhat-helpers");

async function main() {
  if (process.argv.length < 5) {
    console.log(`
Usage: HARDHAT_NETWORK=<network> npx ts-node scripts/sr-approve.js <signerIndex> <toIndex> <tokenId>
`);
    process.exit(-1);
  }

  const signerIndex = parseInt(process.argv[2]);
  const toIndex = parseInt(process.argv[3]);
  const tokenId = process.argv[4];

  suppressLoggerWarnings(hre.ethers);
  const srContract = await getContract(hre, "StartrailRegistry");

  const signers = await hre.ethers.getSigners();
  const signerAddress = await signers[signerIndex].getAddress();
  const toAddress = await signers[toIndex].getAddress()

  console.log(
    `\nSending StartrailRegistry.approve transaction for ` +
    `[signer:${signerAddress}, to:${toAddress}, tokenId:${tokenId}]`
  );

  const res = await srContract.connect(signers[signerIndex])
    .approve(toAddress, tokenId);
  return res
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(
      red(`\nFailure: ${error.toString()}\n\nstack: ${error.stack}`)
    );
    process.exit(1);
  });
