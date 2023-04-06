pragma solidity 0.8.13;

import "../../contracts/collection/features/erc721/ERC721Errors.sol";
import {SRRFeature} from "../../contracts/collection/features/SRRFeature.sol";
import {ERC2981RoyaltyFeature} from "../../contracts/collection/features/ERC2981RoyaltyFeature.sol";
import {LockExternalTransferFeature} from "../../contracts/collection/features/LockExternalTransferFeature.sol";
import "../../contracts/collection/features/shared/LibFeatureCommon.sol";
import "../../contracts/lib/IDGeneratorV3.sol";
import "../../contracts/name/Contracts.sol";
import "../../contracts/collection/features/storage/LibERC2981RoyaltyStorage.sol";
import "../../contracts/collection/features/storage/LibSRRMetadataStorage.sol";

import "./StartrailTestBase.sol";

contract SRRFeatureTest is StartrailTestBase {
    SRRFeature internal srrFeature;

    address internal collectionAddress;
    address internal collectionOwnerLU;
    address internal notAnOwner;

    function setUp() public override {
        super.setUp();

        collectionOwnerLU = licensedUser1;
        notAnOwner = vm.addr(0x7788);

        collectionAddress = createCollection(collectionOwnerLU);

        srrFeature = SRRFeature(collectionAddress);
    }

    function testCreateSRRSuccess() public {
        bool isPrimaryIssuer = true;
        address artist = vm.addr(0x798be);
        string memory metadataCID = A_CID;
        bool lockExternalTransfer = false;
        address to = address(0);
        address royaltyReceiver = address(0);
        uint16 royaltyBasisPoints = 100;

        address issuer = collectionOwnerLU;

        uint256 tokenId = createSRR(
            collectionAddress,
            trustedForwarder,
            collectionOwnerLU,
            isPrimaryIssuer,
            artist,
            metadataCID,
            lockExternalTransfer,
            to,
            royaltyReceiver,
            royaltyBasisPoints,
            bytes4(0)
        );

        (
            bool srrIsPrimaryIssuer,
            address srrArtist,
            address srrIssuer
        ) = srrFeature.getSRR(tokenId);

        assertEq(srrIsPrimaryIssuer, isPrimaryIssuer);
        assertEq(srrArtist, artist);
        assertEq(srrIssuer, issuer);
    }

    function testCreateSRRWithTransferSuccess() public {
        ERC721Feature erc721 = ERC721Feature(collectionAddress);

        string memory metadataCID = A_CID;
        address artist = vm.addr(0x79813);
        address newOwner = vm.addr(0x79814);

        uint256 tokenId = createSRR(
            collectionAddress,
            trustedForwarder,
            collectionOwnerLU,
            true,
            artist,
            metadataCID,
            false,
            newOwner,
            address(0),
            0,
            bytes4(0)
        );

        assertEq(newOwner, erc721.ownerOf(tokenId));
    }

    function testCreateSRRWithRoyaltySuccess() public {
        ERC2981RoyaltyFeature royaltyFeature = ERC2981RoyaltyFeature(
            collectionAddress
        );

        string memory metadataCID = A_CID;
        address artist = vm.addr(0x79815);
        address royaltyReceiver = vm.addr(0x79816);
        uint16 royaltyBasisPoints = 100;

        uint256 tokenId = createSRR(
            collectionAddress,
            trustedForwarder,
            collectionOwnerLU,
            true,
            artist,
            metadataCID,
            false,
            address(0),
            royaltyReceiver,
            royaltyBasisPoints,
            bytes4(0)
        );

        (address receiver, uint16 basisPoints) = royaltyFeature.getSRRRoyalty(
            tokenId
        );

        assertEq(royaltyReceiver, receiver);
        assertEq(royaltyBasisPoints, basisPoints);
    }

    function testCreateSRRWithLockExternalTransferSuccess() public {
        LockExternalTransferFeature lockFeature = LockExternalTransferFeature(
            collectionAddress
        );

        string memory metadataCID = A_CID;
        address artist = vm.addr(0x79815);
        address royaltyReceiver = vm.addr(0x79816);
        uint16 royaltyBasisPoints = 100;

        uint256 tokenId = createSRR(
            collectionAddress,
            trustedForwarder,
            collectionOwnerLU,
            true,
            artist,
            metadataCID,
            true,
            address(0),
            royaltyReceiver,
            royaltyBasisPoints,
            bytes4(0)
        );

        bool lock = lockFeature.getLockExternalTransfer(tokenId);

        assertEq(lock, true);
    }

    function testRevert_CreateSRROnlyOwner() public {
        createSRR(
            collectionAddress,
            trustedForwarder,
            notAnOwner, // NOT the owner of the collection
            true,
            address(0),
            A_CID,
            false,
            address(0),
            address(0),
            100,
            LibFeatureCommon.NotOwner.selector // expect revert with this error
        );
    }

    function testRevert_CreateSRRZeroAddressArtist() public {
        createSRR(
            collectionAddress,
            trustedForwarder,
            collectionOwnerLU,
            true,
            address(0), // Artist is the zero address
            A_CID,
            false,
            address(0),
            address(0),
            100,
            ISRRFeature.ZeroAddress.selector // expect revert with this error
        );
    }

    function testRevert_CreateSRRMetadataEmpty() public {
        createSRR(
            collectionAddress,
            trustedForwarder,
            collectionOwnerLU,
            true,
            address(0),
            "", // empty metadata
            false,
            address(0),
            address(0),
            100,
            LibSRRMetadataStorage.SRRMetadataNotEmpty.selector // expect revert with this error
        );
    }

    function testRevert_CreateSRRTokenAlreadyExists() public {
        string memory metadataCID = A_CID;
        address artist = vm.addr(0x798be);

        // create an SRR with given artist/metadata
        createSRR(
            collectionAddress,
            trustedForwarder,
            collectionOwnerLU,
            true,
            artist,
            metadataCID,
            false,
            address(0),
            address(0),
            100,
            bytes4(0)
        );

        // attempt to create another SRR with the same given artist/metadata
        // should REVERT with TokenAlreadyExists
        createSRR(
            collectionAddress,
            trustedForwarder,
            collectionOwnerLU,
            true,
            artist, // same artist
            metadataCID, // same metadata
            false,
            address(0),
            address(0),
            100,
            TokenAlreadyExists.selector // Expected Revert Error
        );
    }

    function testRevert_CreateSRRFeeNotToExceedSalePrice() public {
        string memory metadataCID = A_CID;
        address artist = vm.addr(0x79811);
        address royaltyReceiver = vm.addr(0x78912);

        createSRR(
            collectionAddress,
            trustedForwarder,
            collectionOwnerLU,
            true,
            artist,
            metadataCID,
            false,
            address(0),
            royaltyReceiver,
            11_000,
            LibERC2981RoyaltyStorage.RoyaltyFeeNotToExceedSalePrice.selector // expect revert with this error
        );
    }

    enum UpdateCaller {
        ADMIN,
        ARTIST,
        ISSUER
    }

    function updateSRRSuccess(UpdateCaller caller) private {
        uint256 tokenId = createSRRWithDefaults(
            collectionAddress,
            trustedForwarder,
            collectionOwnerLU
        );

        (
            bool srrIsPrimaryIssuer,
            address srrArtist,
            address srrIssuer
        ) = srrFeature.getSRR(tokenId);

        bool newIsPrimaryIssuer = !srrIsPrimaryIssuer;
        address newArtist = vm.addr(0x798ff);

        if (caller == UpdateCaller.ADMIN) {
            vm.prank(admin);
        } else if (caller == UpdateCaller.ARTIST) {
            vm.prank(srrArtist);
        } else if (caller == UpdateCaller.ISSUER) {
            vm.prank(srrIssuer);
        }
        srrFeature.updateSRR(tokenId, newIsPrimaryIssuer, newArtist);

        (
            bool postUpdateIsPrimaryIssuer,
            address postUpdateArtist,

        ) = srrFeature.getSRR(tokenId);

        assertEq(postUpdateIsPrimaryIssuer, newIsPrimaryIssuer);
        assertEq(postUpdateArtist, newArtist);
    }

    function testUpdateSRRFromAdminSuccess() public {
        updateSRRSuccess(UpdateCaller.ADMIN);
    }

    function testUpdateSRRFromArtistSuccess() public {
        updateSRRSuccess(UpdateCaller.ARTIST);
    }

    function testUpdateSRRFromIssuerSuccess() public {
        updateSRRSuccess(UpdateCaller.ISSUER);
    }

    function testRevert_UpdateSRROnlyIssuerOrArtistOrAdministrator() public {
        uint256 tokenId = createSRRWithDefaults(
            collectionAddress,
            trustedForwarder,
            collectionOwnerLU
        );

        vm.prank(notAnOwner);
        vm.expectRevert(ISRRFeature.OnlyIssuerOrArtistOrAdministrator.selector);
        srrFeature.updateSRR(tokenId, true, vm.addr(0xffff));
    }

    function testRevert_UpdateSRRZeroAddressArtist() public {
        uint256 tokenId = createSRRWithDefaults(
            collectionAddress,
            trustedForwarder,
            collectionOwnerLU
        );

        vm.prank(collectionOwnerLU);
        vm.expectRevert(ISRRFeature.ZeroAddress.selector);
        srrFeature.updateSRR(tokenId, true, address(0));
    }

    function testRevert_UpdateSRRTokenNotExists() public {
        vm.expectRevert(TokenNotExists.selector);
        srrFeature.updateSRR(12345, true, vm.addr(0xffff));
    }
}
