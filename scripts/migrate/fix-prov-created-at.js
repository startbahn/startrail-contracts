const hre = require("hardhat");
const fs = require("fs");
const { chunk } = require("lodash/array");
const { Operation } = require("../../startrail-common-js/contracts/types");

const {
  getAdministratorInstance,
  getContract,
  suppressLoggerWarnings,
} = require("../../utils/hardhat-helpers");

const encodeFixProvTransactions = async (startrailRegistry, fixProvInputs) =>
  Promise.all(
    fixProvInputs.map(async (fix) => {
      const { tokenId, originalTimestamp } = fix
      const { data: calldata } =
        await startrailRegistry.populateTransaction.emitProvenanceDateMigrationFix(
          String(tokenId), String(originalTimestamp)
        );
      console.log(
        `Encoded emitProvenanceDateMigrationFix transaction for ` +
        `tokenId: ${tokenId} correct originTimestamp: ${originalTimestamp} `
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
    // don't wait - fire of all tx's first then wait after:
    waitConfirmed: false,
    gasLimit: 10000000,
  })
}

async function main() {
  if (process.argv.length < 4) {
    console.log(
      `\nUsage: node prov-created-at-fix/fix-prov-created-at.js ` +
      `<broken-prov.json> <sr-all-mainnet-events.7.json> [true|false]\n\n` +
      `If optional boolean = true, encoded transactions are written to ` +
      `a file but not run\n`
    );
    process.exit(-1);
  }

  const readJSON = (filename) => JSON.parse(
    fs.readFileSync(filename).toString()
  )
  const brokenProvs = readJSON(process.argv[2]).data.srrprovenances;
  const provMainnetEvents = readJSON(process.argv[3]).filter(e => e.signature.startsWith('Provenance'))
  const dryRun = "true" === process.argv[4] || false

  suppressLoggerWarnings(hre.ethers);
  const startrailRegistry = await getContract(hre, "StartrailRegistry");

  const fixProvInputs = brokenProvs.map(prov => {
    const tokenId = Number(prov.srr.id)
    const originalEvent = provMainnetEvents.find(e => Number(e.arguments[0].hex) === tokenId)
    const originalTimestamp = new Date(originalEvent.log.blockTimestamp * 1000)
    console.log(`srr[${prov.srr.id}] originalTimestamp=[${originalTimestamp}]`)
    return { tokenId, originalTimestamp: originalTimestamp.getTime() }
  })
  const encodedTransactions = await encodeFixProvTransactions(startrailRegistry, fixProvInputs)
  console.log(`\nencoded ${encodedTransactions.length} fix txs`)

  if (dryRun) {
    fs.writeFileSync('/tmp/prov-fixes.json', JSON.stringify(encodedTransactions, null, 2))
    process.exit(1)
  }

  const encodedTransactionBatches = chunk(
    encodedTransactions,
    51
  );
  console.log(`multisend tx's ${encodedTransactionBatches.length}`)


  const admin = await getAdministratorInstance(hre);
  await sendMultiSendTx(admin, startrailRegistry.address, encodedTransactions)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });