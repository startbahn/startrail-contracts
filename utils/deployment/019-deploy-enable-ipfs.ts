import { MetaTxRequestType } from '../../startrail-common-js/meta-tx/types'
import { deployStartrailRegistry } from './deploy-startrail-registry'
import { registerRequestTypes } from '../register-request-types'
import { deployBulk } from './deploy-bulk'
import { updateDeployJSON } from './deploy-json'
import { deployContract } from './deploy-contract'
import { deployBulkIssue } from './deploy-bulk-issue'
import { deployBulkTransfer } from './deploy-bulk-transfer'

/**
 * Deploy startrail, bulkIssue and bulk with ID generator v3 for IPFS CID.
 */

const deployEnableIPFS = async (hre) => {
  console.log('\n=====    deployEnableIPFS invoked    ======\n')

  const idGenerator = await deployContract(hre, 'IDGeneratorV3')
  updateDeployJSON(hre, { idGeneratorLibraryAddress: idGenerator.address })
  console.log(`IDGeneratorV3 library deployed: ${idGenerator.address}`)

  await deployStartrailRegistry(
    hre,
    `StartrailRegistryV18`,
    `IDGeneratorV3`,
    `OpenSeaMetaTransactionLibrary`,
    `StartrailRegistryLibraryV1`
  )

  await deployBulkIssue(hre, `BulkIssueV4`)
  await deployBulk(hre, `BulkV2`)
  await deployBulkTransfer(hre, `BulkTransferV2`)

  await registerRequestTypes(hre, [
    MetaTxRequestType.StartrailRegistryCreateSRRFromLicensedUserWithCid,
    MetaTxRequestType.StartrailRegistryUpdateSRRMetadataWithCid,
  ])
}

export { deployEnableIPFS }
