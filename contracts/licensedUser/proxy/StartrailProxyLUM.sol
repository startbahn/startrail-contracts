// SPDX-License-Identifier: GPL-3.0-only

pragma solidity 0.6.11;

import "./AdminUpgradeabilityProxyLUM.sol";

/**
 * @title StartrailProxyLUM
 * @dev A modified version of StartrailProxy.sol that moves the admin address
 *   out of the constructor in order to enable create2 creation without admin
 *   as input. Admin is instead set in the
 *   AdminUpgradeabilityProxyLUM.initializeAdmin one time function.
 */
contract StartrailProxyLUM is AdminUpgradeabilityProxyLUM {
    constructor(
        address _logic,
        bytes memory _data
    ) public payable AdminUpgradeabilityProxyLUM(_logic, _data) {}
}
