// SPDX-License-Identifier: GPL-3.0-only
pragma solidity 0.8.13;

import "../collection/CollectionFactory.sol";

contract MockCollectionFactoryForUpgrade is CollectionFactory {
    function aNewFn() public pure returns (uint256) {
        return 42;
    }
}
