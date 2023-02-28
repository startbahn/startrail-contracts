const { Command } = require('commander');
const hre = require("hardhat");
const fs = require("fs");
const { chunk } = require("lodash/array");
const { Operation } = require("../startrail-common-js/contracts/types");

const {
  getAdministratorInstance,
  getContract,
  suppressLoggerWarnings,
} = require("../utils/hardhat-helpers");

const encodeTransactions = async (contractHandle, contractFunction, inputs) =>
  Promise.all(
    inputs.map(async (inputRecord) => {
      const { data: calldata } =
        await contractHandle.populateTransaction[contractFunction](
          ...Object.values(inputRecord)
        );
      console.log(
        `Encoded ${contractFunction} transaction for input ` +
        JSON.stringify(inputRecord, null, 2)
      );
      return calldata;
    })
  );

const sendMultiSendTx = async (admin, startrailRegistryAddress, encodedTransactions) => {
  const multiSendEncodedTx = admin.encodeMultiSendSingleDestination(
    Operation.CALL,
    startrailRegistryAddress,
    encodedTransactions
  )
  return admin.execTransaction({
    data: multiSendEncodedTx,
    multiSend: true,
    waitConfirmed: true,
    gasLimit: 10000000,
  })
}

async function main() {
  if (!process.env.HARDHAT_NETWORK) {
    console.log(`HARDHAT_NETWORK environment variable is not set`)
    process.exit(1)
  }

  const program = new Command();
  program
    .requiredOption(
      '-i, --inputs-file [file]',
      `JSON file containing inputs and tx details ` +
      `(see admin-multi-send-update-srr.json for an example)`
    )
    .option(
      '-d, --dry-run',
      `output encoded tx's to a file but don't sign and broadcast them`,
      false
    )
    .option(
      '-b, --batch-size [size]',
      `transactions per batch (see MultiSend)`,
      50
    );
  program.parse(process.argv);

  const programOpts = program.opts();
  const { inputsFile, dryRun, batchSize } = programOpts;
  console.log(inputsFile)
  console.log(dryRun)
  console.log(batchSize)
  const { contractName, contractFunction, inputs } = JSON.parse(
    fs.readFileSync(inputsFile).toString()
  )

  if (contractName === 'StartrailRegistry') {
    suppressLoggerWarnings(hre.ethers);
  }
  const contractHandle = await getContract(hre, contractName);

  const encodedTransactionsAll = await encodeTransactions(contractHandle, contractFunction, inputs)
  console.log(`\nencoded ${encodedTransactionsAll.length} fix txs`)

  if (dryRun) {
    const dryRunOutputFile = '/tmp/encoded-transactions.json'
    console.log(`\nwriting encoded transactions to ${dryRunOutputFile}`)
    fs.writeFileSync(dryRunOutputFile, JSON.stringify(encodedTransactionsAll, null, 2))
    console.log(`done\n`)
    process.exit(2)
  }

  const encodedTransactionBatches = chunk(
    encodedTransactionsAll,
    batchSize
  );
  console.log(`multisend tx's split into ${encodedTransactionBatches.length} batches`)

  const admin = await getAdministratorInstance(hre);

  for (encodedTransactions of encodedTransactionBatches) {
    const txRsp = await sendMultiSendTx(admin, contractHandle.address, encodedTransactions)
    if (txRsp.status == 0) {
      console.error(`transaction failed (txHash: ${transactionHash})`)
      process.exit(1)
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });