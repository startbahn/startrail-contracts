pragma solidity 0.8.21;

import "../../contracts/collection/features/erc721/ERC721Errors.sol";
import {SRRFeatureV01} from "../../contracts/collection/features/SRRFeatureV01.sol";
import {ERC2981RoyaltyFeatureV01} from "../../contracts/collection/features/ERC2981RoyaltyFeatureV01.sol";
import {LockExternalTransferFeatureV01} from "../../contracts/collection/features/LockExternalTransferFeatureV01.sol";
import "../../contracts/collection/features/shared/LibFeatureCommon.sol";
import "../../contracts/lib/IDGeneratorV3.sol";
import "../../contracts/name/Contracts.sol";
import "../../contracts/collection/features/storage/LibERC2981RoyaltyStorage.sol";
import "../../contracts/collection/features/storage/LibSRRMetadataStorage.sol";

import "./StartrailTestBase.sol";

contract SRRFeatureTest is StartrailTestBase {
    SRRFeatureV01 internal srrFeature;

    address internal collectionAddress;
    address internal collectionOwnerLU;
    address internal notAnOwner;

    uint256 testTokenId;

    function setUp() public override {
        super.setUp();

        collectionOwnerLU = licensedUser1;
        notAnOwner = vm.addr(0x7788);

        collectionAddress = createCollection(collectionOwnerLU);

        srrFeature = SRRFeatureV01(collectionAddress);

        testTokenId = createSRRWithDefaults(
            collectionAddress,
            trustedForwarder,
            collectionOwnerLU
        );
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
        ERC721FeatureV01 erc721 = ERC721FeatureV01(collectionAddress);

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
        ERC2981RoyaltyFeatureV01 royaltyFeature = ERC2981RoyaltyFeatureV01(
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
        LockExternalTransferFeatureV01 lockFeature = LockExternalTransferFeatureV01(
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

    function testRevert_CreateSRROnlyCollectionOwner() public {
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
            LibFeatureCommon.NotCollectionOwner.selector // expect revert with this error
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
            ISRRFeatureV02.ZeroAddress.selector // expect revert with this error
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

    function testRevert_CreateSRRSRRAlreadyExists() public {
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
        // should REVERT with SRRAlreadyExists
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
            SRRAlreadyExists.selector // Expected Revert Error
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
        ARTIST,
        COLLECTION_OWNER,
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

        address sender;
        if (caller == UpdateCaller.COLLECTION_OWNER) {
            sender = collectionOwnerLU;
        } else if (caller == UpdateCaller.ARTIST) {
            sender = srrArtist;
        } else if (caller == UpdateCaller.ISSUER) {
            sender = srrIssuer;
        }

        vm.prank(trustedForwarder);
        (bool success, ) = collectionAddress.call(
            eip2771AppendSender(
                abi.encodeWithSelector(
                    srrFeature.updateSRR.selector,
                    tokenId,
                    newIsPrimaryIssuer,
                    newArtist
                ),
                sender
            )
        );
        require(success);

        (
            bool postUpdateIsPrimaryIssuer,
            address postUpdateArtist,

        ) = srrFeature.getSRR(tokenId);

        assertEq(postUpdateIsPrimaryIssuer, newIsPrimaryIssuer);
        assertEq(postUpdateArtist, newArtist);
    }

    function testUpdateSRRFromCollectionOwnerSuccess() public {
        updateSRRSuccess(UpdateCaller.COLLECTION_OWNER);
    }

    function testUpdateSRRFromArtistSuccess() public {
        updateSRRSuccess(UpdateCaller.ARTIST);
    }

    function testUpdateSRRFromIssuerSuccess() public {
        updateSRRSuccess(UpdateCaller.ISSUER);
    }

    function testRevert_UpdateSRROnlyIssuerOrArtistOrCollectionOwner() public {
        vm.prank(trustedForwarder);
        vm.expectRevert(
            LibFeatureCommon.OnlyIssuerOrArtistOrCollectionOwner.selector
        );
        (bool success, ) = collectionAddress.call(
            eip2771AppendSender(
                abi.encodeWithSelector(
                    srrFeature.updateSRR.selector,
                    testTokenId,
                    true,
                    vm.addr(0xffff)
                ),
                notAnOwner
            )
        );
        assertTrue(success, "expectRevert: call did not revert");
    }

    function testRevert_UpdateSRRZeroAddressArtist() public {
        vm.prank(trustedForwarder);
        vm.expectRevert(ISRRFeatureV02.ZeroAddress.selector);
        (bool success, ) = collectionAddress.call(
            eip2771AppendSender(
                abi.encodeWithSelector(
                    srrFeature.updateSRR.selector,
                    testTokenId,
                    true,
                    address(0)
                ),
                collectionOwnerLU
            )
        );
        assertTrue(success, "expectRevert: call did not revert");
    }

    function testRevert_UpdateSRRSRRNotExists() public {
        vm.prank(trustedForwarder);
        vm.expectRevert(SRRNotExists.selector);
        srrFeature.updateSRR(12345, true, vm.addr(0xffff));
    }
}
