// SPDX-License-Identifier: GPL-3.0-only

pragma solidity 0.8.21;

import "./LibFeatureCommon.sol";
import "../erc721/LibERC721Storage.sol";

library LibTransferWithProvenance {
    function transferFromWithProvenance(
        address to,
        uint256 tokenId,
        string memory historyMetadataHash,
        uint256 customHistoryId,
        bool isIntermediary
    ) internal {
        address sender = LibFeatureCommon.msgSender();
        address tokenOwner = LibERC721Storage.layout().ownerOf[tokenId];
        LibFeatureCommon.logProvenance(
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
