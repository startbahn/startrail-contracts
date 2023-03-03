// SPDX-License-Identifier: GPL-3.0-only
pragma solidity 0.8.13;

import "../../../common/INameRegistry.sol";
import "../../CollectionProxyStorage.sol";
import "./LibFeatureCommon.sol";

/**
 * Defines interface with a subset of the full StartrailRegistry.sol contract.
 * Only those functions required by the collections feature contracts are
 * added here.
 */
interface IStartrailRegistrySubset {
    function getCustomHistoryNameById(
        uint256
    ) external view returns (string memory);
}

// Copied this key value from Contracts.sol because it can't be imported and
// used. This is because:
//  - libraries can't inherit from other contracts
//  - keys in Contracts.sol are `internal` so not accessible if not inherited
uint8 constant NAME_REGISTRY_KEY_STARTRAIL_REGISTRY = 4;

/**
 * Provide access to parts of the single StartrailRegistry contract from the
 * collection features contracts.
 */
library LibFeatureStartrailRegistry {
    function getStartrailRegistry()
        internal
        view
        returns (IStartrailRegistrySubset)
    {
        return
            IStartrailRegistrySubset(
                INameRegistry(LibFeatureCommon.getNameRegistry()).get(
                    NAME_REGISTRY_KEY_STARTRAIL_REGISTRY
                )
            );
    }
}
