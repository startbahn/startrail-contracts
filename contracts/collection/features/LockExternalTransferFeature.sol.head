// SPDX-License-Identifier: GPL-3.0-only

pragma solidity 0.8.28;

import "./erc721//ERC721Errors.sol";
import {LibERC721Storage} from "./erc721//LibERC721Storage.sol";
import "./interfaces/ILockExternalTransferFeatureV01.sol";
import "./shared/LibFeatureCommonV01.sol";
import "./storage/LibLockExternalTransferStorage.sol";
import "./storage/LibSRRStorage.sol";

/**
 * @title Feature that enables standard ERC721 transfer methods to be disabled
 *   for a given token.
 */
contract LockExternalTransferFeatureV01 is ILockExternalTransferFeatureV01 {
    /**
     * @dev Emitted when flag is explicitly set
     * @param tokenId NFT id
     * @param flag Lock flag
     */
    event LockExternalTransferSetLock(uint256 indexed tokenId, bool flag);

    /**
     * @inheritdoc ILockExternalTransferFeatureV01
     */
    function setLockExternalTransfer(
        uint256 tokenId,
        bool flag
    ) external override {
        LibFeatureCommonV01.onlyTrustedForwarder();
        LibERC721Storage.onlyExistingToken(tokenId);

        address issuer = LibSRRStorage.layout().srrs[tokenId].issuer;
        address sendingWallet = LibFeatureCommonV01.msgSender();
        if (
            sendingWallet != issuer &&
            sendingWallet != LibFeatureCommonV01.getCollectionOwner()
        ) {
            revert OnlyIssuerOrCollectionOwner();
        }

        LibFeatureCommonV01.getCollectionOwner();

        LibLockExternalTransferStorage.layout().tokenIdToLockFlag[
            tokenId
        ] = flag;

        emit LockExternalTransferSetLock(tokenId, flag);
    }

    /**
     * @inheritdoc ILockExternalTransferFeatureV01
     */
    function getLockExternalTransfer(
        uint256 tokenId
    ) external view override returns (bool) {
        return
            LibLockExternalTransferStorage.layout().tokenIdToLockFlag[tokenId];
    }
}
