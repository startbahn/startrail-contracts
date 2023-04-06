// SPDX-License-Identifier: GPL-3.0-only

pragma solidity 0.8.13;

library CollectionFactoryStorage {
    struct Layout {
        address collectionRegistry;
        address featureRegistry;
        address collectionProxyImplementation;
    }

    bytes32 internal constant STORAGE_SLOT =
        keccak256("startrail.storage.CollectionFactory");

    function layout() internal pure returns (Layout storage l) {
        bytes32 slot = STORAGE_SLOT;
        assembly {
            l.slot := slot
        }
    }
}
