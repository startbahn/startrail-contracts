const { red } = require("colors");
const hre = require("hardhat");

const {
  getContract,
  suppressLoggerWarnings
} = require("../utils/hardhat-helpers");

async function main() {
  if (process.argv.length < 6) {
    console.log(`
Usage: HARDHAT_NETWORK=<network> npx ts-node scripts/sr-safe-transfer-from.js <signerIndex> <fromIndex> <toIndex> <tokenId>
`);
    process.exit(-1);
  }

  const signerIndex = parseInt(process.argv[2]);
  const fromIndex = parseInt(process.argv[3]);
  const toIndex = parseInt(process.argv[4]);
  const tokenId = process.argv[5];

  suppressLoggerWarnings(hre.ethers);
  const srContract = await getContract(hre, "StartrailRegistry");

  const signers = await hre.ethers.getSigners();
  const signerAddress = await signers[signerIndex].getAddress();
  const fromAddress = await signers[fromIndex].getAddress();
  const toAddress = await signers[toIndex].getAddress();

  console.log(
    `\nSending StartrailRegistry.safeTransferFrom transaction for ` +
    `[signer:${signerAddress}, from:${fromAddress}, to:${toAddress}, tokenId:${tokenId}]`
  );

  const res = await srContract.connect(signers[signerIndex])[
      'safeTransferFrom(address,address,uint256)'
    ](fromAddress, toAddress, tokenId);
  
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
