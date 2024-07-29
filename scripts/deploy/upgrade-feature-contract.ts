import hre from 'hardhat'
import { upgradeFeatureContract } from './upgrade-feature-util'

const featureContractName = process.argv[2]

upgradeFeatureContract(hre, featureContractName).catch((error) => {
  console.error(error)
  process.exit(1)
})
