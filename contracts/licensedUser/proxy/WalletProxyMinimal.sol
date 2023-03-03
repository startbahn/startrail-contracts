// SPDX-License-Identifier: GPL-3.0-only
pragma solidity 0.8.13;

/**
 * @title A minimal proxy to install at LicensedUserLogic proxies.
 *
 * @dev Contract adapted from the OpenZeppelin Proxy.sol.
 *
 * Added logic from the EIP-1822 example pattern:
 *  - PROXIABLE storage slot for the contractLogic
 *  - a constructor to set contractLogic and call some init function
 *
 * Modified the fallback to handle on the fly check and upgrade of the contract
 * logic. Delegates to upgrade function in the contractLogic.
 */
contract WalletProxyMinimal {
  // Code position in storage is keccak256("PROXIABLE")
  bytes32
    internal constant IMPLEMENTATION_SLOT = 0xc5f16f0fcc639fa48a6947836d9850f504798523bf8c9a3a87d5876cf622bcf7;

  constructor(address contractLogic, bytes memory constructData) {
    // save the code address
    assembly {
      // solium-disable-line
      sstore(IMPLEMENTATION_SLOT, contractLogic)
    }
    (bool success, ) = contractLogic.delegatecall(constructData); // solium-disable-line
    require(success, "Construction failed");
  }

  fallback() external {
    address contractLogic;
    assembly {
      // solium-disable-line
      contractLogic := sload(IMPLEMENTATION_SLOT)
    }

    // Call LicensedUserLogic.checkAndUpgrade(), function signature: 0xfe11cc4f
    (bool success, ) = contractLogic.delegatecall(
      abi.encodeWithSelector(0xfe11cc4f)
    );
    if (!success) {
      revert("Upgrade check failed");
    }

    // delegatecall
    assembly {
      // solium-disable-line
      // load again as it may have been upgraded to a new address:
      contractLogic := sload(IMPLEMENTATION_SLOT)

      // Copy msg.data. We take full control of memory in this inline assembly
      // block because it will not return to Solidity code. We overwrite the
      // Solidity scratch pad at memory position 0.
      calldatacopy(0, 0, calldatasize())

      // Call the implementation.
      // out and outsize are 0 because we don't know the size yet.
      let result := delegatecall(gas(), contractLogic, 0, calldatasize(), 0, 0)

      // Copy the returned data.
      returndatacopy(0, 0, returndatasize())

      switch result
        // delegatecall returns 0 on error.
        case 0 {
          revert(0, returndatasize())
        }
        default {
          return(0, returndatasize())
        }
    }
  }
}
