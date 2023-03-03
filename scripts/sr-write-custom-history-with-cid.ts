import { red } from 'colors'
import hre from 'hardhat'

import {
  getAdministratorInstance,
  getContract,
  suppressLoggerWarnings,
} from '../utils/hardhat-helpers'

async function main() {
  if (process.argv.length < 5) {
    console.log(`
Usage: HARDHAT_NETWORK=<network> npx ts-node scripts/sr-write-custom-history.js <historyName> <historyTypeId> <cid>
`)
    process.exit(-1)
  }

  const historyName = process.argv[2]
  const historyTypeId = process.argv[3]
  const metadataCID = process.argv[4]

  const adminContract = await getAdministratorInstance(hre)
  suppressLoggerWarnings(hre.ethers)
  const srContract = await getContract(hre, 'StartrailRegistry')

  const { data: writeHistoryCalldata } = await srContract.populateTransaction[
    `writeCustomHistory(string,uint256,string)`
  ](historyName, historyTypeId, metadataCID)
  console.log(
    `\nSending StartrailRegistry.writeCustomHistory transaction for ` +
      `[${historyName}]`
  )

  return adminContract.execTransaction({
    to: srContract.address,
    data: writeHistoryCalldata,
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
