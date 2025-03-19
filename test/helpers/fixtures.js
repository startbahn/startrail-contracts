const hre = require('hardhat')

const {
  getContract,
  getAdministratorInstance,
} = require('../../utils/hardhat-helpers')
const { deployInitial } = require('../../utils/deployment/001-deploy-initial')
const {
  deployInitialBulkTransfer,
} = require('../../utils/deployment/002-deploy-bulk-transfer')
const {
  deployExhibitionHistory,
} = require('../../utils/deployment/003-deploy-exhibition-history')
const {
  deploySecondTransfer,
} = require('../../utils/deployment/004-deploy-second-transfer')
const {
  deployTransferFromEOAToEOA,
} = require('../../utils/deployment/005-deploy-transfer-from-eoa-to-eoa')
const {
  deployProvenanceCreatedAtFix,
} = require('../../utils/deployment/006-deploy-provenance-created-at-fix')
const {
  deployForMarketplaces,
} = require('../../utils/deployment/007-deploy-for-marketplaces')
const {
  deployBulkIssueEnhancement,
} = require('../../utils/deployment/008-deploy-bulk-issue-enhancement')
const { deployOwnable } = require('../../utils/deployment/009-deploy-ownable')
const {
  deployMetaTxPolygonOpenSea,
} = require('../../utils/deployment/010-deploy-meta-tx-polygon-opensea')
const { deployInitialBulk } = require('../../utils/deployment/011-deploy-bulk')
const {
  deployCreateSRRIssueToRecipient,
} = require('../../utils/deployment/012-deploy-create-srr-issue-to-recipient')
const {
  deployRenameRecipient,
} = require('../../utils/deployment/013-deploy-rename-recipient')
const {
  deployBytecodeReduction,
} = require('../../utils/deployment/014-deploy-bytecode-reduction')
const {
  deployCustomHistoryUpdate,
} = require('../../utils/deployment/015-deploy-custom-history-update')
const {
  deployUpdateSRRAddHistoryPermission,
} = require('../../utils/deployment/016-deploy-update-srr-add-history-permission')

const {
  deployAuditFixes,
} = require('../../utils/deployment/017-deploy-audit-fixes')
const {
  deployCustomHistoryNameUpdate,
} = require('../../utils/deployment/018-deploy-custom-history-name-update')
const {
  deployEnableIPFS,
} = require('../../utils/deployment/019-deploy-enable-ipfs')
const {
  deployRoyaltyERC2981,
} = require('../../utils/deployment/020-deploy-royalty-erc2981')
const {
  deployFixIPFSUrl,
} = require('../../utils/deployment/021-deploy-change-ipfs-url.ts')
const {
  deployRoyaltyReceiverMultiUpdate,
} = require('../../utils/deployment/022-deploy-royalty-receiver-multi-update')
const {
  deployRoyaltyRefactor,
} = require('../../utils/deployment/023-deploy-royalty-refactor')
const {
  deployCollections,
} = require('../../utils/deployment/024-deploy-collections')
const {
  deployFixTransferFromWithProvenance,
} = require('../../utils/deployment/025-deploy-fix-transfer-from-with-provenance')
const {
  deployBulkCollection,
} = require('../../utils/deployment/026-deploy-bulk-collection')
const {
  deployBulkIssueOnBuyer,
} = require('../../utils/deployment/027-deploy-bulk-issue-on-buyer')
const {
  deployCollectionSRRTransferPrivilegesUpdate,
} = require('../../utils/deployment/029-deploy-collection-srr-transfer-privileges-update')
const {
  deployFixCollectionLogProvenance,
} = require('../../utils/deployment/030-deploy-fix-collection-log-provenance')
/**
 * Deploys latest version of Startrail contracts plus some test data
 * is seeded.
 */
async function fixtureDefault() {
  await deployInitial(hre)
  await deployInitialBulkTransfer(hre)
  await deployExhibitionHistory(hre)
  await deploySecondTransfer(hre)
  await deployTransferFromEOAToEOA(hre)
  await deployProvenanceCreatedAtFix(hre)
  await deployForMarketplaces(hre)
  await deployBulkIssueEnhancement(hre)
  await deployOwnable(hre)
  await deployMetaTxPolygonOpenSea(hre)
  await deployInitialBulk(hre)
  await deployCreateSRRIssueToRecipient(hre)
  await deployRenameRecipient(hre)
  await deployBytecodeReduction(hre)
  await deployCustomHistoryUpdate(hre)
  await deployUpdateSRRAddHistoryPermission(hre)
  await deployAuditFixes(hre)
  await deployCustomHistoryNameUpdate(hre)
  await deployEnableIPFS(hre)
  await deployRoyaltyERC2981(hre)
  await deployFixIPFSUrl(hre)
  await deployRoyaltyReceiverMultiUpdate(hre)
  await deployRoyaltyRefactor(hre)
  await deployCollections(hre)
  await deployFixTransferFromWithProvenance(hre)
  await deployBulkCollection(hre)
  await deployBulkIssueOnBuyer(hre)
  await deployCollectionSRRTransferPrivilegesUpdate(hre)
  await deployFixCollectionLogProvenance(hre)

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
