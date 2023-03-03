// SPDX-License-Identifier: GPL-3.0-only

pragma solidity 0.8.13;

import {Ownable, OwnableStorage} from "@solidstate/contracts/access/ownable/Ownable.sol";
import {AddressUtils} from "@solidstate/contracts/utils/AddressUtils.sol";

import "./features/ERC721Feature.sol";
import "./features/OwnableFeature.sol";
import "./CollectionProxy.sol";

/**
 * @title Registry of Startrail NFT Collection contracts
 * @author Chris Hatch - <chris.hatch@startbahn.jp>
 */
contract CollectionRegistry is Ownable {
    using OwnableStorage for OwnableStorage.Layout;

    mapping(address => bool) public registry;

    constructor() {
        OwnableStorage.layout().setOwner(msg.sender);
    }

    function addCollection(address collectionAddress) external {
        registry[collectionAddress] = true;
    }
}
