import { red } from 'colors'
import hre from 'hardhat'

import {
  getAdministratorInstance,
  getContract,
  suppressLoggerWarnings,
} from '../utils/hardhat-helpers'

async function main() {
  if (process.argv.length < 4) {
    console.log(
      `Usage: HARDHAT_NETWORK=<network> npx ts-node scripts/sr-update-custom-history.js <customHistoryId> <cid>`
    )
    process.exit(-1)
  }

  const historyId = process.argv[2]
  const name = process.argv[3]
  const metadataCID = process.argv[4]

  const adminContract = await getAdministratorInstance(hre)

  suppressLoggerWarnings(hre.ethers)
  const srContract = await getContract(hre, 'StartrailRegistry')

  const { data: updateHistoryCalldata } = await srContract.populateTransaction[
    `updateCustomHistory(uint256,string,string)`
  ](historyId, name, metadataCID)
  console.log(
    `\nSending StartrailRegistry.updateCustomHistory transaction for id: ` +
      `[${historyId}]`
  )

  return adminContract.execTransaction({
    to: srContract.address,
    data: updateHistoryCalldata,
    waitConfirmed: true,
  })
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(
      red(`\nFailure: ${error.toString()}\n\nstack: ${error.stack}`)
    )
    process.exit(1)
  })
