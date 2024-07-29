// SPDX-License-Identifier: GPL-3.0-only

pragma solidity 0.8.21;

library LibApproveTransferStorage {
    struct Approval {
        bytes32 commitment;
        string historyMetadataHash;
        uint256 customHistoryId;
    }

    struct Layout {
        mapping(uint256 => Approval) approvals;
    }

    bytes32 internal constant STORAGE_SLOT =
        keccak256("startrail.storage.Approval");

    function layout() internal pure returns (Layout storage l) {
        bytes32 slot = STORAGE_SLOT;
        assembly {
            l.slot := slot
        }
    }
}
