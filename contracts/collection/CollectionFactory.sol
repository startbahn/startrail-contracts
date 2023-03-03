// SPDX-License-Identifier: GPL-3.0-only

pragma solidity 0.8.13;

import {Ownable, OwnableStorage} from "@solidstate/contracts/access/ownable/Ownable.sol";
import {AddressUtils} from "@solidstate/contracts/utils/AddressUtils.sol";
import {ReentrancyGuard} from "@solidstate/contracts/utils/ReentrancyGuard.sol";

import "./features/ERC721Feature.sol";
import "./features/OwnableFeature.sol";
import "./shared/LibEIP2771.sol";
import "./CollectionProxy.sol";
import "./CollectionRegistry.sol";

/**
 * @title Factory for creating Startrail NFT Collection proxies
 * @author Chris Hatch - <chris.hatch@startbahn.jp>
 */
contract CollectionFactory is Ownable, ReentrancyGuard {
    error DiamondIsNotAContract();
    error NotTrustedForwarder();

    event CollectionCreated(
        address indexed collectionAddress,
        string name,
        string symbol,
        string metadataCID
    );

    using OwnableStorage for OwnableStorage.Layout;
    using AddressUtils for address;

    CollectionRegistry public immutable _collectionRegistry;

    address public immutable _featureRegistry;

    constructor(address featureRegistry) {
        if (!featureRegistry.isContract()) {
            revert DiamondIsNotAContract();
        }
        _featureRegistry = featureRegistry;

        _collectionRegistry = new CollectionRegistry();

        OwnableStorage.layout().setOwner(msg.sender);
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
        string calldata metadataCID,
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
        LibEIP2771.onlyTrustedForwarder(_featureRegistry);
        LibEIP2771.onlyLicensedUser(_featureRegistry);

        address collectionCreatorLU = LibEIP2771.msgSender(_featureRegistry);

        // TODO: is it cheaper with assembly?
        // TODO: consider using Clones (oz) or Factory (solidstate)?
        address collectionAddress = address(
            new CollectionProxy{salt: salt}(_featureRegistry)
        );

        // TODO: making the owner the LU means we now need a meta-tx to invoke
        //       transferOwnership. see STARTRAIL-1906.
        IOwnableFeature(collectionAddress).__OwnableFeature_initialize(
            collectionCreatorLU
        );
        IERC721Feature(collectionAddress).__ERC721Feature_initialize(
            name,
            symbol
        );

        _collectionRegistry.addCollection(collectionAddress);

        // TODO: store metadataCID - for now just emit it

        emit CollectionCreated(collectionAddress, name, symbol, metadataCID);
    }
}
