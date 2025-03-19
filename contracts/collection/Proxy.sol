// SPDX-License-Identifier: MIT

pragma solidity 0.8.28;

import {IProxy} from "@solidstate/contracts/proxy/IProxy.sol";
import {AddressUtils} from "@solidstate/contracts/utils/AddressUtils.sol";

/**
 * @title Base proxy contract modified from the @solidstate/contracts Proxy.sol
 *
 * Modification simply moves the body of the fallback() into a separate
 * internal function called handleFallback. This enables the child contract to
 * call it with super.
 */
abstract contract Proxy is IProxy {
    using AddressUtils for address;

    /**
     * @notice delegate all calls to implementation contract
     * @dev reverts if implementation address contains no code, for compatibility with metamorphic contracts
     * @dev memory location in use by assembly may be unsafe in other contexts
     */
    function handleFallback() internal virtual {
        address implementation = _getImplementation();

        require(
            implementation.isContract(),
            "Proxy: implementation must be contract"
        );

        assembly {
            calldatacopy(0, 0, calldatasize())
            let result := delegatecall(
                gas(),
                implementation,
                0,
                calldatasize(),
                0,
                0
            )
            returndatacopy(0, 0, returndatasize())

            switch result
            case 0 {
                revert(0, returndatasize())
            }
            default {
                return(0, returndatasize())
            }
        }
    }

    fallback() external payable virtual {
        return handleFallback();
    }

    /**
     * @notice get logic implementation address
     * @return implementation address
     */
    function _getImplementation() internal virtual returns (address);
}
