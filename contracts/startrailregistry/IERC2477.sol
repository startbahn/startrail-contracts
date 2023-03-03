// SPDX-License-Identifier: GPL-3.0-only

pragma solidity 0.8.13;

interface IERC2477 {
    /**
     * @notice Get the cryptographic hash of the specified tokenID's metadata
     * @param tokenId Identifier for a specific token
     * @return digest Bytes returned from the hash algorithm, or "" if not available
     * @return hashAlgorithm The name of the cryptographic hash algorithm, or "" if not available
     */
    function tokenURIIntegrity(uint256 tokenId)
        external
        view
        returns (bytes memory digest, string memory hashAlgorithm);

    /**
     * @notice Get the cryptographic hash for the specified tokenID's metadata schema
     * @param tokenId Id of the Xcert.
     * @return digest Bytes returned from the hash algorithm, or "" if not available
     * @return hashAlgorithm The name of the cryptographic hash algorithm, or "" if not available
     */
    function tokenURISchemaIntegrity(uint256 tokenId)
        external
        view
        returns (bytes memory digest, string memory hashAlgorithm);
}
