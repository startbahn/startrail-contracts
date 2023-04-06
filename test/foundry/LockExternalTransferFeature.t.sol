pragma solidity 0.8.13;

import "../../contracts/collection/features/erc721/ERC721Errors.sol";
import {LockExternalTransferFeature} from "../../contracts/collection/features/LockExternalTransferFeature.sol";
import "../../contracts/collection/features/shared/LibFeatureCommon.sol";
import "../../contracts/name/Contracts.sol";

import "./StartrailTestBase.sol";

contract LockExternalTransferFeatureTest is StartrailTestBase {
    LockExternalTransferFeature internal lockExternalTransferFeature;
    address internal collectionAddress;
    address internal collectionOwnerLU;

    function setUp() public override {
        super.setUp();
        collectionOwnerLU = licensedUser1;
        collectionAddress = createCollection(collectionOwnerLU);
        lockExternalTransferFeature = LockExternalTransferFeature(
            collectionAddress
        );
    }

    function testGetLockExternalTransferFalseForNonExistantToken() public {
        assertFalse(lockExternalTransferFeature.getLockExternalTransfer(999));
    }

    function testSetLockExternalTransfer() public {
        uint256 tokenId = createSRRWithDefaults(
            collectionAddress,
            trustedForwarder,
            collectionOwnerLU
        );
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
        success; // suppresses unused variable warning
    }
}
