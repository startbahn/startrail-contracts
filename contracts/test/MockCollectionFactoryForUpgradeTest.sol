// SPDX-License-Identifier: GPL-3.0-only

pragma solidity 0.8.28;

import "../collection/CollectionFactoryV01.sol";

contract MockCollectionFactoryForUpgrade is CollectionFactoryV01 {
    function aNewFn() public pure returns (uint256) {
        return 42;
    }
}
