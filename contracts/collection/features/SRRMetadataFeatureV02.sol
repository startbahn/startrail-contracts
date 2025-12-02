// SPDX-License-Identifier: GPL-3.0-only

pragma solidity 0.8.28;

import "./interfaces/ISRRMetadataFeatureV02.sol";
import "./storage/LibSRRMetadataStorage.sol";
import "./shared/LibSRRMetadataEvents.sol";
import "./shared/LibFeatureCommonV03.sol";
import "./storage/LibSRRStorage.sol";
import "../shared/LibEIP2771Or4337.sol";

/**
 * @title Feature that enables srr's metadata can be updated
 *   for a given token.
 */
contract SRRMetadataFeatureV02 is ISRRMetadataFeatureV02 {
    /**
     * @inheritdoc ISRRMetadataFeatureV02
     */
    function updateSRRMetadata(
        uint256 tokenId,
        string memory metadataCID
    ) external override {
        LibERC721Storage.onlyExistingToken(tokenId);

        if (LibFeatureCommonV03.isEmptyString(metadataCID)) {
            revert LibSRRMetadataStorage.SRRMetadataNotEmpty();
        }

        address sender = LibFeatureCommonV03.msgSender();
        bool isCollectionOwner = LibFeatureCommonV03.isCollectionOwner(sender);
        address aliasBackward = LibEIP2771Or4337
            .licensedUserManager(
                CollectionProxyStorage.layout().featureRegistry
            )
            .walletAddressAliasBackward(sender);

        LibSRRStorage.SRR storage srr = LibSRRStorage.layout().srrs[tokenId];

        if (
            !isCollectionOwner &&
            sender != srr.artist &&
            aliasBackward != srr.artist
        ) {
            revert LibFeatureCommonV03.OnlyArtistOrCollectionOwner();
        }

        LibSRRMetadataStorage.layout().srrs[tokenId] = metadataCID;

        emit LibSRRMetadataEvents.UpdateSRRMetadataDigest(tokenId, metadataCID);
    }

    /**
     * @inheritdoc ISRRMetadataFeatureV02
     */
    function getSRRMetadata(
        uint256 tokenId
    ) external view returns (string memory metadataCID) {
        LibERC721Storage.onlyExistingToken(tokenId);

        return LibSRRMetadataStorage.layout().srrs[tokenId];
    }

    /**
     * @inheritdoc ISRRMetadataFeatureV02
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
