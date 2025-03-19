// SPDX-License-Identifier: GPL-3.0-only

pragma solidity 0.8.28;

import {IERC173} from "@solidstate/contracts/interfaces/IERC173.sol";
import {IDiamondWritable} from "@solidstate/contracts/proxy/diamond/writable/IDiamondWritable.sol";
import {IDiamondWritableInternal} from "@solidstate/contracts/proxy/diamond/writable/IDiamondWritableInternal.sol";
import {DiamondBaseStorage} from "@solidstate/contracts/proxy/diamond/base/DiamondBaseStorage.sol";

import {OwnableFeatureV01} from "../features/OwnableFeatureV01.sol";

import "./interfaces/IStartrailCollectionFeatureRegistry.sol";
import "./storage/LibEIP2771RecipientStorage.sol";
import "./storage/LibNameRegistryStorage.sol";
import "./FeatureRegistryBase.sol";

/**
 * @title Feature registry for Startrail collection proxy contracts
 * @author Chris Hatch - <chris.hatch@startbahn.jp>
 * @dev Each Collection proxy will use this single registry to lookup
 * and delegate to function implementations for ERC721, metadata, etc.
 */
contract StartrailCollectionFeatureRegistry is
    IStartrailCollectionFeatureRegistry,
    FeatureRegistryBase
{
    using DiamondBaseStorage for DiamondBaseStorage.Layout;

    constructor(
        address eip2771TrustedForwarder,
        address nameRegistry
    ) FeatureRegistryBase() {
        LibEIP2771RecipientStorage
            .layout()
            .trustedForwarder = eip2771TrustedForwarder;
        LibNameRegistryStorage.layout().nameRegistry = nameRegistry;

        //
        // OwnableFeature (ERC173 compatible)
        //

        OwnableFeatureV01 ownableFeature = new OwnableFeatureV01();
        emit FeatureContractCreated(address(ownableFeature), "Ownable");

        bytes4[] memory selectors = new bytes4[](3);
        selectors[0] = IERC173.owner.selector;
        selectors[1] = IERC173.transferOwnership.selector;
        selectors[2] = OwnableFeatureV01.__OwnableFeature_initialize.selector;

        FacetCut[] memory facetCuts = new FacetCut[](1);
        facetCuts[0] = FacetCut({
            target: address(ownableFeature),
            action: IDiamondWritableInternal.FacetCutAction.ADD,
            selectors: selectors
        });

        _diamondCut(facetCuts, address(0), "");

        setSupportedInterfaceInternal(type(IERC173).interfaceId, true);
    }

    /**
     * @inheritdoc IStartrailCollectionFeatureRegistry
     */
    function getEIP2771TrustedForwarder() external view returns (address) {
        return LibEIP2771RecipientStorage.layout().trustedForwarder;
    }

    /**
     * Temporary function to enable a workaround in the meta-tx-forwarder.test.ts.
     * TODO: Once we have implemented createSRR and createCollection with meta-tx's we
     * can remove this and the trusted forwarder can be immutable.
     */
    function setEIP2771TrustedForwarder(address forwarder) external onlyOwner {
        LibEIP2771RecipientStorage.layout().trustedForwarder = forwarder;
    }

    /**
     * @inheritdoc IStartrailCollectionFeatureRegistry
     */
    function getNameRegistry() external view returns (address) {
        return LibNameRegistryStorage.layout().nameRegistry;
    }
}
