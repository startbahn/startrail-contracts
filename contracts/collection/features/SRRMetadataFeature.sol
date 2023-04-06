// SPDX-License-Identifier: GPL-3.0-only

pragma solidity 0.8.13;

import "./interfaces/ISRRMetadataFeature.sol";
import "./storage/LibSRRMetadataStorage.sol";
import "./shared/LibSRRMetadataEvents.sol";
import "./shared/LibFeatureCommon.sol";
import "./storage/LibSRRStorage.sol";

/**
 * @title Feature that enables srr's metadata can be updated
 *   for a given token.
 */
contract SRRMetadataFeature is ISRRMetadataFeature {
    /**
     * @inheritdoc ISRRMetadataFeature
     */
    function updateSRRMetadata(
        uint256 tokenId,
        string memory metadataCID
    ) external override {
        LibERC721Storage.onlyExistingToken(tokenId);

        if (LibFeatureCommon.isEmptyString(metadataCID)) {
            revert LibSRRMetadataStorage.SRRMetadataNotEmpty();
        }

        LibSRRStorage.SRR storage srr = LibSRRStorage.layout().srrs[tokenId];

        address sendingWallet = LibFeatureCommon.msgSender();
        if (
            sendingWallet != srr.issuer &&
            sendingWallet != srr.artist &&
            sendingWallet != LibFeatureCommon.getAdministrator()
        ) {
            revert LibFeatureCommon.OnlyIssuerOrArtistOrAdministrator();
        }

        LibSRRMetadataStorage.layout().srrs[tokenId] = metadataCID;

        emit LibSRRMetadataEvents.UpdateSRRMetadataDigest(tokenId, metadataCID);
    }

    /**
     * @inheritdoc ISRRMetadataFeature
     */
    function getSRRMetadata(
        uint256 tokenId
    ) external view returns (string memory metadataCID) {
        LibERC721Storage.onlyExistingToken(tokenId);

        return LibSRRMetadataStorage.layout().srrs[tokenId];
    }

    /**
     * @inheritdoc ISRRMetadataFeature
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
