// SPDX-License-Identifier: GPL-3.0-only
pragma solidity 0.8.13;

library LibSRRApproveTransferFeatureEvents {
    event SRRCommitment(uint256 indexed tokenId, bytes32 indexed commitment);

    event SRRCommitment(
        uint256 indexed tokenId,
        bytes32 indexed commitment,
        uint256 indexed customHistoryId
    );

    event SRRCommitmentCancelled(uint256 indexed tokenId);
}
