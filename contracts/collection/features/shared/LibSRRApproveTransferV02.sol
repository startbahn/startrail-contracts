// SPDX-License-Identifier: GPL-3.0-only

pragma solidity 0.8.28;

import "../storage/LibApproveTransferStorage.sol";
import "./LibFeatureCommonV02.sol";
import "./LibFeatureStartrailRegistry.sol";
import "../interfaces/ISRRApproveTransferFeatureV03.sol";

library LibSRRApproveTransferV02 {
    error CustomHistoryDoesNotExist();
    error IncorrectRevealHash();

    uint256 constant NO_CUSTOM_HISTORY = 0;

    function approveSRRByCommitment(
        uint256 tokenId,
        bytes32 commitment,
        string memory historyMetadataHash,
        uint256 customHistoryId,
        address sender
    ) internal {
        if (
            customHistoryId > 0 &&
            LibFeatureCommonV02.isEmptyString(
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
            emit ISRRApproveTransferFeatureV03.SRRCommitmentCancelled(
                tokenId,
                sender
            );
        }

        approval.commitment = commitment;
        approval.historyMetadataHash = historyMetadataHash;

        if (customHistoryId == NO_CUSTOM_HISTORY) {
            emit ISRRApproveTransferFeatureV03.SRRCommitment(
                tokenId,
                commitment,
                sender
            );
        } else {
            approval.customHistoryId = customHistoryId;
            emit ISRRApproveTransferFeatureV03.SRRCommitment(
                tokenId,
                commitment,
                customHistoryId,
                sender
            );
        }
    }
}
