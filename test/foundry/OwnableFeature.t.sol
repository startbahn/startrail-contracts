pragma solidity 0.8.13;

import {OwnableFeature, OwnableFeatureAlreadyInitialized} from "../../contracts/collection/features/OwnableFeature.sol";
import "../../contracts/collection/features/shared/LibFeatureCommon.sol";

import "./StartrailTestBase.sol";

contract OwnableFeatureTest is StartrailTestBase {
    OwnableFeature internal ownableFeature;
    address internal collectionAddress;
    address internal collectionOwnerLU;

    address internal newOwner;
    address internal notOwner;

    function setUp() public override {
        super.setUp();

        newOwner = vm.addr(0x888);
        notOwner = vm.addr(0x999);

        collectionOwnerLU = licensedUser1;
        collectionAddress = createCollection(collectionOwnerLU);
        ownableFeature = OwnableFeature(collectionAddress);
    }

    function testInitialized() public {
        assertEq(ownableFeature.owner(), collectionOwnerLU);
    }

    function testTransferOwnership() public {
        vm.prank(collectionOwnerLU);
        ownableFeature.transferOwnership(newOwner);
        assertEq(ownableFeature.owner(), newOwner);
    }

    function testRevert_TransferOwnershipNotOwner() public {
        vm.expectRevert(bytes("Ownable: sender must be owner"));
        vm.prank(notOwner);
        ownableFeature.transferOwnership(newOwner);
    }

    function testRevert_AlreadyInitialized() public {
        vm.expectRevert(OwnableFeatureAlreadyInitialized.selector);
        ownableFeature.__OwnableFeature_initialize(collectionOwnerLU);
    }
}
