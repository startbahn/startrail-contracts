// SPDX-License-Identifier: GPL-3.0-only

pragma solidity 0.8.21;

import {IERC721} from "@solidstate/contracts/interfaces/IERC721.sol";
import "../../lib/IDGeneratorV3.sol";
import "./interfaces/ISRRFeatureV02.sol";
import "./shared/LibFeatureCommon.sol";
import "./shared/LibSRRCreate.sol";
import "./storage/LibSRRStorage.sol";
import "./storage/LibERC2981RoyaltyStorage.sol";
import "./storage/LibSRRMetadataStorage.sol";
import "./storage/LibLockExternalTransferStorage.sol";
import "./erc721/LibERC721Storage.sol";

/**
 * @title Feature that enables standard ERC721 transfer methods to be disabled
 *   for a given token.
 */
contract SRRFeatureV02 is ISRRFeatureV02 {
    /**
     * @inheritdoc ISRRFeatureV02
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
        address issuerAddress = LibFeatureCommon.msgSender();
        uint256 tokenId = LibSRRCreate.createSRR(
            isPrimaryIssuer,
            artistAddress,
            metadataCID,
            issuerAddress,
            lockExternalTransfer,
            royaltyReceiver,
            royaltyBasisPoints,
            false
        );
        if (to != address(0)) {
            LibERC721Storage._transferFrom(issuerAddress, to, tokenId);
        }
    }

    /**
     * @inheritdoc ISRRFeatureV02
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
     * @inheritdoc ISRRFeatureV02
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
