import fs from 'fs'
import hre from 'hardhat'

import {
  getAdministratorInstance,
  suppressLoggerWarnings,
} from '../utils/hardhat-helpers'

async function main() {
  if (process.argv.length < 3) {
    console.log(`
Usage: HARDHAT_NETWORK=<network> npx ts-node scripts/srr-update-royalty.js <update-royalty.json>
`)
    process.exit(-1)
  }

  const transferInput = JSON.parse(fs.readFileSync(process.argv[2]).toString())
  const { destination, tokenId, royaltyReceiver, royaltyBasisPoints } =
    transferInput

  console.log(
    `\n\n---  Update Royalty [Collection ${destination}, Token ${tokenId}]  ---\n`
  )

  suppressLoggerWarnings(hre.ethers)
  const collection = await hre.ethers.getContractAt(
    'CollectionProxyFeaturesAggregate',
    destination
  )
  const { data: calldata } =
    await collection.populateTransaction.updateSRRRoyalty(
      tokenId,
      royaltyReceiver,
      royaltyBasisPoints
    )

  const admin = await getAdministratorInstance(hre)
  await admin.execTransaction({
    to: destination,
    data: calldata,
  })

  console.log(`\nUpdated royalty.\n`)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
