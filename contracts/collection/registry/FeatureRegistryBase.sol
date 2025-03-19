// SPDX-License-Identifier: GPL-3.0-only

pragma solidity 0.8.28;

import {Ownable} from "@solidstate/contracts/access/ownable/Ownable.sol";
import {OwnableStorage} from "@solidstate/contracts/access/ownable/OwnableStorage.sol";
import {ERC165BaseStorage} from "@solidstate/contracts/introspection/ERC165/base/ERC165BaseStorage.sol";
import {IERC165} from "@solidstate/contracts/interfaces/IERC165.sol";
import {DiamondReadable} from "@solidstate/contracts/proxy/diamond/readable/DiamondReadable.sol";
import {DiamondWritable} from "@solidstate/contracts/proxy/diamond/writable/DiamondWritable.sol";

import "./interfaces/IFeatureRegistryBase.sol";

/**
 * @title Feature contract registry - enables plugable logic for NFT collection contracts.
 * @author Chris Hatch - <chris.hatch@startbahn.jp>
 * @dev A registry of 'Feature' contract addresses and corresponding lists of 4byte
 * function selectors for each.
 *
 * This contract is shared by multiple proxy contracts that use it to lookup
 * the implementation address of incoming function calls. In this way it
 * it is like a Beacon that supports multiple implementation contracts.
 *
 * This contract uses the solidstate Diamond implementation to manage the
 * registry data but this is not a Diamond as the proxy is disabled and only
 * the store and lookups for the contract implementations are in place.
 *
 * It also adds internal storage for ERC165 interface registration but does not
 * expose ERC165 itself as it should be exposed from the CollectionProxy's
 * which will query the internal storage in the registry here to get the
 * correct supportsInterface() responses.
 */
abstract contract FeatureRegistryBase is
    IFeatureRegistryBase,
    DiamondReadable,
    DiamondWritable,
    Ownable
{
    using ERC165BaseStorage for ERC165BaseStorage.Layout;
    using OwnableStorage for OwnableStorage.Layout;

    event FeatureContractCreated(address indexed featureAddress, string name);

    /**
     * Override the SolidStateDiamond constructor.
     *
     * Set the owner and register ERC165 interface support in internal storage.
     *
     * A derivative of this contract will register Feature contracts and
     * function selectors using the DiamondWritable interface provided by
     * this base.
     */
    constructor() {
        OwnableStorage.layout().owner = msg.sender;

        // NOTE: This contract does not support the ERC165 interface however
        //   the proxies that use this registry will. Thus this call is
        //   updating the internal supported interface mapping that the proxies
        //   will query when supportsInterface() is called on them.
        setSupportedInterfaceInternal(type(IERC165).interfaceId, true);
    }

    /**
     * @inheritdoc IFeatureRegistryBase
     */
    function setSupportedInterface(
        bytes4 interfaceId,
        bool status
    ) external override onlyOwner {
        setSupportedInterfaceInternal(interfaceId, status);
    }

    function setSupportedInterfaceInternal(
        bytes4 interfaceId,
        bool status
    ) internal {
        ERC165BaseStorage.layout().supportedInterfaces[interfaceId] = status;
    }

    /**
     * @inheritdoc IFeatureRegistryBase
     */
    function getSupportedInterface(
        bytes4 interfaceId
    ) external view override returns (bool) {
        return ERC165BaseStorage.layout().supportedInterfaces[interfaceId];
    }
}
