pragma solidity 0.8.13;

import "../../contracts/collection/features/erc721/ERC721Errors.sol";
import {LockExternalTransferFeatureV01} from "../../contracts/collection/features/LockExternalTransferFeatureV01.sol";
import "../../contracts/collection/features/shared/LibFeatureCommon.sol";
import "../../contracts/name/Contracts.sol";

import "./StartrailTestBase.sol";

contract LockExternalTransferFeatureTest is StartrailTestBase {
    LockExternalTransferFeatureV01 internal lockExternalTransferFeature;

    address internal collectionAddress;
    address internal collectionOwnerLU;
    uint256 tokenId;

    function setUp() public override {
        super.setUp();
        collectionOwnerLU = licensedUser1;
        collectionAddress = createCollection(collectionOwnerLU);
        lockExternalTransferFeature = LockExternalTransferFeatureV01(
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
        vm.expectRevert(TokenNotExists.selector);
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
            ILockExternalTransferFeatureV01.OnlyIssuerOrCollectionOwner.selector
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
                admin
            )
        );
        assertTrue(success, "expectRevert: call did not revert");
    }
}
