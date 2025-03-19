// SPDX-License-Identifier: GPL-3.0-only

pragma solidity 0.8.28;

/**
 * @dev Handlers for performing actions from the Bulk contract.
 * These handlers trust the Bulk contract and perform the action if the
 * call came from the bulk contract.
 */
interface IBulkFeatureV03 {
    /**
     * @dev Issue an SRR where the caller is a Bulk contract
     * @param isPrimaryIssuer is issuer a primary issuer
     * @param artistAddress artist address
     * @param metadataCID ipfs cid of the metadata
     * @param issuerAddress issuer address
     * @param lockExternalTransfer bool of
     * @param to the address that the token will be transferred to after the creationbool of the flag to disable standard ERC721 transfer methods
     * @param royaltyReceiver royalty receiver
     * @param royaltyBasisPoints royalty basis points
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
    ) external returns (uint256);

    /**
     * @dev Register an approval to transfer ownership by commitment scheme
     *      where the caller is a Bulk contract
     * @param signer Bulk signer
     * @param tokenId Token Id
     * @param commitment commitment hash
     * @param historyMetadataHash history metadata digest or cid
     * @param customHistoryId custom history to link the transfer too
     */
    function approveSRRByCommitmentFromBulk(
        address signer,
        uint256 tokenId,
        bytes32 commitment,
        string memory historyMetadataHash,
        uint256 customHistoryId
    ) external;

    /**
     * @dev Perform an ownership transfer to a given address.
     * This function records the provenance at the same time as safeTransferFrom is executed.
     * @param signer Bulk signer
     * @param to new owner
     * @param tokenId Token Id
     * @param historyMetadataHash history metadata digest or cid
     * @param customHistoryId custom history to link the transfer too
     * @param isIntermediary was approve/transfer handled by an intermediary
     */
    function transferFromWithProvenanceFromBulk(
        address signer,
        address to,
        uint256 tokenId,
        string memory historyMetadataHash,
        uint256 customHistoryId,
        bool isIntermediary
    ) external;
}
