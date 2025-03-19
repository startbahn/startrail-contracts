// SPDX-License-Identifier: GPL-3.0-only

pragma solidity 0.8.28;

import "../../name/Contracts.sol";
import "../../common/INameRegistry.sol";

import "./erc721/ERC721UpgradeableBase.sol";
import "./erc721/LibERC721Storage.sol";
import "./interfaces/IERC721FeatureV03.sol";
import "./interfaces/ILockExternalTransferFeatureV01.sol";
import "./shared/LibFeatureCommonV01.sol";
import "./shared/LibTransferWithProvenanceV01.sol";


contract ERC721FeatureV03 is
    IERC721FeatureV03,
    ERC721UpgradeableBase,
    Contracts
{
    // The Reason why this line moved into the contract:
    // DeclarationError: Identifier already declared.
    error ERC721FeatureAlreadyInitialized();

    /**
     * @inheritdoc IERC721FeatureV03
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
     * @inheritdoc IERC721FeatureV03
     */
    function exists(uint256 tokenId) public view returns (bool) {
        return LibERC721Storage.exists(tokenId);
    }

    /**
     * @inheritdoc ERC721UpgradeableBase
     */
    function transferFrom(
        address from,
        address to,
        uint256 id
    ) public override {
        LibFeatureCommonV01.onlyExternalTransferUnlocked(id);
        ERC721UpgradeableBase.transferFrom(from, to, id);
    }

    /**
     * @inheritdoc ERC721UpgradeableBase
     */
    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public virtual override {
        LibFeatureCommonV01.onlyExternalTransferUnlocked(tokenId);
        ERC721UpgradeableBase.transferFrom(from, to, tokenId);
    }

    /**
     * @inheritdoc ERC721UpgradeableBase
     */
    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId,
        bytes calldata data
    ) public virtual override {
        LibFeatureCommonV01.onlyExternalTransferUnlocked(tokenId);
        ERC721UpgradeableBase.safeTransferFrom(from, to, tokenId, data);
    }

    /**
     * @inheritdoc ERC721UpgradeableBase
     */
    function approve(address spender, uint256 tokenId) public override {
        LibFeatureCommonV01.onlyExternalTransferUnlocked(tokenId);
        ERC721UpgradeableBase.approve(spender, tokenId);
    }

    /**
     * @inheritdoc IERC721FeatureV03
     */
    function transferFromWithProvenance(
        address to,
        uint256 tokenId,
        string memory historyMetadataHash,
        uint256 customHistoryId,
        bool isIntermediary
    ) external override {
        address tokenOwner = ownerOf(tokenId);
        address sender = LibFeatureCommonV01.msgSender();

        // Not using a custom error here to be consistent with how
        // ERC721UpgradeableBase handles these errors. In this way
        // clients can expect all these checks to return
        // NOT_AUTHORIZED.
        require(
            sender == tokenOwner,
            "NOT_AUTHORIZED"
        );

        LibTransferWithProvenanceV01.transferFromWithProvenance(
            to,
            tokenId,
            historyMetadataHash,
            customHistoryId,
            isIntermediary
        );
    }
}
