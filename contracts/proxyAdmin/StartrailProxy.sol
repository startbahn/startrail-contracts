// SPDX-License-Identifier: UNLICENSED

pragma solidity 0.6.11;

import "./AdminUpgradeabilityProxy.sol";

contract StartrailProxy is AdminUpgradeabilityProxy {
    constructor(
        address _logic,
        address _admin,
        bytes memory _data
    ) public payable AdminUpgradeabilityProxy(_logic, _admin, _data) {}
}
