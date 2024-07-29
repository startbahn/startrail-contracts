// SPDX-License-Identifier: GPL-3.0-only

pragma solidity 0.8.21;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

/**
 * Startrail contracts were deployed with an older version of
 * Initializable.sol from the package {at}openzeppelin/contracts-ethereum-package.
 * It was a version from the semver '^3.0.0'. 
 * 
 * That older version contained a storage gap however the new
 * {at}openzeppelin/contracts-upgradeable version does not.
 * 
 * This contract inserts the storage gap so that storage aligns in the
 * contracts that used that older version. 
 */
abstract contract InitializableWithGap is Initializable {
    uint256[50] private ______gap;   
}
