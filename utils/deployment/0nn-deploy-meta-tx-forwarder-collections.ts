import { MetaTxRequestType } from '../../startrail-common-js/meta-tx/meta-tx-request-registry'
import {
  CollectionFactory,
  StartrailCollectionFeatureRegistry,
} from '../../typechain-types'
import { deployCollectionsCore } from '../collection/deployment-actions'
import { registerRequestTypes } from '../register-request-types'
import { deployMetaTxForwarder } from './deploy-meta-tx-forwarder'

export const deployMetaTxForwarderCollections = async (
  hre,
  trustedForwarderOverride?: string
): Promise<{
  featureRegistry: StartrailCollectionFeatureRegistry
  collectionFactory: CollectionFactory
}> => {
  console.log('\n=====    deployMetaTxForwarderCollections invoked    ======\n')
  await deployMetaTxForwarder(hre, `MetaTxForwarderV3`)

  const deployedContracts = await deployCollectionsCore(
    hre,
    trustedForwarderOverride
  )

  await registerRequestTypes(hre, [
    // CollectionFactory
    MetaTxRequestType.CollectionFactoryCreateCollection,

    // Collections (proxies)
    MetaTxRequestType.CollectionCreateSRR,
    MetaTxRequestType.CollectionUpdateSRR,
    MetaTxRequestType.CollectionUpdateSRRMetadataWithCid,
    MetaTxRequestType.CollectionUpdateSRRRoyalty,
    MetaTxRequestType.CollectionApproveSRRByCommitmentV2,
    MetaTxRequestType.CollectionApproveSRRByCommitmentWithCustomHistoryIdV2,
    MetaTxRequestType.CollectionCancelSRRCommitment,
    MetaTxRequestType.CollectionAddHistory,
    MetaTxRequestType.CollectionSetLockExternalTransfer,
    MetaTxRequestType.CollectionTransferFromWithProvenanceV2,
    MetaTxRequestType.CollectionTransferOwnership,
  ])

  return deployedContracts
}
