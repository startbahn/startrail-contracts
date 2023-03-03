// SPDX-License-Identifier: GPL-3.0-only

pragma solidity 0.8.13;

/**
 * @dev Functions for the srr royalty info.
 *  Events are defined in ERC2981RoyaltyEvents.sol.
 *  Errors are defined in ERC2981RoyaltStorage.sol.
 *  Types are defined in ERC2981RoyaltyTypes.sol.
 */
interface IERC2981RoyaltyFeature {
    /**
     * @dev Updates the SRR Royalty
     * Only apply to srrs created with royalty info
     * @param tokenId uint256 of StartrailRegistryRecordID
     * @param royaltyReceiver royalty receiver
     * @param royaltyPercentage royalty percentage
     */
    function updateSRRRoyalty(
        uint256 tokenId,
        address royaltyReceiver,
        uint16 royaltyPercentage
    ) external;

    /**
     * @dev Updates the SRR Royalty Receiver from multi token ids
     * Only apply to srrs created with royalty info
     * @param tokenIds  token ids
     * @param royaltyReceiver royalty receiver
     */
    function updateSRRRoyaltyReceiverMulti(
        uint256[] calldata tokenIds,
        address royaltyReceiver
    ) external;

    /**
     * @dev Get the SRR Royalty
     * @param tokenId  token id
     * @return receiver royalty receiver
     * @return percentage royalty percentage
     */
    function getSRRRoyalty(
        uint256 tokenId
    ) external view returns (address receiver, uint16 percentage);
}
