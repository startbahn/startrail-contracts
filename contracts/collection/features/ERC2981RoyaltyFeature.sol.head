// SPDX-License-Identifier: GPL-3.0-only

pragma solidity 0.8.28;

import {IERC2981} from "@openzeppelin/contracts/interfaces/IERC2981.sol";
import "./interfaces/IERC2981RoyaltyFeatureV01.sol";
import "./storage/LibERC2981RoyaltyStorage.sol";
import "./storage/LibSRRStorage.sol";
import "./shared/LibERC2981RoyaltyTypes.sol";
import "./shared/LibERC2981RoyaltyEvents.sol";
import "./shared/LibFeatureCommonV01.sol";

/**
 * @title A standardized way to retrieve royalty payment information for NFTs
 *  to enable universal support for royalty payments
 *  across all NFT marketplaces and ecosystem participants.
 */
contract ERC2981RoyaltyFeatureV01 is IERC2981RoyaltyFeatureV01, IERC2981 {
    /**
     * @dev See {IERC165-supportsInterface}.
     */
    function supportsInterface(
        bytes4 interfaceId
    ) external view virtual returns (bool) {
        return interfaceId == type(IERC2981).interfaceId;
    }

    /**
     * @inheritdoc IERC2981RoyaltyFeatureV01
     */
    function updateSRRRoyalty(
        uint256 tokenId,
        address royaltyReceiver,
        uint16 royaltyBasisPoints
    ) external override {
        LibERC721Storage.onlyExistingToken(tokenId);

        LibFeatureCommonV01.onlyAdministrator();

        LibERC2981RoyaltyStorage.onlyExistingRoyalty(tokenId);
        LibERC2981RoyaltyStorage.notAddressZero(royaltyReceiver);
        LibERC2981RoyaltyStorage.notToExceedSalePrice(royaltyBasisPoints);

        LibERC2981RoyaltyStorage.upsertRoyalty(
            tokenId,
            royaltyReceiver,
            royaltyBasisPoints
        );
    }

    /**
     * @inheritdoc IERC2981RoyaltyFeatureV01
     */
    function updateSRRRoyaltyReceiverMulti(
        uint256[] calldata tokenIds,
        address royaltyReceiver
    ) external override {
        LibFeatureCommonV01.onlyAdministrator();
        LibERC2981RoyaltyStorage.notAddressZero(royaltyReceiver);

        for (uint256 i = 0; i < tokenIds.length; i++) {
            LibERC721Storage.onlyExistingToken(tokenIds[i]);
            LibERC2981RoyaltyStorage.onlyExistingRoyalty(tokenIds[i]);
        }

        for (uint256 i = 0; i < tokenIds.length; i++) {
            LibERC2981RoyaltyTypes.RoyaltyInfo
                memory royalty = LibERC2981RoyaltyStorage.layout().royalties[
                    tokenIds[i]
                ];

            LibERC2981RoyaltyStorage.upsertRoyalty(
                tokenIds[i],
                royaltyReceiver,
                royalty.basisPoints
            );
        }
    }

    /**
     * @inheritdoc IERC2981RoyaltyFeatureV01
     */
    function getSRRRoyalty(
        uint256 tokenId
    ) external view override returns (address receiver, uint16 basisPoints) {
        LibERC2981RoyaltyTypes.RoyaltyInfo
            memory royalty = LibERC2981RoyaltyStorage.layout().royalties[
                tokenId
            ];
        return (royalty.receiver, royalty.basisPoints);
    }

    /**
     * @notice Called with the sale price to determine how much royalty
     *  is owed and to whom.
     *  The default receiver address 0x75194F40c5337d218A6798B02BbB34500a653A16 is what we use for OpenSea.
     *  For all environments like QA, STG and production.
     *  As we set the default royalty to 0, this shouldn’t matter if there is no receiver
     *  @param tokenId - the NFT asset queried for royalty information
     *  @param salePrice - the sale price of the NFT asset specified by _tokenId
     *  @return receiver - address of who should be sent the royalty payment
     *  @return royaltyAmount - the royalty payment amount for _salePrice
     */
    function royaltyInfo(
        uint256 tokenId,
        uint256 salePrice
    ) external view override returns (address, uint256) {
        LibERC2981RoyaltyTypes.RoyaltyInfo
            memory royalty = LibERC2981RoyaltyStorage.layout().royalties[
                tokenId
            ];

        if (royalty.receiver == address(0)) {
            royalty = LibERC2981RoyaltyTypes.RoyaltyInfo(
                0x75194F40c5337d218A6798B02BbB34500a653A16,
                0
            );
        }

        uint256 royaltyAmount = (salePrice * royalty.basisPoints) / 10_000;

        return (royalty.receiver, royaltyAmount);
    }
}
