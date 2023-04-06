import { red } from 'colors'
import hre from 'hardhat'
import { MetaTxRequestType } from '../startrail-common-js/meta-tx/types'

import { registerRequestTypes } from '../utils/register-request-types'

async function main() {
  if (process.argv.length < 3) {
    console.log(`
Usage: HARDHAT_NETWORK=<network> npx ts-node scripts/meta-tx-register <requestTypeKey>
`)
    process.exit(-1)
  }
  const requestTypeKey = process.argv[2] as MetaTxRequestType
  await registerRequestTypes(hre, [requestTypeKey])
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(
      red(`\nFailure: ${error.toString()}\n\nstack: ${error.stack}`)
    )
    process.exit(1)
  })
