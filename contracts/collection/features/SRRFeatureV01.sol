// SPDX-License-Identifier: GPL-3.0-only

pragma solidity 0.8.21;

import {IERC721} from "@solidstate/contracts/interfaces/IERC721.sol";
import "../../lib/IDGeneratorV3.sol";
import "./interfaces/ISRRFeatureV01.sol";
import "./interfaces/IERC721FeatureV01.sol";
import "./shared/LibFeatureCommon.sol";
import "./storage/LibSRRStorage.sol";
import "./storage/LibERC2981RoyaltyStorage.sol";
import "./storage/LibSRRMetadataStorage.sol";
import "./storage/LibLockExternalTransferStorage.sol";
import "./erc721/LibERC721Storage.sol";

/**
 * @title Feature that enables standard ERC721 transfer methods to be disabled
 *   for a given token.
 */
contract SRRFeatureV01 is ISRRFeatureV01 {
    /**
     * @inheritdoc ISRRFeatureV01
     */
    function createSRR(
        bool isPrimaryIssuer,
        address artistAddress,
        string memory metadataCID,
        bool lockExternalTransfer,
        address to,
        address royaltyReceiver,
        uint16 royaltyBasisPoints
    ) external override {
        LibFeatureCommon.onlyTrustedForwarder();
        LibFeatureCommon.onlyCollectionOwner();

        if (LibFeatureCommon.isEmptyString(metadataCID)) {
            revert LibSRRMetadataStorage.SRRMetadataNotEmpty();
        }

        if (artistAddress == address(0)) {
            revert ZeroAddress();
        }

        if (royaltyReceiver != address(0)) {
            LibERC2981RoyaltyStorage.notToExceedSalePrice(royaltyBasisPoints);
        }

        uint256 tokenId = IDGeneratorV3.generate(metadataCID, artistAddress);
        LibERC721Storage.onlyNonExistantToken(tokenId);

        address issuer = LibFeatureCommon.msgSender();

        LibSRRStorage.SRR storage srr = LibSRRStorage.layout().srrs[tokenId];
        srr.isPrimaryIssuer = isPrimaryIssuer;
        srr.artist = artistAddress;
        srr.issuer = issuer;

        LibSRRMetadataStorage.layout().srrs[tokenId] = metadataCID;

        LibERC721Storage._mint(issuer, tokenId);

        // only if true - save gas as false already be set
        if (lockExternalTransfer) {
            LibLockExternalTransferStorage.layout().tokenIdToLockFlag[
                    tokenId
                ] = lockExternalTransfer;
        }

        emit CreateSRR(
            tokenId,
            SRR(isPrimaryIssuer, artistAddress, issuer),
            metadataCID,
            lockExternalTransfer
        );

        LibERC2981RoyaltyStorage.upsertRoyalty(
            tokenId,
            royaltyReceiver,
            royaltyBasisPoints
        );

        if (to != address(0)) {
            LibERC721Storage._transferFrom(issuer, to, tokenId);
        }
    }

    /**
     * @inheritdoc ISRRFeatureV01
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
     * @inheritdoc ISRRFeatureV01
     */
    function updateSRR(
        uint256 tokenId,
        bool isPrimaryIssuer,
        address artistAddress
    ) external override {
        LibFeatureCommon.onlyTrustedForwarder();
        LibERC721Storage.onlyExistingToken(tokenId);

        LibSRRStorage.SRR storage srr = LibSRRStorage.layout().srrs[tokenId];

        address sendingWallet = LibFeatureCommon.msgSender();
        if (
            sendingWallet != srr.issuer &&
            sendingWallet != srr.artist &&
            sendingWallet != LibFeatureCommon.getCollectionOwner()
        ) {
            revert LibFeatureCommon.OnlyIssuerOrArtistOrCollectionOwner();
        }

        if (artistAddress == address(0)) {
            revert ZeroAddress();
        }

        srr.isPrimaryIssuer = isPrimaryIssuer;
        srr.artist = artistAddress;

        emit UpdateSRR(tokenId, isPrimaryIssuer, artistAddress, sendingWallet);
    }
}
