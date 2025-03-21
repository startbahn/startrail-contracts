// SPDX-License-Identifier: GPL-3.0-only

pragma solidity 0.8.28;

import "./features/ERC721FeatureV01.sol";
import "./features/OwnableFeatureV01.sol";
import "./CollectionProxy.sol";

/**
 * @title Registry of Startrail NFT Collection contracts
 * @author Chris Hatch - <chris.hatch@startbahn.jp>
 */
contract CollectionRegistry {
    error OnlyCollectionFactory();

    mapping(address => bool) public registry;

    address public collectionFactory;

    constructor(address collectionFactory_) {
        collectionFactory = collectionFactory_;
    }

    function addCollection(address collectionAddress) external {
        if (msg.sender != collectionFactory) {
            revert OnlyCollectionFactory();
        }
        registry[collectionAddress] = true;
    }
}
