pragma solidity 0.8.28;

import "@openzeppelin/contracts/utils/Strings.sol";

import "../../contracts/collection/features/erc721/ERC721Errors.sol";
import "../../contracts/collection/features/erc721/LibERC721Events.sol";
import {SRRApproveTransferFeatureV04} from "../../contracts/collection/features/SRRApproveTransferFeatureV04.sol";
import "../../contracts/collection/features/interfaces/ISRRApproveTransferFeatureV04.sol";
import "../../contracts/collection/features/interfaces/IERC721FeatureV05.sol";
import "../../contracts/collection/features/shared/LibFeatureCommonV02.sol";
import "../../contracts/lib/IDGeneratorV3.sol";
import "../../contracts/name/Contracts.sol";

import "./StartrailTestBase.sol";

// shared test data
bytes32 constant revealHash = keccak256("some_secret");
bytes32 constant commitmentHash = keccak256(abi.encode(revealHash));
string constant historyMetadataHash = "d83adb5e14eab9a082a8a9b40bcab2e80b191698886888e0691809052d11a379";

contract SRRApproveTransferFeatureTest is StartrailTestBase {
    SRRApproveTransferFeatureV04 internal feature;

    address internal collectionAddress;
    address internal collectionOwnerLU;
    address internal notAnOwner;
    address internal aNewOwner;

    uint256 tokenIdShared;

    function setUp() public override {
        super.setUp();

        collectionOwnerLU = licensedUser1Address;
        notAnOwner = vm.addr(0x7788);
        aNewOwner = vm.addr(0x9900);

        collectionAddress = createCollection(collectionOwnerLU);

        feature = SRRApproveTransferFeatureV04(collectionAddress);

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

    function approveSRRByCommitmentFromApprover(
        address approver,
        uint256 tokenId,
        bytes32 commitment,
        string memory metadataHash
    ) internal {
        vm.prank(approver);
        vm.expectEmit(true, true, false, true);
        emit ISRRApproveTransferFeatureV04.SRRCommitment(
            tokenId,
            commitment,
            approver
        );

        feature.approveSRRByCommitment(tokenId, commitment, metadataHash);
    }

    function verifySRRCommitment(
        uint256 tokenId,
        bytes32 expectedCommitment,
        string memory expectedMetadataHash,
        uint256 expectedCustomHistoryId
    ) internal {
        (
            bytes32 resultCommitment,
            string memory resultHistoryMetadataHash,
            uint256 resultCustomHistoryId
        ) = feature.getSRRCommitment(tokenId);

        assertEq(resultCommitment, expectedCommitment);
        assertEq(resultHistoryMetadataHash, expectedMetadataHash);
        assertEq(resultCustomHistoryId, expectedCustomHistoryId);
    }

    function createAndApproveSRRByCommitment(
        address approver,
        address to
    ) internal returns (uint256 tokenId) {
        tokenId = createSRRWithToAddress(
            collectionAddress,
            trustedForwarder,
            collectionOwnerLU,
            to
        );

        approveSRRByCommitment(
            collectionAddress,
            trustedForwarder,
            approver,
            tokenId,
            commitmentHash,
            historyMetadataHash,
            1, // non-zero to test removal
            0x0
        );

        // Verify commitment is set
        (bytes32 resultCommitment, , ) = feature.getSRRCommitment(tokenId);
        assertEq(resultCommitment, commitmentHash);
    }

    function verifyCommitmentCleared(uint256 tokenId) internal {
        (
            bytes32 commitmentAfterCancel,
            string memory metadataAfterCancel,
            uint256 historyIdAfterCancel
        ) = feature.getSRRCommitment(tokenId);

        assertEq(bytes32(0), commitmentAfterCancel);
        assertEq("", metadataAfterCancel);
        assertEq(0, historyIdAfterCancel);
    }

    function testApproveWithNoCustomHistorySuccess() public {
        uint256 tokenId = createSRRWithDefaults(
            collectionAddress,
            trustedForwarder,
            collectionOwnerLU
        );

        vm.expectEmit(true, true, false, true);
        emit ISRRApproveTransferFeatureV04.SRRCommitment(
            tokenId,
            commitmentHash,
            collectionOwnerLU
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

        verifySRRCommitment(tokenId, commitmentHash, historyMetadataHash, 0);
    }

    function testApproveWithCustomHistorySuccess() public {
        uint256 tokenId = createSRRWithDefaults(
            collectionAddress,
            trustedForwarder,
            collectionOwnerLU
        );

        vm.expectEmit(true, true, true, true);
        emit ISRRApproveTransferFeatureV04.SRRCommitment(
            tokenId,
            commitmentHash,
            CUSTOM_HISTORY_ID_EXHIBITION,
            collectionOwnerLU
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

        verifySRRCommitment(
            tokenId,
            commitmentHash,
            historyMetadataHash,
            CUSTOM_HISTORY_ID_EXHIBITION
        );
    }

    function testApproveSuccessByCollectionOwner() public {
        // Approve commitment as collection owner
        approveSRRByCommitmentFromApprover(
            collectionOwnerLU,
            tokenIdShared,
            commitmentHash,
            historyMetadataHash
        );

        // Verify the commitment
        verifySRRCommitment(
            tokenIdShared,
            commitmentHash,
            historyMetadataHash,
            0
        );
    }

    function testApproveSuccessBySRROwner() public {
        // Mint a new token to aNewOwner
        uint256 tokenId = createSRRWithToAddress(
            collectionAddress,
            trustedForwarder,
            collectionOwnerLU,
            aNewOwner
        );

        // Approve commitment as SRR owner
        approveSRRByCommitmentFromApprover(
            aNewOwner,
            tokenId,
            commitmentHash,
            historyMetadataHash
        );

        // Verify the commitment
        verifySRRCommitment(tokenId, commitmentHash, historyMetadataHash, 0);
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
            LibSRRApproveTransferV02.CustomHistoryDoesNotExist.selector
        );
    }

    function testRevert_ApproveNotCollectionOwnerOrSRROwner() public {
        approveSRRByCommitment(
            collectionAddress,
            trustedForwarder,
            notAnOwner,
            tokenIdShared,
            commitmentHash,
            historyMetadataHash,
            CUSTOM_HISTORY_ID_EXHIBITION,
            LibFeatureCommonV02.NotCollectionOwnerOrSRROwner.selector
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
            SRRNotExists.selector
        );
    }

    function testRevert_TransferSRRNotExists() public {
        vm.expectRevert(SRRNotExists.selector);
        feature.transferSRRByReveal(
            aNewOwner,
            revealHash,
            12345, // no token exists with this id
            false
        );
    }

    function testRevert_TransferWithIncorrectRevealHash() public {
        vm.expectRevert(LibSRRApproveTransferV02.IncorrectRevealHash.selector);
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

        emit IERC721FeatureV05.Provenance(
            tokenIdShared,
            currentOwner,
            aNewOwner,
            historyMetadataHash,
            string(abi.encodePacked("ipfs://", historyMetadataHash)),
            false
        );

        feature.transferSRRByReveal(
            aNewOwner,
            revealHash,
            tokenIdShared,
            false
        );

        assertEq(aNewOwner, erc721.ownerOf(tokenIdShared));
    }

    function testCancelSuccessBySRROwner() public {
        uint256 tokenIdForCancel = createAndApproveSRRByCommitment(
            aNewOwner,
            aNewOwner
        );

        // Cancel commitment as srr owner
        cancelSRRCommitment(collectionAddress, aNewOwner, tokenIdForCancel);

        // Verify the cancellation
        verifyCommitmentCleared(tokenIdForCancel);
    }

    function testCancelSuccessByCollectionOwner() public {
        uint256 tokenIdForCancel = createAndApproveSRRByCommitment(
            collectionOwnerLU,
            aNewOwner
        );

        // Cancel commitment as collection owner
        cancelSRRCommitment(
            collectionAddress,
            collectionOwnerLU,
            tokenIdForCancel
        );

        // Verify the cancellation
        verifyCommitmentCleared(tokenIdForCancel);
    }

    function testRevert_CancelNotCollectionOwnerOrSRROwner() public {
        vm.prank(trustedForwarder);
        vm.expectRevert(
            LibFeatureCommonV02.NotCollectionOwnerOrSRROwner.selector
        );
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
