// SPDX-License-Identifier: GPL-3.0-only

pragma solidity 0.8.21;

library IDGenerator {
    uint256 private constant ID_CAP = 100000000;

    /**
     * @dev generate determined tokenId
     * @param metadataDigest bytes32 metadata digest of token
     * @return uint256 tokenId
     */
    function generate(bytes32 metadataDigest, address artistAddress)
        public
        pure
        returns (uint256)
    {
        return
            uint256(
                keccak256(abi.encodePacked(metadataDigest, artistAddress))
            ) % ID_CAP;
    }
}
