// SPDX-License-Identifier: GPL-3.0-only

pragma solidity 0.8.28;

import "../../name/Contracts.sol";
import "./interfaces/IBulkFeatureV04.sol";
import "./erc721/LibERC721Storage.sol";

import "./shared/LibFeatureCommonV02.sol";
import "./shared/LibSRRApproveTransferV02.sol";
import "./shared/LibSRRCreate.sol";
import "./shared/LibTransferWithProvenanceV03.sol";

error OnlyBulkContract();

/**
 * @dev Handlers for performing actions from the Bulk contract.
 * These handlers trust the Bulk contract and perform the action if the
 * call came from the bulk contract.
 */
contract BulkFeatureV04 is IBulkFeatureV04, Contracts {
    function onlyBulk() private view {
        if (
            msg.sender !=
            INameRegistry(LibFeatureCommonV02.getNameRegistry()).get(BULK)
        ) {
            revert OnlyBulkContract();
        }
    }

    /**
     * @inheritdoc IBulkFeatureV04
     */
    function createSRRFromBulk(
        bool isPrimaryIssuer,
        address artistAddress,
        string memory metadataCID,
        address issuerAddress,
        bool lockExternalTransfer,
        address to,
        address royaltyReceiver,
        uint16 royaltyBasisPoints
    ) public override(IBulkFeatureV04) returns (uint256) {
        onlyBulk();
        LibFeatureCommonV02.onlyCollectionOwner(issuerAddress);
        uint256 tokenId = LibSRRCreate.createSRR(
            isPrimaryIssuer,
            artistAddress,
            metadataCID,
            issuerAddress,
            lockExternalTransfer,
            royaltyReceiver,
            royaltyBasisPoints,
            true
        );
        if (to != address(0)) {
            LibERC721Storage._transferFrom(issuerAddress, to, tokenId);
        }
        return tokenId;
    }

    /**
     * @inheritdoc IBulkFeatureV04
     */
    function approveSRRByCommitmentFromBulk(
        address signer,
        uint256 tokenId,
        bytes32 commitment,
        string memory historyMetadataHash,
        uint256 customHistoryId
    ) public override(IBulkFeatureV04) {
        onlyBulk();
        LibFeatureCommonV02.onlyCollectionOwnerOrSRROwner(signer, tokenId);
        LibSRRApproveTransferV02.approveSRRByCommitment(
            tokenId,
            commitment,
            historyMetadataHash,
            customHistoryId,
            signer
        );
    }

    /**
     * @inheritdoc IBulkFeatureV04
     */
    function transferFromWithProvenanceFromBulk(
        address signer,
        address to,
        uint256 tokenId,
        string memory historyMetadataHash,
        uint256 customHistoryId,
        bool isIntermediary
    ) external override(IBulkFeatureV04) {
        onlyBulk();
        LibFeatureCommonV02.onlyCollectionOwnerOrSRROwner(signer, tokenId);
        LibTransferWithProvenanceV03.transferFromWithProvenance(
            to,
            tokenId,
            historyMetadataHash,
            customHistoryId,
            isIntermediary,
            signer
        );
    }
}
