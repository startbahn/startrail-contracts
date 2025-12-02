// SPDX-License-Identifier: GPL-3.0-only

pragma solidity 0.8.28;

import {OwnableFeatureV02} from "../../contracts/collection/features/OwnableFeatureV02.sol";
import "../../contracts/collection/features/shared/LibFeatureCommonV03.sol";

import "./StartrailTestBase.sol";

contract OwnableFeatureTest is StartrailTestBase {
    OwnableFeatureV02 internal ownableFeature;
    address internal collectionAddress;
    address internal collectionOwnerLU;

    address internal newOwner;
    address internal notOwner;

    function setUp() public override {
        super.setUp();

        newOwner = vm.addr(0x888);
        notOwner = vm.addr(0x999);

        collectionOwnerLU = licensedUser1Address;
        collectionAddress = createCollection(collectionOwnerLU);
        ownableFeature = OwnableFeatureV02(collectionAddress);
    }

    function testInitialized() public {
        assertEq(ownableFeature.owner(), collectionOwnerLU);
    }

    function testTransferOwnership() public {
        vm.prank(trustedForwarder);
        (bool success, ) = collectionAddress.call(
            eip2771AppendSender(
                abi.encodeWithSelector(
                    ownableFeature.transferOwnership.selector,
                    newOwner
                ),
                collectionOwnerLU
            )
        );
        require(success);
        assertEq(ownableFeature.owner(), newOwner);
    }

    function testTransferOwnershipFromDeployedWallet() public {
        vm.prank(admin);
        licensedUserManager.deploy("salt1", collectionOwnerLU);
        vm.prank(collectionOwnerLU);
        ownableFeature.transferOwnership(newOwner);
        assertEq(ownableFeature.owner(), newOwner);
    }

    // function testTransferOwnershipFromAliasFrom() public {
    //     address collectionAddress = createCollection(collectionOwnerLU);
    //     vm.prank(admin);
    //     address newAddress = licensedUserManager.deploy("new_salt1", collectionOwnerLU);
    //     (bool success, ) = collectionAddress.call(
    //         eip2771AppendSender(
    //             abi.encodeWithSelector(
    //                 ownableFeature.transferOwnership.selector,
    //                 newOwner
    //             ),
    //             collectionOwnerLU
    //         )
    //     );
    //     require(success);
    //     assertEq(ownableFeature.owner(), newOwner);
    // }

    function testRevert_TransferOwnershipNotCollectionOwner() public {
        expectRevertTransferOwnership(
            notOwner,
            newOwner,
            LibFeatureCommonV03.NotCollectionOwner.selector
        );
    }

    function testRevert_TransferOwnershipZeroAddress() public {
        expectRevertTransferOwnership(
            collectionOwnerLU,
            address(0x0),
            IOwnableFeatureV02.ZeroAddress.selector
        );
    }

    function testRevert_AlreadyInitialized() public {
        vm.expectRevert(OwnableFeatureV02.OwnableFeatureAlreadyInitialized.selector);
        ownableFeature.__OwnableFeature_initialize(collectionOwnerLU);
    }

    function expectRevertTransferOwnership(
        address msgSender_,
        address newOwner_,
        bytes4 expectedError
    ) private {
        vm.prank(trustedForwarder);
        vm.expectRevert(expectedError);
        (bool success, ) = collectionAddress.call(
            eip2771AppendSender(
                abi.encodeWithSelector(
                    ownableFeature.transferOwnership.selector,
                    newOwner_
                ),
                msgSender_
            )
        );
        assertTrue(success, "expectRevert: call did not revert");
    }
}
