pragma solidity 0.8.28;

import "@openzeppelin/contracts/utils/Strings.sol";
import {DSTestPlus} from "solmate/test/utils/DSTestPlus.sol";

import "../../contracts/collection/features/erc721/ERC721Errors.sol";
import "../../contracts/collection/features/erc721/LibERC721Events.sol";
import {SRRHistoryFeatureV01} from "../../contracts/collection/features/SRRHistoryFeatureV01.sol";
import "../../contracts/collection/features/interfaces/ISRRHistoryFeatureV01.sol";
import "../../contracts/collection/features/shared/LibFeatureCommonV02.sol";
import "../../contracts/collection/features/shared/LibSRRHistoryEvents.sol";
import "../../contracts/lib/IDGeneratorV3.sol";
import "../../contracts/name/Contracts.sol";

import "./StartrailTestBase.sol";

contract SRRHistoryFeatureTest is StartrailTestBase {
    SRRHistoryFeatureV01 internal feature;

    address internal collectionAddress;
    address internal collectionOwnerLU;
    address internal notAnOwner;
    address internal newCollectionOwner;

    uint256 tokenId1;
    uint256 tokenId2;
    uint256 tokenId3;

    uint256[] test2TokenIds = new uint256[](2);
    uint256[] test3TokenIds = new uint256[](3);
    uint256[] test2CustomHistoryIds = new uint256[](2);

    function setUp() public override {
        super.setUp();

        collectionOwnerLU = licensedUser1Address;
        notAnOwner = vm.addr(0x7788);
        newCollectionOwner = vm.addr(0x9900);

        collectionAddress = createCollection(collectionOwnerLU);

        feature = SRRHistoryFeatureV01(collectionAddress);

        // Setup a few SRRs to test with
        tokenId1 = createSRRWithDefaults(
            collectionAddress,
            trustedForwarder,
            collectionOwnerLU
        );
        tokenId2 = createSRRWithDefaults(
            collectionAddress,
            trustedForwarder,
            collectionOwnerLU
        );
        tokenId3 = createSRRWithDefaults(
            collectionAddress,
            trustedForwarder,
            collectionOwnerLU
        );

        test2CustomHistoryIds[0] = CUSTOM_HISTORY_ID_EXHIBITION;
        test2CustomHistoryIds[1] = CUSTOM_HISTORY_ID_AUCTION;

        test2TokenIds[0] = tokenId1;
        test2TokenIds[1] = tokenId2;

        test3TokenIds[0] = tokenId1;
        test3TokenIds[1] = tokenId2;
        test3TokenIds[2] = tokenId3;

        // transfer ownership of collection to a new owner so there is a
        // different address for issuer and collection owner. this will
        // help to make distinct tests from these different users
        OwnableFeatureV01 ownableFeature = OwnableFeatureV01(collectionAddress);
        vm.prank(trustedForwarder);
        (bool success, ) = collectionAddress.call(
            eip2771AppendSender(
                abi.encodeWithSelector(
                    ownableFeature.transferOwnership.selector,
                    newCollectionOwner
                ),
                collectionOwnerLU
            )
        );
        require(success);
        assertEq(ownableFeature.owner(), newCollectionOwner);
    }

    function callAddHistory(
        address collectionAddress_,
        address sender,
        address trustedForwarder_,
        uint256[] memory tokenIds,
        uint256[] memory customHistoryIds
    ) internal returns (bool success) {
        vm.prank(trustedForwarder_);
        (success, ) = collectionAddress_.call(
            eip2771AppendSender(
                abi.encodeWithSelector(
                    SRRHistoryFeatureV01.addHistory.selector,
                    tokenIds,
                    customHistoryIds
                ),
                sender
            )
        );
    }

    function testAddHistorySuccess() public {
        uint256[] memory tokenIds = new uint256[](1);
        tokenIds[0] = tokenId1;

        uint256[] memory customHistoryIds = new uint256[](1);
        customHistoryIds[0] = CUSTOM_HISTORY_ID_EXHIBITION;

        SRRFeatureV02 srr = SRRFeatureV02(collectionAddress);
        (, address artist, address issuer) = srr.getSRR(tokenId1);

        ERC721FeatureV01 erc721 = ERC721FeatureV01(collectionAddress);
        address tokenOwner = erc721.ownerOf(tokenId1);

        // Test success with each of the 4 permitted sender types:
        address[] memory senders = new address[](4);
        senders[0] = newCollectionOwner;
        senders[1] = tokenOwner;
        senders[2] = artist;
        senders[3] = issuer;

        for (uint8 idx = 0; idx < senders.length; idx++) {
            vm.recordLogs();

            bool success = callAddHistory(
                collectionAddress,
                trustedForwarder,
                senders[idx],
                tokenIds,
                customHistoryIds
            );
            assertTrue(success);

            // Verify tokens and custom histories logged correctly:
            Vm.Log[] memory entries = vm.getRecordedLogs();
            assertEq32(
                keccak256(entries[0].data),
                keccak256(abi.encode(tokenIds, customHistoryIds))
            );
        }
    }

    function testRevert_MaxExceeded() public {
        vm.expectRevert(
            ISRRHistoryFeatureV01.MaxCombinedTokensAndHistoriesExceeded.selector
        );
        // revert: 3 * 2 > 4
        // see MockStartrailRegistry which defaults max to 4
        SRRHistoryFeatureV01(collectionAddress).addHistory(
            test3TokenIds,
            test2CustomHistoryIds
        );
    }

    function testRevert_AddHistoryNotPermitted() public {
        vm.prank(trustedForwarder);
        vm.expectRevert(ISRRHistoryFeatureV01.AddHistoryNotPermitted.selector);
        (bool success, ) = collectionAddress.call(
            eip2771AppendSender(
                abi.encodeWithSelector(
                    SRRHistoryFeatureV01.addHistory.selector,
                    test2TokenIds,
                    test2CustomHistoryIds
                ),
                // NOT issuer, artist, collection owner or srr owner:
                notAnOwner
            )
        );
        assertTrue(success, "expectRevert: call did not revert");
    }
}
