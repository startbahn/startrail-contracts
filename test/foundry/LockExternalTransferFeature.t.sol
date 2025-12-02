pragma solidity 0.8.28;

import "../../contracts/collection/features/erc721/ERC721Errors.sol";
import {LockExternalTransferFeatureV02} from "../../contracts/collection/features/LockExternalTransferFeatureV02.sol";
import "../../contracts/collection/features/shared/LibFeatureCommonV02.sol";
import "../../contracts/name/Contracts.sol";

import "./StartrailTestBase.sol";

contract LockExternalTransferFeatureTest is StartrailTestBase {
    LockExternalTransferFeatureV02 internal lockExternalTransferFeature;

    address internal collectionAddress;
    address internal collectionOwnerLU;
    uint256 tokenId;

    function setUp() public override {
        super.setUp();
        collectionOwnerLU = licensedUser1Address;
        collectionAddress = createCollection(collectionOwnerLU);
        lockExternalTransferFeature = LockExternalTransferFeatureV02(
            collectionAddress
        );
        tokenId = createSRRWithDefaults(
            collectionAddress,
            trustedForwarder,
            collectionOwnerLU
        );
    }

    function testGetLockExternalTransferFalseForNonExistantToken() public {
        assertFalse(lockExternalTransferFeature.getLockExternalTransfer(999));
    }

    function testSetLockExternalTransfer() public {
        assertFalse(
            lockExternalTransferFeature.getLockExternalTransfer(tokenId)
        );

        require(
            setLockExternalTransfer(
                collectionAddress,
                collectionOwnerLU,
                trustedForwarder,
                tokenId
            )
        );
        assertTrue(
            lockExternalTransferFeature.getLockExternalTransfer(tokenId)
        );
    }

    function testRevert_SetLockExternalTransferForNonExistantToken() public {
        vm.prank(trustedForwarder);
        vm.expectRevert(SRRNotExists.selector);
        (bool success, ) = collectionAddress.call(
            eip2771AppendSender(
                abi.encodeWithSelector(
                    lockExternalTransferFeature
                        .setLockExternalTransfer
                        .selector,
                    999,
                    true
                ),
                collectionOwnerLU
            )
        );
        assertTrue(success, "expectRevert: call did not revert");
    }

    function testRevert_SetLockExternalTransferOnlyIssuerOrCollectionOwner()
        public
    {
        vm.prank(trustedForwarder);
        vm.expectRevert(
            ILockExternalTransferFeatureV02.OnlyIssuerOrCollectionOwner.selector
        );
        (bool success, ) = collectionAddress.call(
            eip2771AppendSender(
                abi.encodeWithSelector(
                    lockExternalTransferFeature
                        .setLockExternalTransfer
                        .selector,
                    tokenId,
                    true
                ),
                licensedUser2Address
            )
        );
        assertTrue(success, "expectRevert: call did not revert");
    }

    function testSetLockExternalTransferFromDeployedLUW() public {
        vm.prank(admin);
        licensedUserManager.deploy("salt1", collectionOwnerLU);
        require(
            setLockExternalTransfer(
                collectionAddress,
                collectionOwnerLU,
                collectionOwnerLU,
                tokenId
            )
        );
        assertTrue(
            lockExternalTransferFeature.getLockExternalTransfer(tokenId)
        );
    }
}
