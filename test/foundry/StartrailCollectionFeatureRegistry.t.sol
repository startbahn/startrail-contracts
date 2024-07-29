pragma solidity 0.8.21;

import "forge-std/Vm.sol";
import {Test} from "forge-std/Test.sol";

import {IERC173} from "@solidstate/contracts/interfaces/IERC173.sol";
import {IERC165} from "@solidstate/contracts/interfaces/IERC165.sol";
import {IDiamondReadable} from "@solidstate/contracts/proxy/diamond/readable/IDiamondReadable.sol";
import {IERC721} from "@solidstate/contracts/interfaces/IERC721.sol";
import {IERC721Metadata} from "@solidstate/contracts/token/ERC721/metadata/IERC721Metadata.sol";

import "../../contracts/collection/registry/StartrailCollectionFeatureRegistry.sol";
import "../../contracts/name/NameRegistry.sol";

import "./StartrailTestLibrary.sol";

contract StartrailCollectionFeatureRegistryTest is StartrailTestLibrary {
    address internal adminAddress;
    address internal trustedForwarderAddress;
    address internal ownableFeatureAddress;

    NameRegistry internal nameRegistry;

    StartrailCollectionFeatureRegistry internal registry;

    function setUp() public {
        adminAddress = vm.addr(0xabc);
        vm.label(adminAddress, "Administrator");

        trustedForwarderAddress = vm.addr(0xdef);
        vm.label(trustedForwarderAddress, "EIP2771TrustedForwarder");

        nameRegistry = new NameRegistry();
        vm.label(address(nameRegistry), "NameRegistry");

        address featureRegistryAddress;
        (featureRegistryAddress, ownableFeatureAddress) = createFeatureRegistry(
            adminAddress,
            trustedForwarderAddress,
            address(nameRegistry)
        );

        registry = StartrailCollectionFeatureRegistry(featureRegistryAddress);
    }

    function testInitialOwnerIsAdmin() public {
        assertEq(adminAddress, registry.owner());
    }

    function testInitialFacetAddresses() public {
        address[] memory expectedFacetAddresses = new address[](1);
        expectedFacetAddresses[0] = ownableFeatureAddress;
        assertEq(expectedFacetAddresses, registry.facetAddresses());
    }

    function testInitialFacets() public {
        IDiamondReadable.Facet[] memory facets = registry.facets();
        assertEq(1, facets.length);

        assertEq(ownableFeatureAddress, facets[0].target);

        bytes4[] memory selectors = facets[0].selectors;
        assertEq(3, selectors.length);
        assertTrue(IERC173.owner.selector == selectors[0]);
        assertTrue(IERC173.transferOwnership.selector == selectors[1]);
        assertTrue(
            OwnableFeatureV01.__OwnableFeature_initialize.selector ==
                selectors[2]
        );
    }

    function testInitialFacetFunctionSelectors() public {
        bytes4[] memory actualSelectors = registry.facetFunctionSelectors(
            ownableFeatureAddress
        );
        assertEq(3, actualSelectors.length);
        assertTrue(IERC173.owner.selector == actualSelectors[0]);
        assertTrue(IERC173.transferOwnership.selector == actualSelectors[1]);
        assertTrue(
            OwnableFeatureV01.__OwnableFeature_initialize.selector ==
                actualSelectors[2]
        );
    }

    function testGetEIP2771TrustedForwarder() public {
        assertEq(
            trustedForwarderAddress,
            registry.getEIP2771TrustedForwarder()
        );
    }
}
