import { HardhatRuntimeEnvironment } from "hardhat/types"
import { deployInitial } from "../../../utils/deployment/001-deploy-initial"
import { deployInitialBulkTransfer } from "../../../utils/deployment/002-deploy-bulk-transfer"
import { deployExhibitionHistory } from "../../../utils/deployment/003-deploy-exhibition-history"
import { deploySecondTransfer } from "../../../utils/deployment/004-deploy-second-transfer"
import { deployTransferFromEOAToEOA } from "../../../utils/deployment/005-deploy-transfer-from-eoa-to-eoa"
import { deployProvenanceCreatedAtFix } from "../../../utils/deployment/006-deploy-provenance-created-at-fix"
import { deployForMarketplaces } from "../../../utils/deployment/007-deploy-for-marketplaces"
import { deployBulkIssueEnhancement } from "../../../utils/deployment/008-deploy-bulk-issue-enhancement"
import { deployOwnable } from "../../../utils/deployment/009-deploy-ownable"
import { deployMetaTxPolygonOpenSea } from "../../../utils/deployment/010-deploy-meta-tx-polygon-opensea"
import { deployInitialBulk } from "../../../utils/deployment/011-deploy-bulk"
import { deployCreateSRRIssueToRecipient } from "../../../utils/deployment/012-deploy-create-srr-issue-to-recipient"
import { deployRenameRecipient } from "../../../utils/deployment/013-deploy-rename-recipient"
import { deployBytecodeReduction } from "../../../utils/deployment/014-deploy-bytecode-reduction"
import { deployCustomHistoryUpdate } from "../../../utils/deployment/015-deploy-custom-history-update"
import { deployUpdateSRRAddHistoryPermission } from "../../../utils/deployment/016-deploy-update-srr-add-history-permission"
import { deployAuditFixes } from "../../../utils/deployment/017-deploy-audit-fixes"
import { deployCustomHistoryNameUpdate } from "../../../utils/deployment/018-deploy-custom-history-name-update"
import { deployEnableIPFS } from "../../../utils/deployment/019-deploy-enable-ipfs"
import { deployRoyaltyERC2981 } from "../../../utils/deployment/020-deploy-royalty-erc2981"
import { deployFixIPFSUrl } from "../../../utils/deployment/021-deploy-change-ipfs-url"
import { deployRoyaltyReceiverMultiUpdate } from "../../../utils/deployment/022-deploy-royalty-receiver-multi-update"
import { deployRoyaltyRefactor } from "../../../utils/deployment/023-deploy-royalty-refactor"
import { deployCollections } from "../../../utils/deployment/024-deploy-collections"
import { deployFixTransferFromWithProvenance } from "../../../utils/deployment/025-deploy-fix-transfer-from-with-provenance"
import { deployBulkCollection } from "../../../utils/deployment/026-deploy-bulk-collection"
import { deployBulkIssueOnBuyer } from "../../../utils/deployment/027-deploy-bulk-issue-on-buyer"
import { deployLicensedUserManagerV2 } from "../../../utils/deployment/028-deploy-luw-manager-v2"
import { deployCollectionSRRTransferPrivilegesUpdate } from "../../../utils/deployment/029-deploy-collection-srr-transfer-privileges-update"
import { deployFixCollectionLogProvenance } from "../../../utils/deployment/030-deploy-fix-collection-log-provenance"
import { deployLicensedUserManagerV3 } from "../../../utils/deployment/031-deploy-lu-manager-v3"

export const deployAll = async (hre: HardhatRuntimeEnvironment) => {
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
    await deployLicensedUserManagerV2(hre)
    await deployCollectionSRRTransferPrivilegesUpdate(hre)
    await deployFixCollectionLogProvenance(hre)
    await deployLicensedUserManagerV3(hre)
}