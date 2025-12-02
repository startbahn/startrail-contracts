const hre = require('hardhat')

const {
  getContract,
  getAdministratorInstance,
} = require('../../utils/hardhat-helpers')

const { deployAll } = require('../../scripts/deploy/dev/deploy-all')

/**
 * Deploys latest version of Startrail contracts plus some test data
 * is seeded.
 */
async function fixtureDefault() {
  await deployAll(hre)

  const lum = await getContract(hre, 'LicensedUserManager')
  const metaTxForwarder = await getContract(hre, 'MetaTxForwarder')
  const nameRegistry = await getContract(hre, 'NameRegistry')
  const startrailRegistry = await getContract(hre, 'StartrailRegistry')
  const bulkIssue = await getContract(hre, 'BulkIssue')
  const bulkTransfer = await getContract(hre, 'BulkTransfer')
  const bulk = await getContract(hre, 'Bulk')
  const startrailProxyAdmin = await getContract(hre, 'StartrailProxyAdmin')
  const collectionFactory = await getContract(hre, 'CollectionFactory')
  const featureRegistry = await getContract(
    hre,
    'StartrailCollectionFeatureRegistry'
  )
  const administrator = await getAdministratorInstance(hre)

  return {
    // contract handles
    lum,
    metaTxForwarder,
    nameRegistry,
    startrailRegistry,
    bulkIssue,
    bulkTransfer,
    startrailProxyAdmin,
    administrator,
    // generalized bulk
    bulk,
    // collections
    collectionFactory,
    featureRegistry,
  }
}

module.exports = {
  fixtureDefault,
}
