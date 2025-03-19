// SPDX-License-Identifier: GPL-3.0-only

pragma solidity 0.8.28;

import {OwnableStorage} from "@solidstate/contracts/access/ownable/OwnableStorage.sol";

import "../../../common/INameRegistry.sol";
import "../../registry/interfaces/IStartrailCollectionFeatureRegistry.sol";
import "../../shared/LibEIP2771.sol";
import "../../CollectionProxyStorage.sol";
import "../erc721/ERC721Errors.sol";
import "../storage/LibLockExternalTransferStorage.sol";
import {LibERC721Storage} from "../erc721/LibERC721Storage.sol";

library LibFeatureCommonV02 {
    error NotAdministrator();
    error NotCollectionOwner();
    error NotCollectionOwnerOrSRROwner();
    error OnlyIssuerOrArtistOrAdministrator();
    error OnlyIssuerOrArtistOrCollectionOwner();
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

    function onlyCollectionOwner() internal view {
        if (msgSender() != OwnableStorage.layout().owner) {
            revert NotCollectionOwner();
        }
    }

    /**
     * @dev Ensures that the address is the owner of the collection.
     * @param toCheck The address to be checked against the collection owner.
     * @dev Reverts with `NotCollectionOwner` error if the ownerAddress is not the owner.
     */
    function onlyCollectionOwner(address toCheck) internal view {
        if (toCheck != OwnableStorage.layout().owner) {
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
        LibERC721Storage.onlyExistingToken(tokenId);
        if (
            LibFeatureCommonV02.getCollectionOwner() != toCheck &&
            LibERC721Storage.layout().ownerOf[tokenId] != toCheck
        ) {
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
            LibEIP2771.onlyLicensedUser(
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
            LibEIP2771.isTrustedForwarder(
                CollectionProxyStorage.layout().featureRegistry
            );
    }

    function onlyTrustedForwarder() internal view {
        return
            LibEIP2771.onlyTrustedForwarder(
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
            LibEIP2771.msgSender(
                CollectionProxyStorage.layout().featureRegistry
            );
    }
}
