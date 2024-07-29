pragma solidity 0.8.21;

import {Test} from "forge-std/Test.sol";

import "../../contracts/collection/CollectionRegistry.sol";

contract CollectionRegistryTest is Test {
    address mockFactory = vm.addr(0x745382);
    address mockCollection = vm.addr(0xadf358);
    address unauthorized = vm.addr(0x840484);

    CollectionRegistry collectionRegistry = new CollectionRegistry(mockFactory);

    // function setUp() public override {
    // }

    function testSuccessAddCollection() public {
        assertFalse(collectionRegistry.registry(mockCollection));
        vm.prank(mockFactory);
        collectionRegistry.addCollection(mockCollection);
        assertTrue(collectionRegistry.registry(mockCollection));
    }

    function testRevert_OnlyCollectionFactory() public {
        vm.prank(unauthorized);
        vm.expectRevert(CollectionRegistry.OnlyCollectionFactory.selector);
        collectionRegistry.addCollection(mockCollection);
    }
}
