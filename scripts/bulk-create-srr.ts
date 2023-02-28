import { red } from 'colors'
import fs from 'fs'
import hre from 'hardhat'

import { loadDeployJSON } from '../utils/deployment/deploy-json'
import { getContract, parseLogs, waitTxHH } from '../utils/hardhat-helpers'

async function main() {
  if (process.argv.length < 3) {
    console.log(`
Usage: HARDHAT_NETWORK=<network> npx ts-node scripts/bulk-create-srr.js <bulk-create-srr.json>
    
bulk-create-srr.json example (see scripts/__data__ for files):
{
  "merkleProof": [
    "0xd52099a21174579061579bafe183269815438fdc78ee94938669cab94c907ef1",
    "0x2a53d5fe8652cae914ac184414a5bd911bc6a9f746b80fb819f14284024b6fe2"
  ],
  "merkleRoot": "0x04d4f6f30251d9af5f7a888dc57abbb28dd3ef6e337d93d05ac766b4d6c56a02",
  "srrHash": "0xf453e08dfbaf7d3d602726d6e88436f96e7f959ad49bdd108a20d03535c815b9",
  "isPrimaryIssuer": false,
  "artistAddress": "0x212Ffb315a6AdB0b1f106AEC74Aade67a6f3799F",
  "metadataDigest": "0x0f34e2f4762d796ab3eb29a60a39104de18e3589a9af573fc38f56753a21022f",
  "lockExternalTransfer": false
}
`);
    process.exit(-1);
  }

  const deployJSON = loadDeployJSON(hre);
  const bulk = await getContract(hre, "BulkIssue");

  const bulkCreateSRRInput = JSON.parse(
    fs.readFileSync(process.argv[2]).toString()
  );

  const transferResult = await bulk[
    "createSRRWithProof(bytes32[],bytes32,bytes32,bool,address,bytes32,bool)"
  ](...Object.values(bulkCreateSRRInput));
  const createReceipt = await waitTxHH(hre, transferResult, 0);
  console.log(
    `\nlogs: ${JSON.stringify(
      await parseLogs(hre, deployJSON, createReceipt.logs),
      null,
      2
    )}`
  );

  console.log(`\nstatus: ${createReceipt.status}\n`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(red(`\nFailure: ${error.toString()}\n`));
    process.exit(1);
  });
