// SPDX-License-Identifier: UNLICENSED

pragma solidity 0.6.11;

import "../../proxyAdmin/BaseAdminUpgradeabilityProxy.sol";

/**
 * @title AdminUpgradeabilityProxyLUM
 * @dev A modified version of AdminUpgradeabilityProxy.sol that moves the 
 *   admin address out of the constructor in order to enable create2 creation
 *   without admin as input. Admin is instead set in the initializeAdmin 
 *   function that can be called once only.
 */
contract AdminUpgradeabilityProxyLUM is BaseAdminUpgradeabilityProxy {
    /**
     * Contract constructor.
     * @param _logic address of the initial implementation.
     * @param _data Data to send as msg.data to the implementation to initialize the proxied contract.
     * It should include the signature and the parameters of the function to be called, as described in
     * https://solidity.readthedocs.io/en/v0.4.24/abi-spec.html#function-selector-and-argument-encoding.
     * This parameter is optional, if no data is given the initialization call to proxied contract will be skipped.
     */
    constructor(
        address _logic,
        bytes memory _data
    ) public payable UpgradeabilityProxy(_logic, _data) {}

    /**
     * @param _proxyAdmin Address of the proxy administrator.
     */
    function initializeAdmin(address _proxyAdmin) public {
        require(_admin() == address(0x0), "admin already initialized");
        assert(
            ADMIN_SLOT == bytes32(uint256(keccak256("eip1967.proxy.admin")) - 1)
        );
        _setAdmin(_proxyAdmin);
    }
}
