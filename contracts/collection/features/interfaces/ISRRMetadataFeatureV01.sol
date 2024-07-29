// SPDX-License-Identifier: GPL-3.0-only

pragma solidity 0.8.21;

/**
 * @dev Functions for the srr metadata feature.
 *  Events are defined in LibSRRMetadataEvents.sol.
 *  Errors are defined in LibSRRMetadataStorage.sol.
 */
interface ISRRMetadataFeatureV01 {
    /**
     * @dev Update the SRR Metadata
     * @param tokenId uint256 of StartrailRegistryRecordID
     * @param metadataCID string of ipfs cid
     */
    function updateSRRMetadata(
        uint256 tokenId,
        string memory metadataCID
    ) external;

    /**
     * @dev Get the SRR Metadata
     * @param tokenId  token id
     * @return metadataCID string of ipfs cid
     */
    function getSRRMetadata(
        uint256 tokenId
    ) external view returns (string memory metadataCID);

    /**
     * @dev Get token uri
     * @param tokenId uint256 of StartrailRegistryRecordID
     * @return uri token uri
     */
    function tokenURI(
        uint256 tokenId
    ) external view returns (string memory uri);
}
