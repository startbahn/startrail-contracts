// SPDX-License-Identifier: GPL-3.0-only

pragma solidity 0.8.28;

import "./LibFeatureCommonV01.sol";
import "../erc721/LibERC721Storage.sol";

library LibTransferWithProvenanceV01 {
    function transferFromWithProvenance(
        address to,
        uint256 tokenId,
        string memory historyMetadataHash,
        uint256 customHistoryId,
        bool isIntermediary
    ) internal {
        address sender = LibFeatureCommonV01.msgSender();
        address tokenOwner = LibERC721Storage.layout().ownerOf[tokenId];
        LibFeatureCommonV01.logProvenance(
            tokenId,
            tokenOwner,
            to,
            historyMetadataHash,
            customHistoryId,
            isIntermediary
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
