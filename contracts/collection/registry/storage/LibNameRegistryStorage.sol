// SPDX-License-Identifier: GPL-3.0-only

pragma solidity 0.8.13;

library LibNameRegistryStorage {
    struct Layout {
        address nameRegistry;
    }

    bytes32 internal constant STORAGE_SLOT =
        keccak256("startrail.storage.NameRegistry");

    function layout() internal pure returns (Layout storage l) {
        bytes32 slot = STORAGE_SLOT;
        assembly {
            l.slot := slot
        }
    }
}
