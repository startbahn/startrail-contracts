import { HardhatRuntimeEnvironment } from 'hardhat/types'

import { deployBulk } from './deploy-bulk'
import { unregisterRequestTypesCallByAdmin } from '../register-request-types'
import { upgradeFeatureContract } from '../collection/deployment-actions'
import { StartrailFeatureEnum } from '../types'

const { deployStartrailRegistry } = require('./deploy-startrail-registry')

/**
 * Deploy bulk issue on buyer
 */
const deployBulkIssueOnBuyer = async (hre: HardhatRuntimeEnvironment) => {
  console.log('\n=====   deployBulkIssueOnBuyer invoked    ======\n')

  await deployStartrailRegistry(
    hre,
    `StartrailRegistryV25`,
    `IDGeneratorV3`,
    `OpenSeaMetaTransactionLibrary`,
    `StartrailRegistryLibraryV1`
  )

  await unregisterRequestTypesCallByAdmin(hre, [
    '0xbef83078847679e2da773c6b3be6b96d45b196fe69acdd04f4a54671d57ff4aa', // StartrailRegistryCreateSRRFromLicensedUserWithRoyalty(address from,uint256 nonce,bytes data,bool isPrimaryIssuer,address artistAddress,bytes32 metadataDigest,string metadataCID,bool lockExternalTransfer,address to,address royaltyReceiver,uint16 royaltyBasisPoints)
  ])

  await deployBulk(hre, `BulkV6`)

  await upgradeFeatureContract({
    hre,
    featureName: StartrailFeatureEnum.BulkFeature,
    upgradeVersion: {
      from: 'V01',
      to: 'V02',
    },
  })
}

export { deployBulkIssueOnBuyer }
