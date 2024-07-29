import hre from 'hardhat'
import { StartrailFeatureEnum } from '../../utils/types'
import { upgradeFeatureContract } from '../../utils/collection/deployment-actions'

const featureName = process.argv[2]
const fromVersion = process.argv[3]
const toVersion = process.argv[4]

console.log(`
  Usage: HARDHAT_NETWORK=<network> npx ts-node scripts/deploy/upgrade-feature-contract.ts FeatureName fromVersion toVersion
`)

upgradeFeatureContract({
  hre,
  featureName: featureName as StartrailFeatureEnum,
  upgradeVersion: {
    from: fromVersion,
    to: toVersion,
  },
}).catch((error) => {
  console.error(error)
  process.exit(1)
})
