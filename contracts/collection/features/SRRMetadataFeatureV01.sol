// SPDX-License-Identifier: GPL-3.0-only

pragma solidity 0.8.28;

import "./interfaces/ISRRMetadataFeatureV01.sol";
import "./storage/LibSRRMetadataStorage.sol";
import "./shared/LibSRRMetadataEvents.sol";
import "./shared/LibFeatureCommonV01.sol";
import "./storage/LibSRRStorage.sol";

/**
 * @title Feature that enables srr's metadata can be updated
 *   for a given token.
 */
contract SRRMetadataFeatureV01 is ISRRMetadataFeatureV01 {
    /**
     * @inheritdoc ISRRMetadataFeatureV01
     */
    function updateSRRMetadata(
        uint256 tokenId,
        string memory metadataCID
    ) external override {
        LibERC721Storage.onlyExistingToken(tokenId);

        if (LibFeatureCommonV01.isEmptyString(metadataCID)) {
            revert LibSRRMetadataStorage.SRRMetadataNotEmpty();
        }

        LibSRRStorage.SRR storage srr = LibSRRStorage.layout().srrs[tokenId];

        address sendingWallet = LibFeatureCommonV01.msgSender();
        if (
            sendingWallet != srr.issuer &&
            sendingWallet != srr.artist &&
            sendingWallet != LibFeatureCommonV01.getCollectionOwner()
        ) {
            revert LibFeatureCommonV01.OnlyIssuerOrArtistOrCollectionOwner();
        }

        LibSRRMetadataStorage.layout().srrs[tokenId] = metadataCID;

        emit LibSRRMetadataEvents.UpdateSRRMetadataDigest(tokenId, metadataCID);
    }

    /**
     * @inheritdoc ISRRMetadataFeatureV01
     */
    function getSRRMetadata(
        uint256 tokenId
    ) external view returns (string memory metadataCID) {
        LibERC721Storage.onlyExistingToken(tokenId);

        return LibSRRMetadataStorage.layout().srrs[tokenId];
    }

    /**
     * @inheritdoc ISRRMetadataFeatureV01
     */
    function tokenURI(
        uint256 tokenId
    ) external view virtual override returns (string memory) {
        LibERC721Storage.onlyExistingToken(tokenId);

        string memory metadataCID = LibSRRMetadataStorage.layout().srrs[
            tokenId
        ];
        return LibSRRMetadataStorage.buildTokenURI(metadataCID);
    }
}
