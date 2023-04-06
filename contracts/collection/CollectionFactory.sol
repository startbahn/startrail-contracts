// SPDX-License-Identifier: GPL-3.0-only

pragma solidity 0.8.13;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts/utils/Address.sol";

import {MinimalProxyFactory} from "@solidstate/contracts/factory/MinimalProxyFactory.sol";

import "./features/interfaces/IERC721Feature.sol";
import "./features/interfaces/IOwnableFeature.sol";
import "./shared/LibEIP2771.sol";
import "./CollectionFactoryStorage.sol";
import "./CollectionProxy.sol";
import "./CollectionRegistry.sol";

/**
 * @title Factory for creating Startrail NFT Collection proxies
 * @author Chris Hatch - <chris.hatch@startbahn.jp>
 * @dev see `collection-factory-upgradability.test.ts` for upgrade related
 *          tests that use the hardhat oz upgrades plugin
 *      see `CollectionFactory.t.sol` for general behavior tests
 */
contract CollectionFactory is
    OwnableUpgradeable,
    UUPSUpgradeable,
    ReentrancyGuardUpgradeable,
    MinimalProxyFactory
{
    error FeatureRegistryIsNotAContract();
    error CollectionProxyImplementationIsNotAContract();
    error NotTrustedForwarder();

    event CollectionCreated(
        address indexed collectionAddress,
        address indexed ownerAddress,
        string name,
        string symbol,
        bytes32 salt
    );

    // Legacy event (qa only - not even in prod) so can be removed soon
    // after gogh has integrated with the above new event
    event CollectionCreated(
        address indexed collectionAddress,
        address indexed ownerAddress,
        string name,
        string symbol,
        string metadataCID,
        bytes32 salt
    );

    using AddressUtils for address;

    function initialize(
        address featureRegistry_,
        address collectionProxyImplementation
    ) public initializer {
        if (!featureRegistry_.isContract()) {
            revert FeatureRegistryIsNotAContract();
        }
        if (!collectionProxyImplementation.isContract()) {
            revert CollectionProxyImplementationIsNotAContract();
        }

        CollectionFactoryStorage.Layout
            storage layout = CollectionFactoryStorage.layout();
        layout.featureRegistry = featureRegistry_;
        layout.collectionProxyImplementation = collectionProxyImplementation;
        layout.collectionRegistry = address(
            new CollectionRegistry(address(this))
        );

        __Ownable_init();
    }

    function _authorizeUpgrade(
        address newImplementation
    ) internal override onlyOwner {}

    function collectionRegistry() external view returns (address) {
        return CollectionFactoryStorage.layout().collectionRegistry;
    }

    function featureRegistry() external view returns (address) {
        return CollectionFactoryStorage.layout().featureRegistry;
    }

    /**
     * @notice Create a new Collection Proxy contract
     * @param name NFT collection name (eg. 'No More Apes')
     * @param symbol NFT collection symbol (eg. 'NOAPE')
     * @param salt Some bytes32 value to feed into create2.
     */
    function createCollectionContract(
        string calldata name,
        string calldata symbol,
        bytes32 salt
    )
        external
        // All external calls below are to our own contracts but let's be
        //   paranoid and guarantee it's not reentrant.
        // GAS NOTE: 20k reentrancy status update cost for the first ever call
        //   to this, 2.9k for each subsequent call. Update is to the
        //   ReentrancyGuardStorage.layout().status.
        nonReentrant
    {
        CollectionFactoryStorage.Layout
            storage layout = CollectionFactoryStorage.layout();
        address featureRegistry_ = layout.featureRegistry;

        LibEIP2771.onlyTrustedForwarder(featureRegistry_);
        LibEIP2771.onlyLicensedUser(featureRegistry_);

        // Create the proxy contract with an EIP1167 minimal clone.
        // This proxies to the CollectionProxy implementation contract.
        // which in turn proxies to feature registry implementations. 🤯
        address collectionAddress = _deployMinimalProxy(
            layout.collectionProxyImplementation,
            salt
        );
        CollectionProxy(payable(collectionAddress))
            .__CollectionProxy_initialize(featureRegistry_);

        // Initialize ownership
        address collectionCreatorLU = LibEIP2771.msgSender(featureRegistry_);
        IOwnableFeature(collectionAddress).__OwnableFeature_initialize(
            collectionCreatorLU
        );

        // Initialize ERC721 properties
        IERC721Feature(collectionAddress).__ERC721Feature_initialize(
            name,
            symbol
        );

        CollectionRegistry(layout.collectionRegistry).addCollection(
            collectionAddress
        );

        emit CollectionCreated(
            collectionAddress,
            collectionCreatorLU,
            name,
            symbol,
            salt
        );
    }
}
