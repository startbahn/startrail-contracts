import { HardhatRuntimeEnvironment } from 'hardhat/types'

import { upgradeFeatureContract } from '../collection/deployment-actions'
import { StartrailFeatureEnum } from '../types'

/**
 * Deploy collection srr transfer privilege update
 */
const deployCollectionSRRTransferPrivilegesUpdate = async (hre: HardhatRuntimeEnvironment) => {
  console.log('\n=====   deployCollectionSRRTransferPrivilegesUpdate invoked    ======\n')

  await upgradeFeatureContract({
    hre,
    featureName: StartrailFeatureEnum.SRRApproveTransferFeature,
    upgradeVersion: {
      from: 'V02',
      to: 'V03',
    },
  })

  await upgradeFeatureContract({
    hre,
    featureName: StartrailFeatureEnum.ERC721Feature,
    upgradeVersion: {
      from: 'V03',
      to: 'V04',
    },
  })

  await upgradeFeatureContract({
    hre,
    featureName: StartrailFeatureEnum.BulkFeature,
    upgradeVersion: {
      from: 'V02',
      to: 'V03',
    },
  })
}

export { deployCollectionSRRTransferPrivilegesUpdate }
