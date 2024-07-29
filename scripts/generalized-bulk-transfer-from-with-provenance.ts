import { red } from 'colors'
import fs from 'fs'
import hre from 'hardhat'

import { loadDeployJSON } from '../utils/deployment/deploy-json'
import { getContract, parseLogs, waitTxHH } from '../utils/hardhat-helpers'

async function main() {
  if (process.argv.length < 3) {
    console.log(`
Usage: HARDHAT_NETWORK=<network> npx ts-node scripts/generalized-bulk-transfer-from-with-provenance.ts <generalized-bulk-transfer-from-with-provenance.json>
    
generalized-bulk-transfer-from-with-provenance.json example (see scripts/__data__ for files):
{
  "merkleProof": [
    "0x5dff4266f45820d2517539dba44061a3be1d8598165bb5fdbd79a9ba8774bb8d"
  ],
  "merkleRoot": "0xb3dbc1f0288b569840937cab66645f22b0cac106920c3b9272a968fae9472ac7",
  "leafHash": "0x1ba60a60bfd7e56f4dbd085904da7fded34aa806f31f927e83c2dbc8bdc0257f",
  "to": "0x88f7c48e2A696276D13004c7bd32EAE05E4f2bE1",
  "tokenId": 333561554987,
  "historyMetadataHash": "0xe515947139053d36f28e833667f77df096b1dd3ecdd0146bce6cc5fa38700615",
  "customHistoryId": 0,
  "isIntermediary": false
}
`)
    process.exit(-1)
  }

  const deployJSON = loadDeployJSON(hre)
  const bulk = await getContract(hre, 'Bulk')

  const bulkInput = JSON.parse(fs.readFileSync(process.argv[2]).toString())

  const transferResult = await bulk[
    'transferFromWithProvenanceWithProof(bytes32[],bytes32,bytes32,address,uint256,string,uint256,bool,address)'
  ](...Object.values(bulkInput))
  const txReceipt = await waitTxHH(hre, transferResult, 0)
  console.log(
    `\nlogs: ${JSON.stringify(
      await parseLogs(hre, deployJSON, txReceipt.logs),
      null,
      2
    )}`
  )

  console.log(`\nstatus: ${txReceipt.status}\n`)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(red(`\nFailure: ${error.toString()}\n`))
    process.exit(1)
  })
