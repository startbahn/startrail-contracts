// SPDX-License-Identifier: GPL-3.0-only

pragma solidity 0.8.28;

library LibEIP2771RecipientStorage {
    struct Layout {
        address trustedForwarder;
    }

    bytes32 internal constant STORAGE_SLOT =
        keccak256("startrail.storage.EIP2771Recipient");

    function layout() internal pure returns (Layout storage l) {
        bytes32 slot = STORAGE_SLOT;
        assembly {
            l.slot := slot
        }
    }
}
