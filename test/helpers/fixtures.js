const hre = require("hardhat");

const { getContract, getAdministratorInstance } = require("../../utils/hardhat-helpers");
const { deployInitial } = require("../../utils/deployment/001-deploy-initial");
const {
  deployInitialBulkTransfer,
} = require("../../utils/deployment/002-deploy-bulk-transfer");
const {
  deployExhibitionHistory,
} = require("../../utils/deployment/003-deploy-exhibition-history");
const { deploySecondTransfer } = require("../../utils/deployment/004-deploy-second-transfer");
const { deployTransferFromEOAToEOA } = require("../../utils/deployment/005-deploy-transfer-from-eoa-to-eoa");
const { deployProvenanceCreatedAtFix } = require("../../utils/deployment/006-deploy-provenance-created-at-fix");
const { deployForMarketplaces } = require("../../utils/deployment/007-deploy-for-marketplaces");
const { deployBulkIssueEnhancement } = require("../../utils/deployment/008-deploy-bulk-issue-enhancement");
const { deployOwnable } = require("../../utils/deployment/009-deploy-ownable");
const { deployMetaTxPolygonOpenSea } = require("../../utils/deployment/010-deploy-meta-tx-polygon-opensea");
const { deployInitialBulk } = require("../../utils/deployment/011-deploy-bulk");
const { deployCreateSRRIssueToRecipient } = require("../../utils/deployment/012-deploy-create-srr-issue-to-recipient");
const { deployRenameRecipient } = require("../../utils/deployment/013-deploy-rename-recipient");
const { deployBytecodeReduction } = require("../../utils/deployment/014-deploy-bytecode-reduction");
const { deployCustomHistoryUpdate } = require("../../utils/deployment/015-deploy-custom-history-update");
const { deployUpdateSRRAddHistoryPermission } = require("../../utils/deployment/016-deploy-update-srr-add-history-permission");
const { deployAuditFixes } = require("../../utils/deployment/017-deploy-audit-fixes")

/**
 * Deploys latest version of Startrail contracts plus some test data
 * is seeded.
 */
async function fixtureDefault() {
  await deployInitial(hre);
  await deployInitialBulkTransfer(hre);
  await deployExhibitionHistory(hre);
  await deploySecondTransfer(hre);
  await deployTransferFromEOAToEOA(hre);
  await deployProvenanceCreatedAtFix(hre);
  await deployForMarketplaces(hre);
  await deployBulkIssueEnhancement(hre)
  await deployOwnable(hre);
  await deployMetaTxPolygonOpenSea(hre)
  await deployInitialBulk(hre);
  await deployCreateSRRIssueToRecipient(hre);
  await deployRenameRecipient(hre);
  await deployBytecodeReduction(hre)
  await deployCustomHistoryUpdate(hre);
  await deployUpdateSRRAddHistoryPermission(hre);
  await deployAuditFixes(hre);
  
  const lum = await getContract(hre, "LicensedUserManager");
  const metaTxForwarder = await getContract(hre, "MetaTxForwarder");
  const nameRegistry = await getContract(hre, "NameRegistry");
  const startrailRegistry = await getContract(hre, "StartrailRegistry");
  const bulkIssue = await getContract(hre, "BulkIssue");
  const bulkTransfer = await getContract(hre, "BulkTransfer");
  const bulk = await getContract(hre, "Bulk");
  const startrailProxyAdmin = await getContract(hre, "StartrailProxyAdmin");
  const administrator = await getAdministratorInstance(hre);

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
  };
}


module.exports = {
  fixtureDefault,
};
