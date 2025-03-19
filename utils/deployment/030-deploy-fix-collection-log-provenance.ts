import { HardhatRuntimeEnvironment } from 'hardhat/types'

import { upgradeFeatureContract } from '../collection/deployment-actions'
import { StartrailFeatureEnum } from '../types'

/**
 * Deploy fix collection log provenance
 */
const deployFixCollectionLogProvenance = async (hre: HardhatRuntimeEnvironment) => {
  console.log('\n=====   deployFixCollectionLogProvenance invoked    ======\n')

  await upgradeFeatureContract({
    hre,
    featureName: StartrailFeatureEnum.SRRApproveTransferFeature,
    upgradeVersion: {
      from: 'V03',
      to: 'V04',
    },
  })
}

export { deployFixCollectionLogProvenance }
