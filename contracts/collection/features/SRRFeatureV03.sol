// SPDX-License-Identifier: GPL-3.0-only

pragma solidity 0.8.28;

import {IERC721} from "@solidstate/contracts/interfaces/IERC721.sol";
import "../../lib/IDGeneratorV3.sol";
import "./interfaces/ISRRFeatureV03.sol";
import "./shared/LibFeatureCommonV03.sol";
import "./shared/LibSRRCreateV02.sol";
import "./storage/LibSRRStorage.sol";
import "./storage/LibERC2981RoyaltyStorage.sol";
import "./storage/LibSRRMetadataStorage.sol";
import "./storage/LibLockExternalTransferStorage.sol";
import "./erc721/LibERC721Storage.sol";

/**
 * @title Feature that enables standard ERC721 transfer methods to be disabled
 *   for a given token.
 */
contract SRRFeatureV03 is ISRRFeatureV03 {
    /**
     * @inheritdoc ISRRFeatureV03
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
        address issuerAddress = LibFeatureCommonV03.msgSender();
        uint256 tokenId = LibSRRCreateV02.createSRR(
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
     * @inheritdoc ISRRFeatureV03
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
     * @inheritdoc ISRRFeatureV03
     */
    function updateSRR(
        uint256 tokenId,
        bool isPrimaryIssuer,
        address artistAddress
    ) external override {
        LibFeatureCommonV03.onlyLicensedUser();
        LibERC721Storage.onlyExistingToken(tokenId);

        LibSRRStorage.SRR storage srr = LibSRRStorage.layout().srrs[tokenId];

        address sendingWallet = LibFeatureCommonV03.msgSender();
        if (
            sendingWallet != srr.issuer &&
            sendingWallet != srr.artist &&
            sendingWallet != LibFeatureCommonV03.getCollectionOwner()
        ) {
            revert LibFeatureCommonV03.OnlyArtistOrCollectionOwner();
        }

        if (artistAddress == address(0)) {
            revert ZeroAddress();
        }

        srr.isPrimaryIssuer = isPrimaryIssuer;
        srr.artist = artistAddress;

        emit UpdateSRR(tokenId, isPrimaryIssuer, artistAddress, sendingWallet);
    }
}
