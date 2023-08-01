pragma solidity 0.8.13;

import "@openzeppelin/contracts/utils/Strings.sol";

import "../../contracts/collection/features/erc721/ERC721Errors.sol";
import "../../contracts/collection/features/erc721/LibERC721Events.sol";
import {SRRApproveTransferFeatureV01} from "../../contracts/collection/features/SRRApproveTransferFeatureV01.sol";
import "../../contracts/collection/features/interfaces/ISRRApproveTransferFeatureV01.sol";
import "../../contracts/collection/features/shared/LibFeatureCommon.sol";
import "../../contracts/lib/IDGeneratorV3.sol";
import "../../contracts/name/Contracts.sol";

import "./StartrailTestBase.sol";

// shared test data
bytes32 constant revealHash = keccak256("some_secret");
bytes32 constant commitmentHash = keccak256(abi.encode(revealHash));
string constant historyMetadataHash = "d83adb5e14eab9a082a8a9b40bcab2e80b191698886888e0691809052d11a379";

contract SRRApproveTransferFeatureTest is StartrailTestBase {
    SRRApproveTransferFeatureV01 internal feature;

    address internal collectionAddress;
    address internal collectionOwnerLU;
    address internal notAnOwner;
    address internal aNewOwner;

    uint256 tokenIdShared;

    function setUp() public override {
        super.setUp();

        collectionOwnerLU = licensedUser1;
        notAnOwner = vm.addr(0x7788);
        aNewOwner = vm.addr(0x9900);

        collectionAddress = createCollection(collectionOwnerLU);

        feature = SRRApproveTransferFeatureV01(collectionAddress);

        // Setup a shared SRR and approve it - a number of tests will use
        // this one below
        tokenIdShared = createSRRWithDefaults(
            collectionAddress,
            trustedForwarder,
            collectionOwnerLU
        );

        approveSRRByCommitment(
            collectionAddress,
            trustedForwarder,
            collectionOwnerLU,
            tokenIdShared,
            commitmentHash,
            historyMetadataHash,
            0,
            0x0
        );
    }

    function testApproveWithNoCustomHistorySuccess() public {
        uint256 tokenId = createSRRWithDefaults(
            collectionAddress,
            trustedForwarder,
            collectionOwnerLU
        );

        vm.expectEmit(true, true, false, true);
        emit LibSRRApproveTransferFeatureEvents.SRRCommitment(
            tokenId,
            commitmentHash
        );

        approveSRRByCommitment(
            collectionAddress,
            trustedForwarder,
            collectionOwnerLU,
            tokenId,
            commitmentHash,
            historyMetadataHash,
            0,
            0x0
        );

        (
            bytes32 resultCommitment,
            string memory resultHistoryMetadataHash,
            uint256 resultCustomHistoryId
        ) = feature.getSRRCommitment(tokenId);

        assertEq(resultCommitment, commitmentHash);
        assertEq(historyMetadataHash, resultHistoryMetadataHash);
        assertEq(0, resultCustomHistoryId);
    }

    function testApproveWithCustomHistorySuccess() public {
        uint256 tokenId = createSRRWithDefaults(
            collectionAddress,
            trustedForwarder,
            collectionOwnerLU
        );

        vm.expectEmit(true, true, true, true);
        emit LibSRRApproveTransferFeatureEvents.SRRCommitment(
            tokenId,
            commitmentHash,
            CUSTOM_HISTORY_ID_EXHIBITION
        );

        approveSRRByCommitment(
            collectionAddress,
            trustedForwarder,
            collectionOwnerLU,
            tokenId,
            commitmentHash,
            historyMetadataHash,
            CUSTOM_HISTORY_ID_EXHIBITION,
            0x0
        );

        (
            bytes32 resultCommitment,
            string memory resultHistoryMetadataHash,
            uint256 resultCustomHistoryId
        ) = feature.getSRRCommitment(tokenId);

        assertEq(resultCommitment, commitmentHash);
        assertEq(historyMetadataHash, resultHistoryMetadataHash);
        assertEq(CUSTOM_HISTORY_ID_EXHIBITION, resultCustomHistoryId);
    }

    function testRevert_ApproveCustomHistoryDoesNotExist() public {
        approveSRRByCommitment(
            collectionAddress,
            trustedForwarder,
            collectionOwnerLU,
            tokenIdShared,
            commitmentHash,
            historyMetadataHash,
            100, // custom history does not exist
            ISRRApproveTransferFeatureV01.CustomHistoryDoesNotExist.selector
        );
    }

    function testRevert_ApproveNotSRROwner() public {
        approveSRRByCommitment(
            collectionAddress,
            trustedForwarder,
            notAnOwner,
            tokenIdShared,
            commitmentHash,
            historyMetadataHash,
            CUSTOM_HISTORY_ID_EXHIBITION,
            ISRRApproveTransferFeatureV01.NotSRROwner.selector
        );
    }

    function testRevert_ApproveTokenNotExist() public {
        approveSRRByCommitment(
            collectionAddress,
            trustedForwarder,
            collectionOwnerLU,
            12345, // no token exists with this id
            commitmentHash,
            historyMetadataHash,
            CUSTOM_HISTORY_ID_EXHIBITION,
            TokenNotExists.selector
        );
    }

    function testRevert_TransferTokenNotExists() public {
        vm.expectRevert(TokenNotExists.selector);
        feature.transferSRRByReveal(
            aNewOwner,
            revealHash,
            12345, // no token exists with this id
            false
        );
    }

    function testRevert_TransferWithIncorrectRevealHash() public {
        vm.expectRevert(
            ISRRApproveTransferFeatureV01.IncorrectRevealHash.selector
        );
        feature.transferSRRByReveal(
            aNewOwner,
            keccak256("wrong_hash"),
            tokenIdShared,
            false
        );
    }

    function testTransferSuccess() public {
        ERC721FeatureV01 erc721 = ERC721FeatureV01(collectionAddress);
        address currentOwner = erc721.ownerOf(tokenIdShared);

        vm.expectEmit(true, true, true, false);
        emit LibERC721Events.Transfer(currentOwner, aNewOwner, tokenIdShared);

        feature.transferSRRByReveal(
            aNewOwner,
            revealHash,
            tokenIdShared,
            false
        );

        assertEq(aNewOwner, erc721.ownerOf(tokenIdShared));
    }

    function testCancelSuccess() public {
        uint256 tokenIdForCancel = createSRRWithDefaults(
            collectionAddress,
            trustedForwarder,
            collectionOwnerLU
        );

        approveSRRByCommitment(
            collectionAddress,
            trustedForwarder,
            collectionOwnerLU,
            tokenIdForCancel,
            commitmentHash,
            historyMetadataHash,
            1, // non-zero to properly test it's removed
            0x0
        );

        // verify approval commitment set
        (bytes32 resultCommitment, , ) = feature.getSRRCommitment(
            tokenIdForCancel
        );
        assertEq(resultCommitment, commitmentHash);

        // execute the cancel
        vm.prank(trustedForwarder);
        (bool success, ) = collectionAddress.call(
            eip2771AppendSender(
                abi.encodeWithSelector(
                    feature.cancelSRRCommitment.selector,
                    tokenIdForCancel
                ),
                collectionOwnerLU
            )
        );
        require(success);

        // verify all properties cancelled
        (
            bytes32 commitmentAfterCancel,
            string memory metadataAfterCancel,
            uint256 historyIdAfterCancel
        ) = feature.getSRRCommitment(tokenIdForCancel);

        assertEq(bytes32(0), commitmentAfterCancel);
        assertEq("", metadataAfterCancel);
        assertEq(0, historyIdAfterCancel);
    }

    function testRevert_CancelNotSRROwner() public {
        vm.prank(trustedForwarder);
        vm.expectRevert(ISRRApproveTransferFeatureV01.NotSRROwner.selector);
        (bool success, ) = collectionAddress.call(
            eip2771AppendSender(
                abi.encodeWithSelector(
                    feature.cancelSRRCommitment.selector,
                    tokenIdShared
                ),
                notAnOwner
            )
        );
        success; // suppresses unused variable warning
    }
}
