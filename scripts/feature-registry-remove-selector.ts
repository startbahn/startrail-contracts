import { red } from 'colors'
import hre from 'hardhat'

import { StartrailCollectionFeatureRegistry } from '../typechain-types'
import { removeSelectors } from '../utils/collection/utils'
import { getContract } from '../utils/hardhat-helpers'

async function main() {
  if (process.argv.length < 3) {
    console.log(
      `Usage: HARDHAT_NETWORK=<network> npx ts-node ${process.argv[1]} ` +
        `<functionSelector>`
    )
    process.exit(-1)
  }

  const functionSelector = process.argv[2]

  const featureRegistry = (await getContract(
    hre,
    `StartrailCollectionFeatureRegistry`
  )) as StartrailCollectionFeatureRegistry

  await removeSelectors(featureRegistry, [functionSelector])
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(
      red(`\nFailure: ${error.toString()}\n\nstack: ${error.stack}`)
    )
    process.exit(1)
  })
