// SPDX-License-Identifier: GPL-3.0-only

pragma solidity 0.8.28;

/**
 * @dev Events and Functions for the approve and transfer by commit reveal scheme.
 */
interface ISRRApproveTransferFeatureV03 {
    /*
     * Events
     */

    event SRRCommitment(
        uint256 indexed tokenId,
        bytes32 indexed commitment,
        address sender
    );

    event SRRCommitment(
        uint256 indexed tokenId,
        bytes32 indexed commitment,
        uint256 indexed customHistoryId,
        address sender
    );

    event SRRCommitmentCancelled(uint256 indexed tokenId, address sender);

    /*
     * Legacy Events
     * - were emitted in previous versions of the contract
     * - leave here so they appear in ABI and can be indexed by the subgraph
     */

    event SRRCommitment(uint256 indexed tokenId, bytes32 indexed commitment);

    event SRRCommitment(
        uint256 indexed tokenId,
        bytes32 indexed commitment,
        uint256 indexed customHistoryId
    );

    event SRRCommitmentCancelled(uint256 indexed tokenId);

    /**
     * @dev Register an approval to transfer ownership by commitment scheme
     * @param tokenId SRR id
     * @param commitment commitment hash
     * @param historyMetadataHash history metadata digest or cid
     */
    function approveSRRByCommitment(
        uint256 tokenId,
        bytes32 commitment,
        string memory historyMetadataHash
    ) external;

    /**
     * @dev Register an approval to transfer ownership by commitment scheme
     * @param tokenId SRR id
     * @param commitment commitment hash
     * @param historyMetadataHash history metadata digest or cid
     * @param customHistoryId custom history to link the transfer too
     */
    function approveSRRByCommitment(
        uint256 tokenId,
        bytes32 commitment,
        string memory historyMetadataHash,
        uint256 customHistoryId
    ) external;

    /**
     * @dev Transfers ownership by reveal hash
     * @param to new owner
     * @param reveal hash of this value must equal the commitment in the approval step
     * @param tokenId SRR id
     * @param isIntermediary true if party performing the transfer is an intermediatary
     */
    function transferSRRByReveal(
        address to,
        bytes32 reveal,
        uint256 tokenId,
        bool isIntermediary
    ) external;

    /**
     * @dev Cancels an approval by commitment
     * @param tokenId SRR id
     */
    function cancelSRRCommitment(uint256 tokenId) external;

    /**
     * @dev Gets details of an approval by commitment
     * @param tokenId SRR id
     * @return commitment hash of reveal
     * @return historyMetadataHash hash of metadata for transfer details
     * @return customHistoryId (optional) custom history to association
     */
    function getSRRCommitment(
        uint256 tokenId
    )
        external
        view
        returns (
            bytes32 commitment,
            string memory historyMetadataHash,
            uint256 customHistoryId
        );
}
