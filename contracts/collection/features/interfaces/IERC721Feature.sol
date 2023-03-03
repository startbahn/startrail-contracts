// SPDX-License-Identifier: GPL-3.0-only

pragma solidity 0.8.13;

interface IERC721Feature {
    /**
     * @dev ERC721 initializer to set the name and symbol
     */
    function __ERC721Feature_initialize(
        string memory name,
        string memory symbol
    ) external;

    /**
     * @dev See if token with given id exists
     * Externalize this for other feature contracts to verify token existance.
     * @param tokenId NFT id
     * @return true if token exists
     */
    function exists(uint256 tokenId) external view returns (bool);
}
