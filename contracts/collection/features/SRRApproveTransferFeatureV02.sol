// SPDX-License-Identifier: GPL-3.0-only

pragma solidity 0.8.28;

import "./interfaces/ISRRApproveTransferFeatureV02.sol";
import "./shared/LibFeatureCommonV01.sol";
import "./shared/LibSRRApproveTransferV01.sol";
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
contract SRRApproveTransferFeatureV02 is ISRRApproveTransferFeatureV02 {
    /**
     * Verify the caller is the owner of the token.
     */
    function onlySRROwner(uint256 tokenId) private view {
        LibERC721Storage.onlyExistingToken(tokenId);
        if (
            LibERC721Storage.layout().ownerOf[tokenId] !=
            LibFeatureCommonV01.msgSender()
        ) {
            revert LibSRRApproveTransferV01.NotSRROwner();
        }
    }

    /**
     * @inheritdoc ISRRApproveTransferFeatureV02
     */
    function approveSRRByCommitment(
        uint256 tokenId,
        bytes32 commitment,
        string memory historyMetadataHash,
        uint256 customHistoryId
    ) external override {
        onlySRROwner(tokenId);
        LibSRRApproveTransferV01.approveSRRByCommitment(
            tokenId,
            commitment,
            historyMetadataHash,
            customHistoryId
        );
    }

    /**
     * @inheritdoc ISRRApproveTransferFeatureV02
     */
    function approveSRRByCommitment(
        uint256 tokenId,
        bytes32 commitment,
        string memory historyMetadataHash
    ) external override {
        onlySRROwner(tokenId);
        LibSRRApproveTransferV01.approveSRRByCommitment(
            tokenId,
            commitment,
            historyMetadataHash,
            LibSRRApproveTransferV01.NO_CUSTOM_HISTORY
        );
    }

    /**
     * @inheritdoc ISRRApproveTransferFeatureV02
     */
    function cancelSRRCommitment(uint256 tokenId) external override {
        onlySRROwner(tokenId);
        _clearSRRCommitment(tokenId);
        emit SRRCommitmentCancelled(tokenId);
    }

    /**
     * @inheritdoc ISRRApproveTransferFeatureV02
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
            revert LibSRRApproveTransferV01.IncorrectRevealHash();
        }

        address from = LibERC721Storage.layout().ownerOf[tokenId];

        LibFeatureCommonV01.logProvenance(
            tokenId,
            from,
            to,
            approval.historyMetadataHash,
            approval.customHistoryId,
            isIntermediary
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
     * @inheritdoc ISRRApproveTransferFeatureV02
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
