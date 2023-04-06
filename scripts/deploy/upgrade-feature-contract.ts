import hre from 'hardhat'

import {
  upgradeERC2981RoyaltyFeature,
  upgradeSRRFeature,
} from '../../utils/collection/deployment-actions'

const upgradeFeatureContract = async (hre, contractName) => {
  console.log(`\nUpgrading feature contract ${contractName}:\n`)
  if (contractName === `SRRFeature`) {
    await upgradeSRRFeature(hre)
  } else if (contractName === `ERC2981RoyaltyFeature`) {
    await upgradeERC2981RoyaltyFeature(hre)
  } else {
    throw new Error(`Upgrade of ${contractName} not yet supported`)
  }
}

const featureContractName = process.argv[2]

upgradeFeatureContract(hre, featureContractName).catch((error) => {
  console.error(error)
  process.exit(1)
})
