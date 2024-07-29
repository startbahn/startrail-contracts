// SPDX-License-Identifier: GPL-3.0-only

pragma solidity 0.8.21;

import "../shared/LibERC2981RoyaltyTypes.sol";

library LibERC2981RoyaltyEvents {
    event RoyaltiesSet(
        uint256 indexed tokenId,
        LibERC2981RoyaltyTypes.RoyaltyInfo royalty
    );
}
