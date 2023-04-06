// SPDX-License-Identifier: GPL-3.0-only

pragma solidity 0.8.13;

import "../shared/LibERC2981RoyaltyTypes.sol";
import "../shared/LibERC2981RoyaltyEvents.sol";

library LibERC2981RoyaltyStorage {
    error RoyaltyReceiverNotAddressZero();
    error RoyaltyFeeNotToExceedSalePrice();
    error RoyaltyNotExists();

    struct Layout {
        mapping(uint256 => LibERC2981RoyaltyTypes.RoyaltyInfo) royalties;
    }

    bytes32 internal constant STORAGE_SLOT =
        keccak256("startrail.storage.ERC2981Royalty");

    function layout() internal pure returns (Layout storage l) {
        bytes32 slot = STORAGE_SLOT;
        assembly {
            l.slot := slot
        }
    }

    function notAddressZero(address royaltyReceiver) internal pure {
        if (royaltyReceiver == address(0)) {
            revert RoyaltyReceiverNotAddressZero();
        }
    }

    function notToExceedSalePrice(uint16 royaltyBasisPoints) internal pure {
        if (royaltyBasisPoints > 10_000) {
            revert RoyaltyFeeNotToExceedSalePrice();
        }
    }

    function exists(uint256 tokenId) internal view returns (bool) {
        return layout().royalties[tokenId].receiver != address(0);
    }

    function onlyExistingRoyalty(uint256 tokenId) internal view {
        if (!exists(tokenId)) {
            revert RoyaltyNotExists();
        }
    }

    function upsertRoyalty(
        uint256 tokenId,
        address royaltyReceiver,
        uint16 royaltyBasisPoints
    ) internal {
        if (royaltyReceiver != address(0) && royaltyBasisPoints <= 10_000) {
            LibERC2981RoyaltyTypes.RoyaltyInfo storage royalty = layout()
                .royalties[tokenId];
            royalty.receiver = royaltyReceiver;
            royalty.basisPoints = royaltyBasisPoints;
            emit LibERC2981RoyaltyEvents.RoyaltiesSet(tokenId, royalty);
        }
    }
}
