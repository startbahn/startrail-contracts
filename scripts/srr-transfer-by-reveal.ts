import { red } from 'colors'
import { Contract } from 'ethers'
import fs from 'fs'
import hre from 'hardhat'

import { TransactionReceipt } from '@ethersproject/abstract-provider'

import { loadDeployJSON } from '../utils/deployment/deploy-json'
import {
  getContract,
  parseLogs,
  suppressLoggerWarnings,
  waitTxHH,
} from '../utils/hardhat-helpers'

async function main() {
  if (process.argv.length < 3) {
    console.log(`
Usage: HARDHAT_NETWORK=<network> npx ts-node scripts/srr-transfer-by-reveal.js <transfer.json>
    
transfer.json example (see scripts/data for files):
{
  "destination": "0xd5A7E49B3cbe731838fcFfcEE5ce947497061585", // optional - set for collection
  "tokenId": 54962087,
  "revealHash": "0x5b3fe7fd204d1f0e7f502179c202a66dc74652e561135f569f063c86e04bc4a4",
  "toAddress": "0x96b25cE60a6628B3c63D9cF1a7C649EA3Aeb154C"
}
`)
    process.exit(-1)
  }

  const deployJSON = loadDeployJSON(hre)
  suppressLoggerWarnings(hre.ethers)

  const transferInput = JSON.parse(fs.readFileSync(process.argv[2]).toString())
  const { destination, toAddress, revealHash, tokenId, isIntermediary } =
    transferInput

  let collection: Contract
  if (destination) {
    collection = await hre.ethers.getContractAt(
      'CollectionProxyFeaturesAggregate',
      destination
    )
  } else {
    collection = await getContract(hre, 'StartrailRegistry')
  }

  const transferResult = await collection[
    'transferSRRByReveal(address,bytes32,uint256,bool)'
  ](toAddress, revealHash, tokenId, isIntermediary)

  const transferReceipt: TransactionReceipt = await waitTxHH(
    hre,
    transferResult,
    0
  )
  console.log(
    `\nlogs: ${JSON.stringify(
      await parseLogs(hre, deployJSON, transferReceipt.logs),
      null,
      2
    )}`
  )

  console.log(`\nstatus: ${transferReceipt.status}\n`)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(red(`\nFailure: ${error.toString()}\n`))
    process.exit(1)
  })
