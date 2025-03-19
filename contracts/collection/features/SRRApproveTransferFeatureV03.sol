// SPDX-License-Identifier: GPL-3.0-only

pragma solidity 0.8.28;

import "./interfaces/ISRRApproveTransferFeatureV03.sol";
import "./shared/LibFeatureCommonV02.sol";
import "./shared/LibTransferWithProvenanceV02.sol";
import "./shared/LibSRRApproveTransferV02.sol";
import "./storage/LibApproveTransferStorage.sol";

/**
 * @title Feature implementing approve and transfer by commitment.
 * @dev Enables token ownership transfers by a commitment scheme
 * (see https://en.wikipedia.org/wiki/Commitment_scheme).
 *
 * The owner generates a secret reveal and hashes it with keccak256 to create
 * the commitment hash. They then sign and execute an approveSRRByCommitment().
 *
 * Later the reveal hash is given to a buyer / new owner or intermiediatary who
 * can execute transferByReveal to transfer ownership.
 */
contract SRRApproveTransferFeatureV03 is ISRRApproveTransferFeatureV03 {
    /**
     * @inheritdoc ISRRApproveTransferFeatureV03
     */
    function approveSRRByCommitment(
        uint256 tokenId,
        bytes32 commitment,
        string memory historyMetadataHash,
        uint256 customHistoryId
    ) external override {
        address sender = LibFeatureCommonV02.msgSender();
        LibFeatureCommonV02.onlyCollectionOwnerOrSRROwner(sender, tokenId);
        LibSRRApproveTransferV02.approveSRRByCommitment(
            tokenId,
            commitment,
            historyMetadataHash,
            customHistoryId,
            sender
        );
    }

    /**
     * @inheritdoc ISRRApproveTransferFeatureV03
     */
    function approveSRRByCommitment(
        uint256 tokenId,
        bytes32 commitment,
        string memory historyMetadataHash
    ) external override {
        address sender = LibFeatureCommonV02.msgSender();
        LibFeatureCommonV02.onlyCollectionOwnerOrSRROwner(sender, tokenId);
        LibSRRApproveTransferV02.approveSRRByCommitment(
            tokenId,
            commitment,
            historyMetadataHash,
            LibSRRApproveTransferV02.NO_CUSTOM_HISTORY,
            sender
        );
    }

    /**
     * @inheritdoc ISRRApproveTransferFeatureV03
     */
    function cancelSRRCommitment(uint256 tokenId) external override {
        address sender = LibFeatureCommonV02.msgSender();
        LibFeatureCommonV02.onlyCollectionOwnerOrSRROwner(sender, tokenId);
        _clearSRRCommitment(tokenId);
        emit SRRCommitmentCancelled(tokenId, sender);
    }

    /**
     * @inheritdoc ISRRApproveTransferFeatureV03
     */
    function transferSRRByReveal(
        address to,
        bytes32 reveal,
        uint256 tokenId,
        bool isIntermediary
    ) external override {
        LibERC721Storage.onlyExistingToken(tokenId);

        LibApproveTransferStorage.Approval
            storage approval = LibApproveTransferStorage.layout().approvals[
                tokenId
            ];
        if (keccak256(abi.encode(reveal)) != approval.commitment) {
            revert LibSRRApproveTransferV02.IncorrectRevealHash();
        }

        address from = LibERC721Storage.layout().ownerOf[tokenId];

        address sender = LibFeatureCommonV02.msgSender();

        LibTransferWithProvenanceV02.logProvenance(
            tokenId,
            from,
            to,
            approval.historyMetadataHash,
            approval.customHistoryId,
            isIntermediary,
            sender
        );

        _clearSRRCommitment(tokenId);

        // NOTE: none of the checks made in ERC721Feature.transferFrom are made
        //   here because this is a transfer by commitment scheme. The
        //   necessary checks are made in this function and in the
        //   approveSRRByCommitment. So here we simply execute state updates to
        //   register the transfer and then emit the Transfer event.
        LibERC721Storage._transferFrom(from, to, tokenId);
    }

    /**
     * @inheritdoc ISRRApproveTransferFeatureV03
     */
    function getSRRCommitment(
        uint256 tokenId
    )
        external
        view
        override
        returns (
            bytes32 commitment,
            string memory historyMetadataHash,
            uint256 customHistoryId
        )
    {
        LibApproveTransferStorage.Approval
            storage approval = LibApproveTransferStorage.layout().approvals[
                tokenId
            ];
        return (
            approval.commitment,
            approval.historyMetadataHash,
            approval.customHistoryId
        );
    }

    function _clearSRRCommitment(uint256 tokenId) private {
        delete LibApproveTransferStorage.layout().approvals[tokenId];
    }
}
