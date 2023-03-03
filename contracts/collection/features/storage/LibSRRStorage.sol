// SPDX-License-Identifier: GPL-3.0-only

pragma solidity 0.8.13;

library LibSRRStorage {
    struct SRR {
        bool isPrimaryIssuer;
        address artist;
        address issuer;
    }

    struct Layout {
        mapping(uint256 => SRR) srrs;
    }

    bytes32 internal constant STORAGE_SLOT = keccak256("startrail.storage.SRR");

    function layout() internal pure returns (Layout storage l) {
        bytes32 slot = STORAGE_SLOT;
        assembly {
            l.slot := slot
        }
    }
}
