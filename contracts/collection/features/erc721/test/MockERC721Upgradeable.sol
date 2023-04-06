// SPDX-License-Identifier: GPL-3.0-only
pragma solidity 0.8.13;

import "../LibERC721Storage.sol";
import "../ERC721UpgradeableBase.sol";

contract MockERC721Upgradeable is ERC721UpgradeableBase {
    constructor(string memory _name, string memory _symbol) {
        __ERC721_init(_name, _symbol);
    }

    function mint(address to, uint256 tokenId) external virtual {
        LibERC721Storage._mint(to, tokenId);
    }

    function burn(uint256 tokenId) external virtual {
        LibERC721Storage._burn(tokenId);
    }

    function safeMint(address to, uint256 tokenId) external virtual {
        LibERC721Storage._safeMint(to, tokenId);
    }

    function safeMint(
        address to,
        uint256 tokenId,
        bytes memory data
    ) external virtual {
        LibERC721Storage._safeMint(to, tokenId, data);
    }
}
