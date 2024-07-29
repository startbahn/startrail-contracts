// SPDX-License-Identifier: GPL-3.0-only

pragma solidity 0.8.21;

import "../../name/Contracts.sol";
import "./interfaces/IBulkFeatureV01.sol";
import "./ERC721FeatureV03.sol";
import "./erc721/LibERC721Storage.sol";

import "./shared/LibFeatureCommon.sol";
import "./shared/LibSRRApproveTransfer.sol";
import "./shared/LibSRRCreate.sol";
import "./shared/LibTransferWithProvenance.sol";

error OnlyBulkContract();

/**
 * @dev Handlers for performing actions from the Bulk contract.
 * These handlers trust the Bulk contract and perform the action if the
 * call came from the bulk contract.
 */
contract BulkFeatureV01 is IBulkFeatureV01, Contracts {
    function onlyBulk() private view {
        if (
            msg.sender !=
            INameRegistry(LibFeatureCommon.getNameRegistry()).get(BULK)
        ) {
            revert OnlyBulkContract();
        }
    }

    /**
     * @dev Ensures that the address is the owner of the specified SRR token.
     * @param toCheck The address to check against the owner of the SRR token.
     * @param tokenId Token Id.
     * @dev Reverts with `LibSRRApproveTransfer.NotSRROwner()` error if the toCheck is not the owner.
     */
    function onlySRROwner(address toCheck, uint256 tokenId) private view {
        LibERC721Storage.onlyExistingToken(tokenId);
        if (LibERC721Storage.layout().ownerOf[tokenId] != toCheck) {
            revert LibSRRApproveTransfer.NotSRROwner();
        }
    }

    /**
     * @inheritdoc IBulkFeatureV01
     */
    function createSRRFromBulk(
        bool isPrimaryIssuer,
        address artistAddress,
        string memory metadataCID,
        address issuerAddress,
        bool lockExternalTransfer,
        address royaltyReceiver,
        uint16 royaltyBasisPoints
    ) public override(IBulkFeatureV01) returns (uint256) {
        onlyBulk();
        LibFeatureCommon.onlyCollectionOwner(issuerAddress);
        return
            LibSRRCreate.createSRR(
                isPrimaryIssuer,
                artistAddress,
                metadataCID,
                issuerAddress,
                lockExternalTransfer,
                royaltyReceiver,
                royaltyBasisPoints,
                true
            );
    }

    /**
     * @inheritdoc IBulkFeatureV01
     */
    function approveSRRByCommitmentFromBulk(
        address signer,
        uint256 tokenId,
        bytes32 commitment,
        string memory historyMetadataHash,
        uint256 customHistoryId
    ) public override(IBulkFeatureV01) {
        onlyBulk();
        onlySRROwner(signer, tokenId);
        LibSRRApproveTransfer.approveSRRByCommitment(
            tokenId,
            commitment,
            historyMetadataHash,
            customHistoryId
        );
    }

    /**
     * @inheritdoc IBulkFeatureV01
     */
    function transferFromWithProvenanceFromBulk(
        address signer,
        address to,
        uint256 tokenId,
        string memory historyMetadataHash,
        uint256 customHistoryId,
        bool isIntermediary
    ) external override(IBulkFeatureV01) {
        onlyBulk();
        onlySRROwner(signer, tokenId);
        LibTransferWithProvenance.transferFromWithProvenance(
            to,
            tokenId,
            historyMetadataHash,
            customHistoryId,
            isIntermediary
        );
    }
}
