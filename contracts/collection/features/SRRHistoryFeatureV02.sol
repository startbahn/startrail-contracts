// SPDX-License-Identifier: GPL-3.0-only

pragma solidity 0.8.28;

import "./erc721/LibERC721Storage.sol";
import "./interfaces/ISRRHistoryFeatureV02.sol";
import "./shared/LibFeatureCommonV03.sol";
import "./shared/LibFeatureStartrailRegistry.sol";
import "./shared/LibSRRHistoryEvents.sol";
import "./storage/LibSRRStorage.sol";
import "./storage/LibSRRMetadataStorage.sol";
import "../shared/LibEIP2771Or4337.sol";
import "../CollectionProxyStorage.sol";

/**
 * @title Feature implementing emission of history events for collection SRRs.
 * @dev Enables batch association of 1 or more SRRs with 1 or more custom history events.
 */
contract SRRHistoryFeatureV02 is ISRRHistoryFeatureV02 {
    /**
     * @inheritdoc ISRRHistoryFeatureV02
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

        address sender = LibFeatureCommonV03.msgSender();
        bool isCollectionOwner = LibFeatureCommonV03.isCollectionOwner(sender);
        address aliasBackward = LibEIP2771Or4337
            .licensedUserManager(
                CollectionProxyStorage.layout().featureRegistry
            )
            .walletAddressAliasBackward(sender);

        uint16 i;

        for (i = 0; i < tokenIds.length; i++) {
            LibERC721Storage.onlyExistingToken(tokenIds[i]);
            bool isSRROwner = LibFeatureCommonV03.isSRROwner(
                sender,
                tokenIds[i]
            );
            LibSRRStorage.SRR storage srr = LibSRRStorage.layout().srrs[
                tokenIds[i]
            ];
            if (
                !isCollectionOwner &&
                sender != srr.artist &&
                aliasBackward != srr.artist &&
                !isSRROwner
            ) {
                revert AddHistoryNotPermitted();
            }
        }

        for (i = 0; i < customHistoryIds.length; i++) {
            if (
                LibFeatureCommonV03.isEmptyString(
                    sr.getCustomHistoryNameById(customHistoryIds[i])
                )
            ) {
                revert CustomHistoryDoesNotExist();
            }
        }

        emit LibSRRHistoryEvents.History(tokenIds, customHistoryIds);
    }
}
