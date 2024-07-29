// SPDX-License-Identifier: GPL-3.0-only

pragma solidity 0.8.21;

import "../storage/LibApproveTransferStorage.sol";

import "./LibFeatureCommon.sol";
import "./LibFeatureStartrailRegistry.sol";
import "./LibSRRApproveTransferFeatureEvents.sol";

library LibSRRApproveTransfer {
    error CustomHistoryDoesNotExist();
    error IncorrectRevealHash();
    error NotSRROwner();

    uint256 constant NO_CUSTOM_HISTORY = 0;

    function approveSRRByCommitment(
        uint256 tokenId,
        bytes32 commitment,
        string memory historyMetadataHash,
        uint256 customHistoryId
    ) internal {
        if (
            customHistoryId > 0 &&
            LibFeatureCommon.isEmptyString(
                LibFeatureStartrailRegistry
                    .getStartrailRegistry()
                    .getCustomHistoryNameById(customHistoryId)
            )
        ) {
            revert CustomHistoryDoesNotExist();
        }

        LibApproveTransferStorage.Approval
            storage approval = LibApproveTransferStorage.layout().approvals[
                tokenId
            ];

        // If approve has already been called then emit event that signifies
        // that prior approval is cancelled.
        if (approval.commitment != "") {
            emit LibSRRApproveTransferFeatureEvents.SRRCommitmentCancelled(
                tokenId
            );
        }

        approval.commitment = commitment;
        approval.historyMetadataHash = historyMetadataHash;

        if (customHistoryId == NO_CUSTOM_HISTORY) {
            emit LibSRRApproveTransferFeatureEvents.SRRCommitment(
                tokenId,
                commitment
            );
        } else {
            approval.customHistoryId = customHistoryId;
            emit LibSRRApproveTransferFeatureEvents.SRRCommitment(
                tokenId,
                commitment,
                customHistoryId
            );
        }
    }
}
