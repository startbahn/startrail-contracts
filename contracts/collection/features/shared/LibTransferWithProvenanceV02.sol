// SPDX-License-Identifier: GPL-3.0-only

pragma solidity 0.8.28;

import "./LibFeatureCommonV02.sol";
import "../erc721/LibERC721Storage.sol";
import "../storage/LibSRRMetadataStorage.sol";
import "../interfaces/IERC721FeatureV04.sol";

library LibTransferWithProvenanceV02 {
    function logProvenance(
        uint256 tokenId,
        address from,
        address to,
        string memory historyMetadataHash,
        uint256 customHistoryId,
        bool isIntermediary,
        address sender
    ) internal {
        string memory historyMetadataURI = LibSRRMetadataStorage.buildTokenURI(
            historyMetadataHash
        );

        if (customHistoryId != 0) {
            emit IERC721FeatureV04.Provenance(
                tokenId,
                from,
                to,
                customHistoryId,
                historyMetadataHash,
                historyMetadataURI,
                isIntermediary,
                sender
            );
        } else {
            emit IERC721FeatureV04.Provenance(
                tokenId,
                from,
                to,
                historyMetadataHash,
                historyMetadataURI,
                isIntermediary,
                sender
            );
        }
    }

    function transferFromWithProvenance(
        address to,
        uint256 tokenId,
        string memory historyMetadataHash,
        uint256 customHistoryId,
        bool isIntermediary,
        address signer
    ) internal {
        address sender = LibFeatureCommonV02.msgSender();
        address tokenOwner = LibERC721Storage.layout().ownerOf[tokenId];
        logProvenance(
            tokenId,
            tokenOwner,
            to,
            historyMetadataHash,
            customHistoryId,
            isIntermediary,
            signer
        );
        LibERC721Storage._transferFrom(tokenOwner, to, tokenId);

        LibERC721Storage.safeTransferFromReceivedCheck(
            sender,
            tokenOwner,
            to,
            tokenId,
            ""
        );
    }
}
