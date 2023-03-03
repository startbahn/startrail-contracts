// SPDX-License-Identifier: GPL-3.0-only
pragma solidity 0.8.13;

import {Ownable, OwnableStorage} from "@solidstate/contracts/access/ownable/Ownable.sol";
import "./interfaces/IOwnableFeature.sol";

error OwnableFeatureAlreadyInitialized();

/**
 * @dev OwnableFeature that is an ERC173 compatible Ownable implementation.
 *
 * It adds an initializer function to set the owner.
 */
contract OwnableFeature is Ownable, IOwnableFeature {
    /**
     * @inheritdoc IOwnableFeature
     */
    function __OwnableFeature_initialize(address initialOwner) external {
        if (OwnableStorage.layout().owner != address(0)) {
            revert OwnableFeatureAlreadyInitialized();
        }
        OwnableStorage.layout().owner = initialOwner;
    }
}
