import { MetaTxRequestType } from '../../startrail-common-js/meta-tx/types'
import { HardhatRuntimeEnvironment } from 'hardhat/types'
import _ from 'lodash'
import { deployStartrailRegistry } from './deploy-startrail-registry'
import { deployBulk } from './deploy-bulk'
import { deployBulkIssue } from './deploy-bulk-issue'

import {
  registerRequestTypes,
  unregisterRequestTypesCallByAdmin,
} from '../register-request-types'

const deployRoyaltyRefactor = async (hre: HardhatRuntimeEnvironment) => {
  console.log('\n=====   deployRoyaltyRefactor invoked    ======\n')

  await deployStartrailRegistry(
    hre,
    `StartrailRegistryV22`,
    `IDGeneratorV3`,
    `OpenSeaMetaTransactionLibrary`,
    `StartrailRegistryLibraryV1`
  )

  await deployBulk(hre, `BulkV4`)

  // MetaTxRequestType is up-to-date on localhost, hardhat
  if (!_.includes(['localhost', 'hardhat'],  hre.network.name)) {
    // StartrailRegistryCreateSRRFromLicensedUserWithRoyalty: 0x89ddd5e5b12935384bffffa1d2fcaa0767f6aaf42823f725c16e2c3dc36d04e1
    // StartrailRegistryUpdateSRRRoyalty: 0x5be9b1e84327c6055e25bdec5e1eebee8ed9298b86b19994e011ccb8d95f0535
    await unregisterRequestTypesCallByAdmin(hre, [
      '0x89ddd5e5b12935384bffffa1d2fcaa0767f6aaf42823f725c16e2c3dc36d04e1',
      '0x5be9b1e84327c6055e25bdec5e1eebee8ed9298b86b19994e011ccb8d95f0535',
    ])

    await registerRequestTypes(hre, [
      MetaTxRequestType.StartrailRegistryCreateSRRFromLicensedUserWithRoyalty,
      MetaTxRequestType.StartrailRegistryUpdateSRRRoyalty,
    ])
  }
}

export { deployRoyaltyRefactor }
