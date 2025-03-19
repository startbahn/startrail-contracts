pragma solidity 0.8.28;

import "../../contracts/collection/features/erc721/ERC721Errors.sol";
import "../../contracts/collection/features/storage/LibERC2981RoyaltyStorage.sol";
import {ERC2981RoyaltyFeatureV01} from "../../contracts/collection/features/ERC2981RoyaltyFeatureV01.sol";
import "../../contracts/collection/features/shared/LibFeatureCommonV02.sol";
import "./StartrailTestBase.sol";

contract ERC2981RoyaltyFeatureTest is StartrailTestBase {
    ERC2981RoyaltyFeatureV01 internal feature;

    address internal collectionAddress;
    address internal collectionOwnerLU;
    address internal notAnOwner;

    address royaltyReceiver1;
    uint16 royaltyBasisPoints1;

    address royaltyReceiver2;
    uint16 royaltyBasisPoints2;

    uint256 tokenIdNoRoyaltyShared;
    uint256 tokenId1Shared;
    uint256 tokenId2Shared;

    function setUp() public override {
        super.setUp();

        collectionOwnerLU = licensedUser1Address;
        notAnOwner = vm.addr(0x7788);

        royaltyReceiver1 = vm.addr(0x9911);
        royaltyBasisPoints1 = 1_570; // 15.7%

        royaltyReceiver2 = vm.addr(0x9922);
        royaltyBasisPoints2 = 1_000; // 10%

        collectionAddress = createCollection(collectionOwnerLU);

        feature = ERC2981RoyaltyFeatureV01(collectionAddress);

        tokenIdNoRoyaltyShared = createSRRWithDefaults(
            collectionAddress,
            trustedForwarder,
            collectionOwnerLU
        );

        tokenId1Shared = createSRR(
            collectionAddress,
            trustedForwarder,
            collectionOwnerLU,
            true,
            vm.addr(0x9933),
            A_CID,
            false,
            address(0),
            royaltyReceiver1,
            royaltyBasisPoints1,
            bytes4(0)
        );

        tokenId2Shared = createSRR(
            collectionAddress,
            trustedForwarder,
            collectionOwnerLU,
            true,
            vm.addr(0x9944),
            A_CID,
            false,
            address(0),
            royaltyReceiver2,
            royaltyBasisPoints2,
            bytes4(0)
        );
    }

    function testRevertUpdateSRRRoyalty_OnlyAdmin() public {
        vm.prank(notAnOwner);

        vm.expectRevert(LibFeatureCommonV02.NotAdministrator.selector);

        feature.updateSRRRoyalty(
            tokenId1Shared,
            royaltyReceiver1,
            royaltyBasisPoints1
        );
    }

    function testRevertUpdateSRRRoyalty_SRRNotExists() public {
        vm.prank(collectionOwnerLU);

        vm.expectRevert(SRRNotExists.selector);

        uint256 tokenId = 12345; // no token exists with this id

        feature.updateSRRRoyalty(
            tokenId,
            royaltyReceiver1,
            royaltyBasisPoints1
        );
    }

    function testRevertUpdateSRRRoyalty_RoyaltyNotExists() public {
        vm.prank(admin);

        vm.expectRevert(LibERC2981RoyaltyStorage.RoyaltyNotExists.selector);

        feature.updateSRRRoyalty(
            tokenIdNoRoyaltyShared, // no royalty
            royaltyReceiver1,
            royaltyBasisPoints1
        );
    }

    function testRevertUpdateSRRRoyalty_ReceiverNotAddressZero() public {
        vm.prank(admin);

        vm.expectRevert(
            LibERC2981RoyaltyStorage.RoyaltyReceiverNotAddressZero.selector
        );

        address royaltyReceiver = address(0);

        feature.updateSRRRoyalty(
            tokenId1Shared,
            royaltyReceiver,
            royaltyBasisPoints1
        );
    }

    function testRevertUpdateSRRRoyalty_FeeNotToExceedSalePrice() public {
        vm.prank(admin);

        vm.expectRevert(
            LibERC2981RoyaltyStorage.RoyaltyFeeNotToExceedSalePrice.selector
        );

        feature.updateSRRRoyalty(tokenId1Shared, royaltyReceiver1, 11_000); // 110%
    }

    function testUpdateSRRRoyaltySuccess() public {
        vm.prank(admin);

        (bool success, ) = collectionAddress.call(
            abi.encodeWithSelector(
                feature.updateSRRRoyalty.selector,
                tokenId1Shared,
                royaltyReceiver2,
                royaltyBasisPoints2
            )
        );
        require(success);

        // verify the updated royalty
        (address receiver, uint16 basisPoints) = feature.getSRRRoyalty(
            tokenId1Shared
        );

        assertEq(royaltyReceiver2, receiver);
        assertEq(royaltyBasisPoints2, basisPoints);
    }

    function testRevertUpdateSRRRoyaltyReceiverMulti_SRRNotExists() public {
        vm.prank(admin);

        vm.expectRevert(SRRNotExists.selector);

        uint256[] memory tokenIds = new uint256[](2);
        tokenIds[0] = 12345; // no token exists with this id
        tokenIds[1] = tokenId2Shared;

        address updatedReceiver = vm.addr(0x9955);

        feature.updateSRRRoyaltyReceiverMulti(tokenIds, updatedReceiver);
    }

    function testRevertUpdateSRRRoyaltyReceiverMulti_ReceiverNotAddressZero()
        public
    {
        vm.prank(admin);

        vm.expectRevert(
            LibERC2981RoyaltyStorage.RoyaltyReceiverNotAddressZero.selector
        );

        uint256[] memory tokenIds = new uint256[](2);
        tokenIds[0] = tokenId1Shared;
        tokenIds[1] = tokenId2Shared;

        address updatedReceiver = address(0);

        feature.updateSRRRoyaltyReceiverMulti(tokenIds, updatedReceiver);
    }

    function testRevertUpdateSRRRoyaltyReceiverMulti_RoyaltyNotExists() public {
        vm.prank(admin);
        vm.expectRevert(LibERC2981RoyaltyStorage.RoyaltyNotExists.selector);

        uint256[] memory tokenIds = new uint256[](2);
        tokenIds[0] = tokenIdNoRoyaltyShared; // no royalty
        tokenIds[1] = tokenId2Shared;

        address updatedReceiver = vm.addr(0x9966);

        feature.updateSRRRoyaltyReceiverMulti(tokenIds, updatedReceiver);
    }

    function testUpdateSRRRoyaltyReceiverMultiSuccess() public {
        vm.prank(admin);

        uint256[] memory tokenIds = new uint256[](2);
        tokenIds[0] = tokenId1Shared;
        tokenIds[1] = tokenId2Shared;

        address updatedReceiver = vm.addr(0x9977);

        feature.updateSRRRoyaltyReceiverMulti(tokenIds, updatedReceiver);

        // verify the updated royalty receiver
        (address receiver1, uint16 basisPoints1) = feature.getSRRRoyalty(
            tokenId1Shared
        );

        assertEq(updatedReceiver, receiver1);
        assertGe(basisPoints1, 0);

        (address receiver2, uint16 basisPoints2) = feature.getSRRRoyalty(
            tokenId2Shared
        );

        assertEq(updatedReceiver, receiver2);
        assertGe(basisPoints2, 0);
    }

    function testRoyaltyInfoTokenExists() public {
        vm.prank(notAnOwner);

        (address expectedRoyaltyReceiver, uint16 basisPoints) = feature
            .getSRRRoyalty(tokenId1Shared);

        uint256 salePrice = 1_000_000;

        uint256 expectedRoyaltyAmount = (salePrice * basisPoints) / 10_000;

        (address receiver, uint256 royaltyAmount) = feature.royaltyInfo(
            tokenId1Shared,
            salePrice
        );

        assertEq(expectedRoyaltyReceiver, receiver);
        assertEq(expectedRoyaltyAmount, royaltyAmount);
    }

    function testRoyaltyInfo_SRRNotExists() public {
        vm.prank(notAnOwner);

        //  The default receiver address 0x75194F40c5337d218A6798B02BbB34500a653A16 is what we use for OpenSea.
        // For all environments like QA, STG and production.
        // As we set the default royalty to 0, this shouldn’t matter if there is no receiver

        address expectedRoyaltyReceiver = address(
            0x75194F40c5337d218A6798B02BbB34500a653A16
        );

        uint256 salePrice = 1_000_000;

        uint256 expectedRoyaltyAmount = 0;

        uint256 tokenId = 12345; // no token exists with this id

        (address receiver, uint256 royaltyAmount) = feature.royaltyInfo(
            tokenId,
            salePrice
        );

        assertEq(expectedRoyaltyReceiver, receiver);
        assertEq(expectedRoyaltyAmount, royaltyAmount);
    }
}
