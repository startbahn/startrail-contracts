import { red } from 'colors'
import hre from 'hardhat'

import { unregisterRequestTypeCallByAdmin } from '../utils/register-request-types'

async function main() {
  if (process.argv.length < 3) {
    console.log(`
Usage: HARDHAT_NETWORK=<network> npx ts-node scripts/meta-tx-unregister <metaTxTypeHash>
`)
    process.exit(-1)
  }

  const metaTxTypeHash = process.argv[2]
  await unregisterRequestTypeCallByAdmin(hre, metaTxTypeHash)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(
      red(`\nFailure: ${error.toString()}\n\nstack: ${error.stack}`)
    )
    process.exit(1)
  })
