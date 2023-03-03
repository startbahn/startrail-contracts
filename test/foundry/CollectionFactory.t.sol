pragma solidity 0.8.13;

import {IERC173} from "@solidstate/contracts/access/IERC173.sol";
import {IERC165} from "@solidstate/contracts/introspection/IERC165.sol";
import {IERC721} from "@solidstate/contracts/token/ERC721/IERC721.sol";
import {IERC721Metadata} from "@solidstate/contracts/token/ERC721/metadata/IERC721Metadata.sol";

import "../../contracts/collection/CollectionFactory.sol";
import "../../contracts/collection/features/ERC721Feature.sol";
import "../../contracts/collection/features/OwnableFeature.sol";
import "../../contracts/collection/registry/StartrailCollectionFeatureRegistry.sol";

import "./StartrailTestBase.sol";

contract CollectionFactoryTest is StartrailTestBase {
    function setUp() public override {
        super.setUp();
    }

    function testCreateCollection() public {
        address collectionCreator = licensedUser1;
        address collectionAddress = createCollection(collectionCreator);

        IERC173 cERC173 = IERC173(collectionAddress);
        assertEq(cERC173.owner(), collectionCreator);

        ERC721Feature cERC721Feature = ERC721Feature(collectionAddress);
        assertEq(cERC721Feature.name(), COLLECTION_NAME);
        assertEq(cERC721Feature.symbol(), COLLECTION_SYMBOL);

        IERC165 cERC165 = IERC165(collectionAddress);
        assertTrue(cERC165.supportsInterface(type(IERC165).interfaceId));
        assertTrue(cERC165.supportsInterface(type(IERC173).interfaceId));
        assertTrue(cERC165.supportsInterface(type(IERC721).interfaceId));
        assertTrue(
            cERC165.supportsInterface(type(IERC721Metadata).interfaceId)
        );

        assertFalse(cERC165.supportsInterface(0x1111ffff));
    }
}
