pragma solidity 0.8.28;

import {SRRMetadataFeatureV01} from "../../contracts/collection/features/SRRMetadataFeatureV01.sol";
import "../../contracts/collection/features/storage/LibSRRMetadataStorage.sol";
import "../../contracts/collection/features/shared/LibFeatureCommonV02.sol";
import "./StartrailTestBase.sol";

string constant updatedMetadataCID = "bafkreidsepqar4dhoupza7xvrkmiy56knyn5ckoacdoxmhxu5u37mozc7y";

contract SRRMetadataFeatureTest is StartrailTestBase {
    SRRMetadataFeatureV01 internal feature;

    address internal collectionAddress;
    address internal collectionOwnerLU;
    address internal notAnOwner;

    uint256 tokenIdShared;

    function setUp() public override {
        super.setUp();

        collectionOwnerLU = licensedUser1Address;
        notAnOwner = vm.addr(0x7788);

        address royaltyReceiver = vm.addr(0x9911);
        uint16 royaltyBasisPoints = 1_570; // 15.7%

        collectionAddress = createCollection(collectionOwnerLU);

        feature = SRRMetadataFeatureV01(collectionAddress);

        tokenIdShared = createSRR(
            collectionAddress,
            trustedForwarder,
            collectionOwnerLU,
            true,
            vm.addr(0x9933),
            A_CID,
            false,
            address(0),
            royaltyReceiver,
            royaltyBasisPoints,
            bytes4(0)
        );
    }

    function testRevertUpdateSRRMetadata_SRRNotExists() public {
        vm.prank(collectionOwnerLU);

        vm.expectRevert(SRRNotExists.selector);

        uint256 tokenId = 12345; // no token exists with this id

        string memory metadataCID = A_CID;

        feature.updateSRRMetadata(tokenId, metadataCID);
    }

    function testRevertUpdateSRRMetadata_SRRMetadataNotEmpty() public {
        vm.prank(collectionOwnerLU);

        vm.expectRevert(LibSRRMetadataStorage.SRRMetadataNotEmpty.selector);

        string memory metadataCID = "";

        feature.updateSRRMetadata(tokenIdShared, metadataCID);
    }

    function testRevertUpdateSRRMetadata_OnlyIssuerOrArtistOrCollectionOwner()
        public
    {
        vm.prank(notAnOwner);

        vm.expectRevert(
            LibFeatureCommonV02.OnlyIssuerOrArtistOrCollectionOwner.selector
        );

        string memory metadataCID = A_CID;

        feature.updateSRRMetadata(tokenIdShared, metadataCID);
    }

    function testUpdateSRRMetadataSuccess() public {
        vm.prank(trustedForwarder);

        (bool success, ) = collectionAddress.call(
            eip2771AppendSender(
                abi.encodeWithSelector(
                    feature.updateSRRMetadata.selector,
                    tokenIdShared,
                    updatedMetadataCID
                ),
                collectionOwnerLU
            )
        );
        require(success);

        //verify the updated metadataCID
        string memory cid = feature.getSRRMetadata(tokenIdShared);
        assertEq(updatedMetadataCID, cid);
    }

    function testRevertGetSRRMetadata_SRRNotExists() public {
        vm.prank(notAnOwner);

        vm.expectRevert(SRRNotExists.selector);

        uint256 tokenId = 12345; // no token exists with this id

        feature.getSRRMetadata(tokenId);
    }

    function testGetUpdateSRRMetadataSuccess() public {
        vm.prank(notAnOwner);

        string memory cid = feature.getSRRMetadata(tokenIdShared);
        assertEq(A_CID, cid);
    }

    function testRevertTokenURI_SRRNotExists() public {
        vm.prank(notAnOwner);

        vm.expectRevert(SRRNotExists.selector);

        uint256 tokenId = 12345; // no token exists with this id

        feature.tokenURI(tokenId);
    }

    function testTokenURISuccess() public {
        vm.prank(notAnOwner);

        string memory uri = feature.tokenURI(tokenIdShared);
        string memory cid = feature.getSRRMetadata(tokenIdShared);
        string memory expectedURI = LibSRRMetadataStorage.buildTokenURI(cid);

        assertEq(expectedURI, uri);
    }
}
