import { HardhatRuntimeEnvironment } from 'hardhat/types'

import { StartrailCollectionFeatureRegistry } from '../../typechain-types'
import {
  deployFeatureContract,
  upgradeFeatureContract,
} from '../collection/deployment-actions'
import { getContract } from '../hardhat-helpers'
import { deployBulk } from './deploy-bulk'
import {
  registerRequestTypes,
  unregisterRequestTypesCallByAdmin,
} from '../register-request-types'
import { MetaTxRequestType } from '../../startrail-common-js/meta-tx/types'
import { StartrailFeatureEnum } from '../types'
const { deployStartrailRegistry } = require('./deploy-startrail-registry')

/**
 * Deploy upgrades to support actions on collections from the bulk contract.
 */
const deployBulkCollection = async (hre: HardhatRuntimeEnvironment) => {
  console.log('\n=====   deployBulkCollection invoked    ======\n')

  await deployStartrailRegistry(
    hre,
    `StartrailRegistryV24`,
    `IDGeneratorV3`,
    `OpenSeaMetaTransactionLibrary`,
    `StartrailRegistryLibraryV1`
  )

  // unregister deprecated forms
  await unregisterRequestTypesCallByAdmin(hre, [
    '0x80338e3adfe718efb7b49d26e987f9a1319d89701afc8cd1b35d6c4343db633d', // StartrailRegistryCreateSRRFromLicensedUserWithCid(address from,uint256 nonce,bytes data,bool isPrimaryIssuer,address artistAddress,bytes32 metadataDigest,string metadataCID,bool lockExternalTransfer,address to)"
    '0x98ce74b76cbcc5f7fc9d14949a70627b5dc8b6d1ff04fc70f34c4839ccdabf11', // StartrailRegistryCreateSRRWithLockExternalTransfer(address from,uint256 nonce,bool isPrimaryIssuer,address artistAddress,bytes32 metadataDigest,bool lockExternalTransfer)
    '0xdaf029518ea1e0c4b5517bda19381f793f3b9ca93174a70d7c688b717f8f9890', // StartrailRegistryCreateSRRFromLicensedUser(address from,uint256 nonce,bool isPrimaryIssuer,address artistAddress,bytes32 metadataDigest,bool lockExternalTransfer,address to)
    '0xd111846f191cf3c32ce6aedccf704a641a50381f22729d5a6cd5f13a0554ef80', // StartrailRegistryUpdateSRRMetadata(address from,uint256 nonce,uint256 tokenId,bytes32 metadataDigest)
  ])

  await registerRequestTypes(hre, [
    MetaTxRequestType.StartrailRegistryCreateSRRFromLicensedUserWithIPFSAndRoyalty,
  ])

  const featureRegistry = (await getContract(
    hre,
    `StartrailCollectionFeatureRegistry`
  )) as StartrailCollectionFeatureRegistry

  await upgradeFeatureContract({
    hre,
    featureName: StartrailFeatureEnum.ERC721Feature,
    upgradeVersion: {
      from: 'V03',
      to: 'V03',
    },
  })

  await upgradeFeatureContract({
    hre,
    featureName: StartrailFeatureEnum.SRRFeature,
    upgradeVersion: {
      from: 'V02',
      to: 'V02',
    },
  })

  await upgradeFeatureContract({
    hre,
    featureName: StartrailFeatureEnum.SRRApproveTransferFeature,
    upgradeVersion: {
      from: 'V02',
      to: 'V02',
    },
  })

  await upgradeFeatureContract({
    hre,
    featureName: StartrailFeatureEnum.ERC2981RoyaltyFeature,
    upgradeVersion: {
      from: 'V01',
      to: 'V01',
    },
  })

  await upgradeFeatureContract({
    hre,
    featureName: StartrailFeatureEnum.SRRMetadataFeature,
    upgradeVersion: {
      from: 'V01',
      to: 'V01',
    },
  })

  await upgradeFeatureContract({
    hre,
    featureName: StartrailFeatureEnum.LockExternalTransferFeature,
    upgradeVersion: {
      from: 'V01',
      to: 'V01',
    },
  })

  await upgradeFeatureContract({
    hre,
    featureName: StartrailFeatureEnum.SRRHistoryFeature,
    upgradeVersion: {
      from: 'V01',
      to: 'V01',
    },
  })

  await deployBulk(hre, `BulkV5`)

  await deployFeatureContract({
    featureRegistry,
    feature: {
      name: StartrailFeatureEnum.BulkFeature,
      version: 'V01',
    },
  })
}

export { deployBulkCollection }
