import { MetaTxRequestType } from '../../startrail-common-js/meta-tx/types'
import { registerRequestTypes } from '../register-request-types'
import { deployStartrailRegistry } from './deploy-startrail-registry'
import { deployBulk } from './deploy-bulk'
import { deployBulkIssue } from './deploy-bulk-issue'

const deployRoyaltyERC2981 = async (hre) => {
  console.log('\n=====   deployRoyaltyERC2981 invoked    ======\n')

  await deployStartrailRegistry(
    hre,
    `StartrailRegistryV19`,
    `IDGeneratorV3`,
    `OpenSeaMetaTransactionLibrary`,
    `StartrailRegistryLibraryV1`
  )

  await deployBulkIssue(hre, `BulkIssueV5`)
  await deployBulk(hre, `BulkV3`)

  await registerRequestTypes(hre, [
    MetaTxRequestType.StartrailRegistryUpdateSRRRoyalty,
    MetaTxRequestType.StartrailRegistryCreateSRRFromLicensedUserWithRoyalty,
    MetaTxRequestType.StartrailRegistryApproveSRRByCommitmentV2,
    MetaTxRequestType.StartrailRegistryApproveSRRByCommitmentWithCustomHistoryIdV2,
    MetaTxRequestType.StartrailRegistryTransferFromWithProvenanceV2
  ])
}

export { deployRoyaltyERC2981 }
