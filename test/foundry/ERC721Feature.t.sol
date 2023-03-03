pragma solidity 0.8.13;

import "../../contracts/collection/features/ERC721Feature.sol";
import "../../contracts/collection/features/shared/LibFeatureCommon.sol";

import "./StartrailTestBase.sol";

contract ERC721FeatureTest is StartrailTestBase {
    ERC721Feature internal erc721Feature;
    address internal collectionAddress;
    address internal collectionOwnerLU;

    function setUp() public override {
        super.setUp();
        collectionOwnerLU = licensedUser1;
        collectionAddress = createCollection(collectionOwnerLU);
        erc721Feature = ERC721Feature(collectionAddress);
    }

    function testInitialized() public {
        assertEq(erc721Feature.name(), COLLECTION_NAME);
        assertEq(erc721Feature.symbol(), COLLECTION_SYMBOL);
    }

    function testRevert_AlreadyInitialized() public {
        vm.expectRevert(ERC721FeatureAlreadyInitialized.selector);
        erc721Feature.__ERC721Feature_initialize(
            COLLECTION_NAME,
            COLLECTION_SYMBOL
        );
    }
}
