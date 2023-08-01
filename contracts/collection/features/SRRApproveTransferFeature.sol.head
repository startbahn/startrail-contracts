// SPDX-License-Identifier: GPL-3.0-only

pragma solidity 0.8.13;

import "./interfaces/ISRRApproveTransferFeatureV01.sol";
import "./shared/LibFeatureCommon.sol";
import "./shared/LibFeatureStartrailRegistry.sol";
import "./shared/LibSRRApproveTransferFeatureEvents.sol";
import "./storage/LibApproveTransferStorage.sol";
import "./storage/LibSRRMetadataStorage.sol";

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
contract SRRApproveTransferFeatureV01 is ISRRApproveTransferFeatureV01 {
    uint256 constant NO_CUSTOM_HISTORY = 0;

    /**
     * Verify the caller is the owner of the token.
     */
    function onlySRROwner(uint256 tokenId) private view {
        LibERC721Storage.onlyExistingToken(tokenId);
        if (
            LibERC721Storage.layout().ownerOf[tokenId] !=
            LibFeatureCommon.msgSender()
        ) {
            revert NotSRROwner();
        }
    }

    /**
     * @inheritdoc ISRRApproveTransferFeatureV01
     */
    function approveSRRByCommitment(
        uint256 tokenId,
        bytes32 commitment,
        string memory historyMetadataHash,
        uint256 customHistoryId
    ) external override {
        onlySRROwner(tokenId);
        _approveSRRByCommitment(
            tokenId,
            commitment,
            historyMetadataHash,
            customHistoryId
        );
    }

    /**
     * @inheritdoc ISRRApproveTransferFeatureV01
     */
    function approveSRRByCommitment(
        uint256 tokenId,
        bytes32 commitment,
        string memory historyMetadataHash
    ) external override {
        onlySRROwner(tokenId);
        _approveSRRByCommitment(
            tokenId,
            commitment,
            historyMetadataHash,
            NO_CUSTOM_HISTORY
        );
    }

    /**
     * @inheritdoc ISRRApproveTransferFeatureV01
     */
    function approveSRRByCommitmentFromBulk(
        uint256 tokenId,
        bytes32 commitment,
        string memory historyMetadataHash,
        uint256 customHistoryId
    ) public override {
        // onlyBulk();
        _approveSRRByCommitment(
            tokenId,
            commitment,
            historyMetadataHash,
            customHistoryId
        );
    }

    /**
     * @inheritdoc ISRRApproveTransferFeatureV01
     */
    function cancelSRRCommitment(uint256 tokenId) external override {
        onlySRROwner(tokenId);
        _clearSRRCommitment(tokenId);
        emit LibSRRApproveTransferFeatureEvents.SRRCommitmentCancelled(tokenId);
    }

    /**
     * @inheritdoc ISRRApproveTransferFeatureV01
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
            revert IncorrectRevealHash();
        }

        address from = LibERC721Storage.layout().ownerOf[tokenId];

        LibFeatureCommon.logProvenance(
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
     * @inheritdoc ISRRApproveTransferFeatureV01
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

    function _approveSRRByCommitment(
        uint256 tokenId,
        bytes32 commitment,
        string memory historyMetadataHash,
        uint256 customHistoryId
    ) private {
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

    function _clearSRRCommitment(uint256 tokenId) private {
        delete LibApproveTransferStorage.layout().approvals[tokenId];
    }
}
