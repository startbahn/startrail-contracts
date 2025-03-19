// SPDX-License-Identifier: GPL-3.0-only

pragma solidity 0.8.28;

import "../../../lib/IDGeneratorV3.sol";

import "../interfaces/ISRRFeatureV02.sol";
import "../storage/LibSRRStorage.sol";
import "../storage/LibERC2981RoyaltyStorage.sol";

import "./LibFeatureCommonV01.sol";

library LibSRRCreate {
    struct SRR {
        bool isPrimaryIssuer;
        address artistAddress;
        address issuer;
    }

    event CreateSRR(
        uint256 indexed tokenId,
        SRR registryRecord,
        string metadataCID,
        bool lockExternalTransfer
    );

    /**
     * @dev Creates a new SRR.
     * @param isPrimaryIssuer  boolean whether the user is a primary issuer.
     * @param artistAddress address of the artist contract.
     * @param metadataCID  string of ipfs cid.
     * @param issuerAddress address of the issuer.
     * @param lockExternalTransfer bool of the transfer permission flag to marketplaces.
     * @param royaltyReceiver address of royalty receiver.
     * @param royaltyBasisPoints royalty basis points.
     * @param fromBulk boolean whether the function is called from a bulk or SRRFeature
     * @return tokenId token id.
     */
    function createSRR(
        bool isPrimaryIssuer,
        address artistAddress,
        string memory metadataCID,
        address issuerAddress,
        bool lockExternalTransfer,
        address royaltyReceiver,
        uint16 royaltyBasisPoints,
        bool fromBulk
    ) internal returns (uint256 tokenId) {
        if (!fromBulk) {
            LibFeatureCommonV01.onlyTrustedForwarder();
            LibFeatureCommonV01.onlyCollectionOwner();
        }

        if (LibFeatureCommonV01.isEmptyString(metadataCID)) {
            revert LibSRRMetadataStorage.SRRMetadataNotEmpty();
        }

        if (artistAddress == address(0)) {
            revert ISRRFeatureV02.ZeroAddress();
        }

        if (royaltyReceiver != address(0)) {
            LibERC2981RoyaltyStorage.notToExceedSalePrice(royaltyBasisPoints);
        }

        tokenId = IDGeneratorV3.generate(metadataCID, artistAddress);
        LibERC721Storage.onlyNonExistantToken(tokenId);

        LibSRRStorage.SRR storage srr = LibSRRStorage.layout().srrs[tokenId];
        srr.isPrimaryIssuer = isPrimaryIssuer;
        srr.artist = artistAddress;
        srr.issuer = issuerAddress;

        LibSRRMetadataStorage.layout().srrs[tokenId] = metadataCID;

        LibERC721Storage._mint(issuerAddress, tokenId);

        // only if true - save gas as false already be set
        if (lockExternalTransfer) {
            LibLockExternalTransferStorage.layout().tokenIdToLockFlag[
                tokenId
            ] = lockExternalTransfer;
        }

        emit CreateSRR(
            tokenId,
            SRR(isPrimaryIssuer, artistAddress, issuerAddress),
            metadataCID,
            lockExternalTransfer
        );

        LibERC2981RoyaltyStorage.upsertRoyalty(
            tokenId,
            royaltyReceiver,
            royaltyBasisPoints
        );
    }
}
