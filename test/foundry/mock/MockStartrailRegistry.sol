// SPDX-License-Identifier: GPL-3.0-only
pragma solidity 0.8.28;

import {IStartrailRegistrySubset} from "../../../contracts/collection/features/shared/LibFeatureStartrailRegistry.sol";

contract MockStartrailRegistry is IStartrailRegistrySubset {
    mapping(uint256 => string) internal customHistoryIdToName;

    uint256 public maxCombinedHistoryRecords = 4;

    function getCustomHistoryNameById(
        uint256 id
    ) external view returns (string memory) {
        return customHistoryIdToName[id];
    }

    function addCustomHistory(uint256 id, string memory name) external {
        customHistoryIdToName[id] = name;
    }

    function setMaxCombinedHistoryRecords(uint256 newMax) external {
        maxCombinedHistoryRecords = newMax;
    }
}
