// SPDX-License-Identifier: GPL-3.0-only

pragma solidity 0.8.13;

import "./AdminUpgradeabilityProxy.sol";

contract StartrailProxy is AdminUpgradeabilityProxy {
    constructor(
        address _logic,
        address _admin,
        bytes memory _data
    ) payable AdminUpgradeabilityProxy(_logic, _admin, _data) {}
}
