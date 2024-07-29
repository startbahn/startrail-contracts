// SPDX-License-Identifier: GPL-3.0-only

pragma solidity 0.8.21;

import "@solidstate/contracts/utils/AddressUtils.sol";

import "./CollectionProxyStorage.sol";
import "./Proxy.sol";

bytes4 constant SELECTOR_FACET_ADDRESS = bytes4(
    keccak256("facetAddress(bytes4)")
);
bytes4 constant SELECTOR_SUPPORTS_INTERFACE = bytes4(
    keccak256("supportsInterface(bytes4)")
);
bytes4 constant SELECTOR_GET_SUPPORTED_INTERFACE = bytes4(
    keccak256("getSupportedInterface(bytes4)")
);

error CollectionProxyAlreadyInitialized();
error ImplementationAddressNotFound();

/**
 * @title A Startrail NFT Collection proxy contract.
 * @author Chris Hatch - <chris.hatch@startbahn.jp>
 * @dev Collection contracts are CollectionProxy’s that lookup implementation
 *      contracts at a shared FeatureRegistry. The shared registry, which is
 *      essentially a Beacon to multiple implementation contracts, enables
 *      all proxies to be upgraded at the same time.
 */
contract CollectionProxy is Proxy {
    using AddressUtils for address;
    using CollectionProxyStorage for CollectionProxyStorage.Layout;

    function __CollectionProxy_initialize(address _featureRegistry) external {
        CollectionProxyStorage.Layout storage layout = CollectionProxyStorage
            .layout();
        if (layout.featureRegistry != address(0)) {
            revert CollectionProxyAlreadyInitialized();
        }
        layout.setFeatureRegistry(_featureRegistry);
    }

    /**
     * @dev Static calls supportsInterface(bytes4) on the FeatureRegistry
     *      to lookup it's registry (in storage) of interfaces supported.
     *
     *      An alternative would be to store that information in each proxy
     *      however storing it in the FeatureRegistry one time is a cheaper
     *      option.
     */
    function staticcallSupportsInterfaceOnFeatureRegistry() private view {
        address featureRegistry = CollectionProxyStorage
            .layout()
            .featureRegistry;

        // First 4 bytes will be the interfaceId to query
        bytes4 interfaceId = abi.decode(msg.data[4:], (bytes4));

        // FeatureRegistry.getSupportedInterface(interfaceId)
        (bool success, ) = featureRegistry.staticcall(
            abi.encodeWithSelector(
                SELECTOR_GET_SUPPORTED_INTERFACE,
                interfaceId
            )
        );

        // Inspect and handle the response
        assembly {
            returndatacopy(0, 0, returndatasize())
            switch success
            case 0 {
                revert(0, returndatasize())
            }
            default {
                return(0, returndatasize())
            }
        }
    }

    fallback() external payable override {
        // Special case: for supportsInterface() the information to query
        //   is in the storage of the FeatureRegistry. So for this call alone
        //   we don't delegatecall, but instead do a static call.
        if (msg.sig == SELECTOR_SUPPORTS_INTERFACE) {
            staticcallSupportsInterfaceOnFeatureRegistry();
        } else {
            // All other functions (msg.sig's) use the normal proxy mechanism
            super.handleFallback();
        }
    }

    receive() external payable {}

    /**
     * @dev Query FeatureRegistry.facetAddress() to get the implementation
     *   contract for the incoming function signature (msg.sig).
     *
     *   facetAddress() will lookup the registry of 4 bytes function signatures
     *   to implementation addresses. See the FeatureRegistry for details.
     */
    function _getImplementation()
        internal
        view
        override
        returns (address implementationAddress)
    {
        address featureRegistry = CollectionProxyStorage
            .layout()
            .featureRegistry;
        (bool success, bytes memory returnData) = featureRegistry.staticcall(
            abi.encodeWithSelector(SELECTOR_FACET_ADDRESS, msg.sig)
        );
        if (success) {
            implementationAddress = address(bytes20(bytes32(returnData) << 96));
        } else {
            revert ImplementationAddressNotFound();
        }
    }
}
