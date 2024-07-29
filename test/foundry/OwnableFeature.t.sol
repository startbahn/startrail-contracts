// SPDX-License-Identifier: GPL-3.0-only

pragma solidity 0.8.21;

import {OwnableFeatureV01, OwnableFeatureAlreadyInitialized} from "../../contracts/collection/features/OwnableFeatureV01.sol";
import "../../contracts/collection/features/shared/LibFeatureCommon.sol";

import "./StartrailTestBase.sol";

contract OwnableFeatureTest is StartrailTestBase {
    OwnableFeatureV01 internal ownableFeature;
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
        ownableFeature = OwnableFeatureV01(collectionAddress);
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

    function testRevert_TransferOwnershipNotCollectionOwner() public {
        expectRevertTransferOwnership(
            notOwner,
            newOwner,
            LibFeatureCommon.NotCollectionOwner.selector
        );
    }

    function testRevert_TransferOwnershipZeroAddress() public {
        expectRevertTransferOwnership(
            collectionOwnerLU,
            address(0x0),
            IOwnableFeatureV01.ZeroAddress.selector
        );
    }

    function testRevert_TransferOwnershipNotTrustedForwarder() public {
        vm.prank(collectionOwnerLU);
        vm.expectRevert(LibEIP2771.NotTrustedForwarder.selector);
        ownableFeature.transferOwnership(newOwner);
    }

    function testRevert_AlreadyInitialized() public {
        vm.expectRevert(OwnableFeatureAlreadyInitialized.selector);
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
