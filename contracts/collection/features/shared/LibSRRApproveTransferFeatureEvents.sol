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

    event Provenance(
        uint256 indexed tokenId,
        address indexed from,
        address indexed to,
        string historyMetadataHash,
        string historyMetadataURI,
        bool isIntermediary
    );

    event Provenance(
        uint256 indexed tokenId,
        address indexed from,
        address indexed to,
        uint256 customHistoryId,
        string historyMetadataHash,
        string historyMetadataURI,
        bool isIntermediary
    );
}
