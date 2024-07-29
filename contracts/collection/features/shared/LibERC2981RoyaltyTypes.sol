// SPDX-License-Identifier: GPL-3.0-only

pragma solidity 0.8.21;

library LibERC2981RoyaltyTypes {
    struct RoyaltyInfo {
        address receiver;
        uint16 basisPoints;
    }
}
