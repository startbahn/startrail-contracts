const hre = require("hardhat");
const readlineSync = require("readline-sync");

async function main() {
  if (process.argv.length < 3) {
    console.log(
      `Usage: HARDHAT_NETWORK=<network> npx ts-node scripts/tx-resend <txHash>`
    );
    process.exit(-1);
  }
  const feeData = await hre.ethers.provider.getFeeData()  

  const maxFeePerGas = feeData.maxFeePerGas
  const maxFeePerGasGwei = Number(hre.ethers.utils.formatUnits(maxFeePerGas, 9))
  const maxPriorityFeePerGas = feeData.maxPriorityFeePerGas
  const maxPriorityFeePerGasGwei = Number(hre.ethers.utils.formatUnits(maxPriorityFeePerGas, 9))

  if (maxFeePerGasGwei <= 0 || maxFeePerGasGwei >= 200) {
    console.error(`Error: maxFeePerGasGwei is greater than 200. try again later.`);
    process.exit(-1);
  }

  if (maxPriorityFeePerGasGwei <= 0
      || maxPriorityFeePerGasGwei >= 200
      || maxPriorityFeePerGasGwei >= maxFeePerGasGwei
  ) {
    console.error(`Error: maxPriorityFeePerGasGwei is greater than 200` +
      `and must be a positive number < maxFeePerGas`);
    process.exit(-1);
  }

  const txHash = process.argv[2];
  const tx = await hre.ethers.provider.getTransaction(txHash);
  console.log(`\ntx = ${JSON.stringify(tx, null, 2)}`);

  const txResendRequest = {
    from: tx.from,
    to: tx.to,
    data: tx.data,
    nonce: tx.nonce,
    maxFeePerGas,
    maxPriorityFeePerGas,
    value: "0x0",
  };

  console.log(
    `\ntxResendRequest = ${JSON.stringify(txResendRequest, null, 2)}\n\n` +
    `NOTE: maxFeePerGas(${maxFeePerGas.toHexString()})=${maxFeePerGasGwei}\n` +
    `      maxPriorityFeePerGas(${maxPriorityFeePerGas.toHexString()})=${maxPriorityFeePerGasGwei}\n`
  );
  const confirmRsp = readlineSync.question(
    'Resend tx with these details? ("yes" to continue) '
  );
  if ("yes" !== confirmRsp) {
    console.log(`\nExiting ...`);
    process.exit(1);
  }

  const signer = new hre.ethers.Wallet(
    hre.network.config.accounts[0],
    hre.ethers.provider
  );
  const signedTx = await signer.sendTransaction(txResendRequest);
  console.log(`\nresent tx: ${JSON.stringify(signedTx, null, 2)}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
