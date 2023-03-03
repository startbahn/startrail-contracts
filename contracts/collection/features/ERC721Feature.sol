// SPDX-License-Identifier: GPL-3.0-only
pragma solidity 0.8.13;

import "./erc721/ERC721UpgradeableBase.sol";
import "./erc721/LibERC721Storage.sol";
import "./interfaces/IERC721Feature.sol";
import "./shared/LibFeatureCommon.sol";

error ERC721FeatureAlreadyInitialized();

contract ERC721Feature is IERC721Feature, ERC721UpgradeableBase {
    /**
     * @inheritdoc IERC721Feature
     */
    function __ERC721Feature_initialize(
        string memory name_,
        string memory symbol_
    ) external {
        LibERC721Storage.Layout storage layout = LibERC721Storage.layout();
        if (
            bytes(layout.name).length != 0 && bytes(layout.symbol).length != 0
        ) {
            revert ERC721FeatureAlreadyInitialized();
        }
        __ERC721_init(name_, symbol_);
    }

    /**
     * @inheritdoc IERC721Feature
     */
    function exists(uint256 tokenId) public view returns (bool) {
        return LibERC721Storage.exists(tokenId);
    }

    // TODO: can move to metadata feature once that's implemented
    function tokenURI(
        uint256
    ) public pure virtual override returns (string memory) {}
}
