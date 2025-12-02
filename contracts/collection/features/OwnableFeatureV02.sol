// SPDX-License-Identifier: GPL-3.0-only

pragma solidity 0.8.28;

import {IERC173} from "@solidstate/contracts/interfaces/IERC173.sol";
import {IOwnable} from "@solidstate/contracts/access/ownable/IOwnable.sol";
import {Ownable} from "@solidstate/contracts/access/ownable/Ownable.sol";
import {OwnableStorage} from "@solidstate/contracts/access/ownable/OwnableStorage.sol";
import {OwnableInternal} from "@solidstate/contracts/access/ownable/OwnableInternal.sol";

import "./interfaces/IOwnableFeatureV02.sol";
import "./shared/LibFeatureCommonV03.sol";

/**
 * @dev OwnableFeature that is an ERC173 compatible Ownable implementation.
 *
 * It adds an initializer function to set the owner.
 */
contract OwnableFeatureV02 is IOwnable, IOwnableFeatureV02, OwnableInternal {

    error OwnableFeatureAlreadyInitialized();

    using OwnableStorage for OwnableStorage.Layout;

    /**
     * @inheritdoc IOwnableFeatureV02
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
        LibFeatureCommonV03.onlyCollectionOwner();

        if (newOwner == address(0)) {
            revert ZeroAddress();
        }

        _transferOwnership(newOwner);
    }
}
