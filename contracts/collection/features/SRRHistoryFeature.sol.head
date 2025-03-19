// SPDX-License-Identifier: GPL-3.0-only

pragma solidity 0.8.28;

import "./erc721/LibERC721Storage.sol";
import "./interfaces/ISRRHistoryFeatureV01.sol";
import "./shared/LibFeatureCommonV01.sol";
import "./shared/LibFeatureStartrailRegistry.sol";
import "./shared/LibSRRHistoryEvents.sol";
import "./storage/LibSRRStorage.sol";
import "./storage/LibSRRMetadataStorage.sol";

/**
 * @title Feature implementing emission of history events for collection SRRs.
 * @dev Enables batch association of 1 or more SRRs with 1 or more custom history events.
 */
contract SRRHistoryFeatureV01 is ISRRHistoryFeatureV01 {
    /**
     * @inheritdoc ISRRHistoryFeatureV01
     */
    function addHistory(
        uint256[] calldata tokenIds,
        uint256[] calldata customHistoryIds
    ) external override {
        IStartrailRegistrySubset sr = LibFeatureStartrailRegistry
            .getStartrailRegistry();
        uint256 maxCombinedHistoryRecords = sr.maxCombinedHistoryRecords();
        if (
            tokenIds.length * customHistoryIds.length >
            maxCombinedHistoryRecords
        ) {
            revert MaxCombinedTokensAndHistoriesExceeded();
        }

        address sender = LibFeatureCommonV01.msgSender();
        bool senderIsCollectionOwner = sender ==
            LibFeatureCommonV01.getCollectionOwner();

        uint16 i;

        for (i = 0; i < tokenIds.length; i++) {
            LibERC721Storage.onlyExistingToken(tokenIds[i]);
            LibSRRStorage.SRR storage srr = LibSRRStorage.layout().srrs[
                tokenIds[i]
            ];
            if (
                !senderIsCollectionOwner &&
                sender != srr.issuer &&
                sender != srr.artist &&
                sender != LibERC721Storage.layout().ownerOf[tokenIds[i]]
            ) {
                revert AddHistoryNotPermitted();
            }
        }

        for (i = 0; i < customHistoryIds.length; i++) {
            if (
                LibFeatureCommonV01.isEmptyString(
                    sr.getCustomHistoryNameById(customHistoryIds[i])
                )
            ) {
                revert CustomHistoryDoesNotExist();
            }
        }

        emit LibSRRHistoryEvents.History(tokenIds, customHistoryIds);
    }
}
