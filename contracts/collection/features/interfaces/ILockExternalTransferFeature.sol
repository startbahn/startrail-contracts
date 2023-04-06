// SPDX-License-Identifier: GPL-3.0-only

pragma solidity 0.8.13;

/**
 * @dev Flag enabling standard ERC721 transfer methods to be disabled for a
 * given token.
 */
interface ILockExternalTransferFeature {
    /**
     * @dev Set the lock flag for the given tokenId
     * @param tokenId NFT id
     * @param flag bool of the flag to disable standard ERC721 transfer methods
     */
    function setLockExternalTransfer(uint256 tokenId, bool flag) external;

    /**
     * @dev Get the flag setting for a given token id
     * @param tokenId NFT id
     * @return Flag value
     */
    function getLockExternalTransfer(
        uint256 tokenId
    ) external view returns (bool);
}
