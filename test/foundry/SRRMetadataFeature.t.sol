pragma solidity 0.8.13;

import {SRRMetadataFeature} from "../../contracts/collection/features/SRRMetadataFeature.sol";
import "../../contracts/collection/features/storage/LibSRRMetadataStorage.sol";
import "../../contracts/collection/features/shared/LibFeatureCommon.sol";
import "./StartrailTestBase.sol";

string constant updatedMetadataCID = "bafkreidsepqar4dhoupza7xvrkmiy56knyn5ckoacdoxmhxu5u37mozc7y";

contract SRRMetadataFeatureTest is StartrailTestBase {
    SRRMetadataFeature internal feature;

    address internal collectionAddress;
    address internal collectionOwnerLU;
    address internal notAnOwner;

    uint256 tokenIdShared;

    function setUp() public override {
        super.setUp();

        collectionOwnerLU = licensedUser1;
        notAnOwner = vm.addr(0x7788);

        address royaltyReceiver = vm.addr(0x9911);
        uint16 royaltyBasisPoints = 1_570; // 15.7%

        collectionAddress = createCollection(collectionOwnerLU);

        feature = SRRMetadataFeature(collectionAddress);

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

    function testRevertUpdateSRRMetadata_TokenNotExists() public {
        vm.prank(collectionOwnerLU);

        vm.expectRevert(TokenNotExists.selector);

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

    function testRevertUpdateSRRMetadata_OnlyIssuerOrArtistOrAdministrator()
        public
    {
        vm.prank(notAnOwner);

        vm.expectRevert(ISRRFeature.OnlyIssuerOrArtistOrAdministrator.selector);

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

    function testRevertGetSRRMetadata_TokenNotExists() public {
        vm.prank(notAnOwner);

        vm.expectRevert(TokenNotExists.selector);

        uint256 tokenId = 12345; // no token exists with this id

        feature.getSRRMetadata(tokenId);
    }

    function testGetUpdateSRRMetadataSuccess() public {
        vm.prank(notAnOwner);

        string memory cid = feature.getSRRMetadata(tokenIdShared);
        assertEq(A_CID, cid);
    }

    function testRevertTokenURI_TokenNotExists() public {
        vm.prank(notAnOwner);

        vm.expectRevert(TokenNotExists.selector);

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
