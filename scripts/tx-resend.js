const hre = require("hardhat");
const ethers = require("ethers");
const readlineSync = require("readline-sync");

async function main() {
  if (process.argv.length < 4) {
    console.log(
      `Usage: HARDHAT_NETWORK=<network> npx ts-node scripts/tx-resend <txHash> <new gasPriceGwei>`
    );
    process.exit(-1);
  }

  const gasPriceGwei = Number.parseInt(process.argv[3]);
  if (Number.isNaN(gasPriceGwei) || gasPriceGwei <= 0 || gasPriceGwei >= 200) {
    console.error(`Error: gasPriceGwei must be a positive number < 200`);
    process.exit(-1);
  }

  const txHash = process.argv[2];
  const tx = await hre.ethers.provider.getTransaction(txHash);
  console.log(`\ntx = ${JSON.stringify(tx, null, 2)}`);

  const gasPrice = ethers.utils.parseUnits(String(gasPriceGwei), "gwei");
  const txResendRequest = {
    from: tx.from,
    to: tx.to,
    data: tx.data,
    nonce: tx.nonce,
    gasPrice,
    value: "0x0",
  };

  console.log(
    `\ntxResendRequest = ${JSON.stringify(txResendRequest, null, 2)}\n\n` +
    `NOTE: gasPrice(${gasPrice.toHexString()})=${gasPrice.toString()}\n`
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
