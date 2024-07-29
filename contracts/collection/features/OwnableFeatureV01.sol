// SPDX-License-Identifier: GPL-3.0-only

pragma solidity 0.8.21;

import {IERC173} from "@solidstate/contracts/interfaces/IERC173.sol";
import {IOwnable} from "@solidstate/contracts/access/ownable/IOwnable.sol";
import {Ownable} from "@solidstate/contracts/access/ownable/Ownable.sol";
import {OwnableStorage} from "@solidstate/contracts/access/ownable/OwnableStorage.sol";
import {OwnableInternal} from "@solidstate/contracts/access/ownable/OwnableInternal.sol";

import "./interfaces/IOwnableFeatureV01.sol";
import "./shared/LibFeatureCommon.sol";

error OwnableFeatureAlreadyInitialized();

/**
 * @dev OwnableFeature that is an ERC173 compatible Ownable implementation.
 *
 * It adds an initializer function to set the owner.
 */
contract OwnableFeatureV01 is IOwnable, IOwnableFeatureV01, OwnableInternal {
    using OwnableStorage for OwnableStorage.Layout;

    /**
     * @inheritdoc IOwnableFeatureV01
     */
    function __OwnableFeature_initialize(address initialOwner) external {
        if (OwnableStorage.layout().owner != address(0)) {
            revert OwnableFeatureAlreadyInitialized();
        }
        OwnableStorage.layout().owner = initialOwner;
    }

    /**
     * @inheritdoc IERC173
     */
    function owner() public view override returns (address) {
        return _owner();
    }

    /**
     * @inheritdoc IERC173
     */
    function transferOwnership(address newOwner) external override {
        LibFeatureCommon.onlyTrustedForwarder();
        LibFeatureCommon.onlyCollectionOwner();

        if (newOwner == address(0)) {
            revert ZeroAddress();
        }

        _transferOwnership(newOwner);
    }
}
