// SPDX-License-Identifier: GPL-3.0-only

pragma solidity 0.8.13;

interface IERC721FeatureV01 {
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

    /**
     * @dev Safely transfers ownership of a token and logs Provenance.
     * The external transfer log is checked also.
     * @param to address to receive the ownership of the given token ID
     * @param tokenId uint256 ID of the token to be transferred
     * @param historyMetadataHash string of the history metadata digest or cid
     * @param customHistoryId to map with custom history
     * @param isIntermediary bool flag of the intermediary default is false
     */
    function transferFromWithProvenance(
        address to,
        uint256 tokenId,
        string memory historyMetadataHash,
        uint256 customHistoryId,
        bool isIntermediary
    ) external;
}
