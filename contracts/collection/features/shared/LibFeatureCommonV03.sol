// SPDX-License-Identifier: GPL-3.0-only

pragma solidity 0.8.28;

import {OwnableStorage} from "@solidstate/contracts/access/ownable/OwnableStorage.sol";

import "../../../common/INameRegistry.sol";
import "../../registry/interfaces/IStartrailCollectionFeatureRegistry.sol";
import "../../shared/LibEIP2771Or4337.sol";
import "../../CollectionProxyStorage.sol";
import "../erc721/ERC721Errors.sol";
import "../storage/LibLockExternalTransferStorage.sol";
import {LibERC721Storage} from "../erc721/LibERC721Storage.sol";

library LibFeatureCommonV03 {
    error NotAdministrator();
    error NotCollectionOwner();
    error NotCollectionOwnerOrSRROwner();
    error OnlyArtistOrCollectionOwner();
    error ERC721ExternalTransferLocked();

    function getNameRegistry() internal view returns (address) {
        return
            IStartrailCollectionFeatureRegistry(
                CollectionProxyStorage.layout().featureRegistry
            ).getNameRegistry();
    }

    function getAdministrator() internal view returns (address) {
        return INameRegistry(getNameRegistry()).administrator();
    }

    function isCollectionOwner(address toCheck) internal view returns (bool) {
        if (
            LibEIP2771Or4337
                .licensedUserManager(
                    CollectionProxyStorage.layout().featureRegistry
                )
                .walletAddressGivenAlias(toCheck) == getCollectionOwner()
        ) {
            return true;
        }
        // If the address is EOA not LU, there's a chance
        if (toCheck == getCollectionOwner()) {
            return true;
        }

        address aliasBackward = LibEIP2771Or4337
            .licensedUserManager(
                CollectionProxyStorage.layout().featureRegistry
            )
            .walletAddressAliasBackward(toCheck);
        if (
            aliasBackward != address(0x0) &&
            aliasBackward == getCollectionOwner()
        ) {
            return true;
        }
        return false;
    }

    function isSRROwner(
        address toCheck,
        uint256 tokenId
    ) internal view returns (bool) {
        LibERC721Storage.onlyExistingToken(tokenId);
        address tokenOwner = LibERC721Storage.layout().ownerOf[tokenId];
        address afterAliasIfLU = LibEIP2771Or4337
            .licensedUserManager(
                CollectionProxyStorage.layout().featureRegistry
            )
            .walletAddressGivenAlias(toCheck);
        // The above can return 0x0 if the address is not a LU, and the owner can be EOA.
        address toCheckAfterAlias = afterAliasIfLU == address(0x0)
            ? toCheck
            : afterAliasIfLU;
        if (tokenOwner == toCheckAfterAlias) {
            return true;
        }
        address aliasBackward = LibEIP2771Or4337
            .licensedUserManager(
                CollectionProxyStorage.layout().featureRegistry
            )
            .walletAddressAliasBackward(toCheck);
        if (aliasBackward != address(0x0) && tokenOwner == aliasBackward) {
            return true;
        }
        return false;
    }

    function onlyCollectionOwner() internal view {
        if (!isCollectionOwner(msgSender())) {
            revert NotCollectionOwner();
        }
    }

    /**
     * @dev Ensures that the address is the owner of the collection.
     * @param toCheck The address to be checked against the collection owner.
     * @dev Reverts with `NotCollectionOwner` error if the ownerAddress is not the owner.
     */
    function onlyCollectionOwner(address toCheck) internal view {
        if (!isCollectionOwner(toCheck)) {
            revert NotCollectionOwner();
        }
    }

    /**
     * @dev Ensures that the address is the owner of the specified SRR token.
     * @param toCheck The address to check against the collection owner or SRR owner.
     * @param tokenId Token Id.
     * @dev Reverts with `NotCollectionOwnerOrSRROwner()` error if the toCheck is not the owner.
     */
    function onlyCollectionOwnerOrSRROwner(
        address toCheck,
        uint256 tokenId
    ) internal view {
        if (!isSRROwner(toCheck, tokenId) && !isCollectionOwner(toCheck)) {
            revert NotCollectionOwnerOrSRROwner();
        }
    }

    function getCollectionOwner() internal view returns (address) {
        return OwnableStorage.layout().owner;
    }

    function onlyAdministrator() internal view {
        if (msgSender() != getAdministrator()) {
            revert NotAdministrator();
        }
    }

    function onlyLicensedUser() internal view {
        return
            LibEIP2771Or4337.onlyLicensedUser(
                CollectionProxyStorage.layout().featureRegistry
            );
    }

    function onlyExternalTransferUnlocked(uint256 tokenId) internal view {
        if (
            LibLockExternalTransferStorage.layout().tokenIdToLockFlag[tokenId]
        ) {
            revert ERC721ExternalTransferLocked();
        }
    }

    function isEmptyString(string memory str) internal pure returns (bool) {
        return bytes(str).length == 0;
    }

    /****************************************************************
     *
     * EIP2771 related functions
     *
     ***************************************************************/

    function isTrustedForwarder() internal view returns (bool) {
        return
            LibEIP2771Or4337.isTrustedForwarder(
                CollectionProxyStorage.layout().featureRegistry
            );
    }

    /**
     * @dev return the sender of this call.
     *
     * This should be used in the contract anywhere instead of msg.sender.
     *
     * If the call came through our trusted forwarder, return the EIP2771
     * address that was appended to the calldata. Otherwise, return `msg.sender`.
     */
    function msgSender() internal view returns (address ret) {
        return
            LibEIP2771Or4337.msgSender(
                CollectionProxyStorage.layout().featureRegistry
            );
    }

    function msgSenderAfterAlias() internal view returns (address) {
        return
            LibEIP2771Or4337.msgSenderAfterAlias(
                CollectionProxyStorage.layout().featureRegistry
            );
    }
}
