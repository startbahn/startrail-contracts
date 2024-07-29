// SPDX-License-Identifier: GPL-3.0-only

pragma solidity 0.8.21;

import "@openzeppelin/contracts/utils/Address.sol";

/**
 * @title UpgradeableProxiable
 *
 * @dev This contract implements upgradability for a Proxy contract.
 * It is intended that the bytecode for this contract is stored with the
 * Logic Contract that the proxy delegatecalls too.
 * ie. The bytecode for this contract does not need to be stored in the proxy itself.
 *
 * Based on OpenZeppelin's BaseUpgradeabilityProxy with changes to remove the
 * Proxy base.
 *
 * see also EIP1822 which defines a pattern like this.
 */
contract UpgradeableProxiable {
    /**
     * @dev Emitted when the implementation is upgraded.
     * @param implementation Address of the new implementation.
     */
    event Upgraded(address indexed implementation);

    /**
     * @dev Storage slot with the address of the current implementation.
     * This is the keccak-256 hash of "eip1967.proxy.implementation" subtracted by 1, and is
     * validated in the constructor.
     */
    // Code position in storage is keccak256("PROXIABLE"):
    bytes32
        internal constant IMPLEMENTATION_SLOT = 0xc5f16f0fcc639fa48a6947836d9850f504798523bf8c9a3a87d5876cf622bcf7;

    /**
     * @dev Returns the current implementation.
     * @return impl
     */
    function _implementation() internal view returns (address impl) {
        bytes32 slot = IMPLEMENTATION_SLOT;
        assembly {
            impl := sload(slot)
        }
    }

    /**
     * @dev Upgrades the proxy to a new implementation.
     * @param newImplementation Address of the new implementation.
     */
    function _upgradeTo(address newImplementation) internal {
        _setImplementation(newImplementation);
        emit Upgraded(newImplementation);
    }

    /**
     * @dev Sets the implementation address of the proxy.
     * @param newImplementation Address of the new implementation.
     */
    function _setImplementation(address newImplementation) internal {
        require(
            Address.isContract(newImplementation),
            "Cannot set a proxy implementation to a non-contract address"
        );

        bytes32 slot = IMPLEMENTATION_SLOT;

        assembly {
            sstore(slot, newImplementation)
        }
    }
}
