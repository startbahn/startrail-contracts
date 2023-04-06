// SPDX-License-Identifier: GPL-3.0-only
pragma solidity 0.8.13;

import "../../contracts/collection/features/ERC721Feature.sol";
import "../../contracts/collection/features/shared/LibFeatureCommon.sol";

import "./StartrailTestBase.sol";

contract ERC721FeatureTest is StartrailTestBase {
    ERC721Feature internal erc721Feature;
    address internal collectionAddress;
    address internal collectionOwnerLU;

    uint256 internal unlockedTokenId;
    uint256 internal lockedTokenId;

    address internal user1 = vm.addr(0xaaaa);
    address internal user2 = vm.addr(0xbbbb);

    // shared params for transferFromWithProvenance tests
    address tpTo = user2;
    uint256 tpCustomHistoryId = 1;
    bool tpIsIntermediary = false;
    string tpHistoryMetadataHash = A_CID;

    function setUp() public override {
        super.setUp();

        collectionOwnerLU = licensedUser1;
        collectionAddress = createCollection(collectionOwnerLU);
        erc721Feature = ERC721Feature(collectionAddress);

        unlockedTokenId = createSRRWithDefaults(
            collectionAddress,
            trustedForwarder,
            collectionOwnerLU
        );

        lockedTokenId = createSRRWithDefaults(
            collectionAddress,
            trustedForwarder,
            collectionOwnerLU
        );
        require(
            setLockExternalTransfer(
                collectionAddress,
                collectionOwnerLU,
                trustedForwarder,
                lockedTokenId
            )
        );
    }

    function testInitialized() public {
        assertEq(erc721Feature.name(), COLLECTION_NAME);
        assertEq(erc721Feature.symbol(), COLLECTION_SYMBOL);
    }

    function testTransferFromWithProvenance() public {
        vm.recordLogs();

        vm.prank(trustedForwarder);
        (bool success, ) = collectionAddress.call(
            eip2771AppendSender(
                abi.encodeWithSelector(
                    IERC721Feature.transferFromWithProvenance.selector,
                    tpTo,
                    unlockedTokenId,
                    tpHistoryMetadataHash,
                    tpCustomHistoryId,
                    tpIsIntermediary
                ),
                collectionOwnerLU
            )
        );
        assertTrue(success);

        Vm.Log[] memory entries = vm.getRecordedLogs();

        Vm.Log memory provenanceLog = entries[0];
        assertEq(uint256(provenanceLog.topics[1]), unlockedTokenId);
        assertEq(bytes32ToAddress(provenanceLog.topics[2]), collectionOwnerLU);
        assertEq(bytes32ToAddress(provenanceLog.topics[3]), tpTo);

        Vm.Log memory transferLog = entries[1];
        assertEq(bytes32ToAddress(transferLog.topics[1]), collectionOwnerLU);
        assertEq(bytes32ToAddress(transferLog.topics[2]), tpTo);
        assertEq(uint256(transferLog.topics[3]), unlockedTokenId);
    }

    function testRevert_NotAuthorizedTransferFromWithProvenance() public {
        vm.expectRevert("NOT_AUTHORIZED");
        erc721Feature.transferFromWithProvenance(
            tpTo,
            unlockedTokenId,
            tpHistoryMetadataHash,
            tpCustomHistoryId,
            tpIsIntermediary
        );
    }

    function testRevert_AlreadyInitialized() public {
        vm.expectRevert(ERC721FeatureAlreadyInitialized.selector);
        erc721Feature.__ERC721Feature_initialize(
            COLLECTION_NAME,
            COLLECTION_SYMBOL
        );
    }

    function testRevert_TransferFromLockedToken() public {
        vm.expectRevert(LibFeatureCommon.ERC721ExternalTransferLocked.selector);
        erc721Feature.transferFrom(user1, user2, lockedTokenId);
    }

    function testRevert_SafeTransferFromLockedToken() public {
        vm.expectRevert(LibFeatureCommon.ERC721ExternalTransferLocked.selector);
        erc721Feature.safeTransferFrom(user1, user2, lockedTokenId);
    }

    function testRevert_SafeTransferWithDataFromLockedToken() public {
        vm.expectRevert(LibFeatureCommon.ERC721ExternalTransferLocked.selector);
        erc721Feature.safeTransferFrom(user1, user2, lockedTokenId, "");
    }

    function testRevert_approveLockedToken() public {
        vm.expectRevert(LibFeatureCommon.ERC721ExternalTransferLocked.selector);
        erc721Feature.approve(user2, lockedTokenId);
    }

    function testRevert_transferFromWithProvenanceLockedToken() public {
        vm.expectRevert(LibFeatureCommon.ERC721ExternalTransferLocked.selector);
        erc721Feature.transferFromWithProvenance(
            tpTo,
            lockedTokenId,
            tpHistoryMetadataHash,
            tpCustomHistoryId,
            tpIsIntermediary
        );
    }
}
