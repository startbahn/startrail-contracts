// SPDX-License-Identifier: GPL-3.0-only

pragma solidity 0.8.28;

import "../../name/Contracts.sol";
import "./interfaces/IBulkFeatureV02.sol";
import "./erc721/LibERC721Storage.sol";

import "./shared/LibFeatureCommonV01.sol";
import "./shared/LibSRRApproveTransferV01.sol";
import "./shared/LibSRRCreate.sol";
import "./shared/LibTransferWithProvenanceV01.sol";

error OnlyBulkContract();

/**
 * @dev Handlers for performing actions from the Bulk contract.
 * These handlers trust the Bulk contract and perform the action if the
 * call came from the bulk contract.
 */
contract BulkFeatureV02 is IBulkFeatureV02, Contracts {
    function onlyBulk() private view {
        if (
            msg.sender !=
            INameRegistry(LibFeatureCommonV01.getNameRegistry()).get(BULK)
        ) {
            revert OnlyBulkContract();
        }
    }

    /**
     * @dev Ensures that the address is the owner of the specified SRR token.
     * @param toCheck The address to check against the owner of the SRR token.
     * @param tokenId Token Id.
     * @dev Reverts with `LibSRRApproveTransferV01.NotSRROwner()` error if the toCheck is not the owner.
     */
    function onlySRROwner(address toCheck, uint256 tokenId) private view {
        LibERC721Storage.onlyExistingToken(tokenId);
        if (LibERC721Storage.layout().ownerOf[tokenId] != toCheck) {
            revert LibSRRApproveTransferV01.NotSRROwner();
        }
    }

    /**
     * @inheritdoc IBulkFeatureV02
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
    ) public override(IBulkFeatureV02) returns (uint256) {
        onlyBulk();
        LibFeatureCommonV01.onlyCollectionOwner(issuerAddress);
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
     * @inheritdoc IBulkFeatureV02
     */
    function approveSRRByCommitmentFromBulk(
        address signer,
        uint256 tokenId,
        bytes32 commitment,
        string memory historyMetadataHash,
        uint256 customHistoryId
    ) public override(IBulkFeatureV02) {
        onlyBulk();
        onlySRROwner(signer, tokenId);
        LibSRRApproveTransferV01.approveSRRByCommitment(
            tokenId,
            commitment,
            historyMetadataHash,
            customHistoryId
        );
    }

    /**
     * @inheritdoc IBulkFeatureV02
     */
    function transferFromWithProvenanceFromBulk(
        address signer,
        address to,
        uint256 tokenId,
        string memory historyMetadataHash,
        uint256 customHistoryId,
        bool isIntermediary
    ) external override(IBulkFeatureV02) {
        onlyBulk();
        onlySRROwner(signer, tokenId);
        LibTransferWithProvenanceV01.transferFromWithProvenance(
            to,
            tokenId,
            historyMetadataHash,
            customHistoryId,
            isIntermediary
        );
    }
}
