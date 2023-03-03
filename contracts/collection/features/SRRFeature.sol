// SPDX-License-Identifier: GPL-3.0-only

pragma solidity 0.8.13;

import "../../lib/IDGeneratorV3.sol";
import "./interfaces/ISRRFeature.sol";
import "./interfaces/IERC721Feature.sol";
import "./shared/LibFeatureCommon.sol";
import "./storage/LibSRRStorage.sol";
import "./storage/LibERC2981RoyaltyStorage.sol";

/**
 * @title Feature that enables standard ERC721 transfer methods to be disabled
 *   for a given token.
 */
contract SRRFeature is ISRRFeature {
    /**
     * @inheritdoc ISRRFeature
     */
    function createSRR(
        bool isPrimaryIssuer,
        address artistAddress,
        string memory metadataCID,
        bool lockExternalTransfer,
        address to,
        address royaltyReceiver,
        uint16 royaltyPercentage
    ) external override {
        // suppress unused variable warnings until they are used below:
        lockExternalTransfer;
        to;
        royaltyReceiver;
        royaltyPercentage;

        LibFeatureCommon.onlyTrustedForwarder();
        LibFeatureCommon.onlyOwner();

        if (LibFeatureCommon.isEmptyString(metadataCID)) {
            revert MetadataEmpty();
        }

        if (artistAddress == address(0)) {
            revert ZeroAddress();
        }

        LibERC2981RoyaltyStorage.notToExceedSalePrice(royaltyPercentage);

        uint256 tokenId = IDGeneratorV3.generate(metadataCID, artistAddress);
        LibERC721Storage.onlyNonExistantToken(tokenId);

        address issuer = LibFeatureCommon.msgSender();

        LibSRRStorage.SRR storage srr = LibSRRStorage.layout().srrs[tokenId];
        srr.isPrimaryIssuer = isPrimaryIssuer;
        srr.artist = artistAddress;
        srr.issuer = issuer;

        LibERC721Storage._mint(issuer, tokenId);

        // TODO: uncomment this to support transfer after mint to `to`
        // if (to != address(0)) {
        //   IERC721(address(this)).transfer(issuer, to, tokenId);
        // }

        // TODO: write to lockExternalTransfer (only if true? save gas as false already be set...)

        emit CreateSRR(
            tokenId,
            SRR(isPrimaryIssuer, artistAddress, issuer),
            metadataCID,
            lockExternalTransfer
        );

        LibERC2981RoyaltyStorage.upsertRoyalty(
            tokenId,
            royaltyReceiver,
            royaltyPercentage
        );
    }

    /**
     * @inheritdoc ISRRFeature
     */
    function getSRR(
        uint256 tokenId
    )
        external
        view
        override
        returns (bool isPrimaryIssuer, address artist, address issuer)
    {
        LibSRRStorage.SRR storage srr = LibSRRStorage.layout().srrs[tokenId];
        return (srr.isPrimaryIssuer, srr.artist, srr.issuer);
    }

    /**
     * @inheritdoc ISRRFeature
     */
    function updateSRR(
        uint256 tokenId,
        bool isPrimaryIssuer,
        address artistAddress
    ) external override {
        LibERC721Storage.onlyExistingToken(tokenId);

        LibSRRStorage.SRR storage srr = LibSRRStorage.layout().srrs[tokenId];

        address sendingWallet = LibFeatureCommon.msgSender();
        if (
            sendingWallet != srr.issuer &&
            sendingWallet != srr.artist &&
            sendingWallet != LibFeatureCommon.getAdministrator()
        ) {
            revert OnlyIssuerOrArtistOrAdministrator();
        }

        if (artistAddress == address(0)) {
            revert ZeroAddress();
        }

        srr.isPrimaryIssuer = isPrimaryIssuer;
        srr.artist = artistAddress;

        emit UpdateSRR(tokenId, isPrimaryIssuer, artistAddress, sendingWallet);
    }
}
