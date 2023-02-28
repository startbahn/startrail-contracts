const { red } = require("colors");
const hre = require("hardhat");

const {
  getContract,
  suppressLoggerWarnings
} = require("../utils/hardhat-helpers");

async function main() {
  if (process.argv.length < 5) {
    console.log(`
Usage: HARDHAT_NETWORK=<network> npx ts-node scripts/sr-set-approval-for-all.js <signerIndex> <operatorIndex> <approved>
`);
    process.exit(-1);
  }

  const signerIndex = parseInt(process.argv[2]);
  const operatorIndex = parseInt(process.argv[3]);
  const approved = process.argv[4];

  suppressLoggerWarnings(hre.ethers);
  const srContract = await getContract(hre, "StartrailRegistry");

  const signers = await hre.ethers.getSigners();
  const signerAddress = await signers[signerIndex].getAddress();
  const operatorAddress = await signers[operatorIndex].getAddress();

  console.log(
    `\nSending StartrailRegistry.setApprovalForAll transaction for ` +
    `[signer:${signerAddress}, operator:${operatorAddress}, approved:${approved}]`
  );
  
  const res = await srContract.connect(signers[signerIndex])
    .setApprovalForAll(operatorAddress, approved);
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
