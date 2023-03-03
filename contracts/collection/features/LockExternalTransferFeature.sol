// SPDX-License-Identifier: GPL-3.0-only

pragma solidity 0.8.13;

import "./erc721//ERC721Errors.sol";
import {LibERC721Storage} from "./erc721//LibERC721Storage.sol";
import "./interfaces/ILockExternalTransferFeature.sol";
import "./shared/LibFeatureCommon.sol";
import "./storage/LibLockExternalTransferStorage.sol";

/**
 * @title Feature that enables standard ERC721 transfer methods to be disabled
 *   for a given token.
 */
contract LockExternalTransferFeature is ILockExternalTransferFeature {
    /**
     * @inheritdoc ILockExternalTransferFeature
     */
    function setLockExternalTransfer(
        uint256 tokenId,
        bool flag
    ) external override {
        LibFeatureCommon.onlyTrustedForwarder();
        LibFeatureCommon.onlyOwner();
        LibERC721Storage.onlyExistingToken(tokenId);

        LibLockExternalTransferStorage.layout().tokenIdToLockFlag[
            tokenId
        ] = flag;

        emit LockExternalTransferSetLock(tokenId, flag);
    }

    /**
     * @inheritdoc ILockExternalTransferFeature
     */
    function getLockExternalTransfer(
        uint256 tokenId
    ) external view override returns (bool) {
        return
            LibLockExternalTransferStorage.layout().tokenIdToLockFlag[tokenId];
    }
}
