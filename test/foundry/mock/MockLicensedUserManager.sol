// SPDX-License-Identifier: GPL-3.0-only
pragma solidity 0.8.21;

import {ILUM} from "../../../contracts/collection/shared/LibEIP2771.sol";

contract MockLicensedUserManager is ILUM {
    mapping(address => bool) internal luws;

    function isActiveWallet(address luAddress) external view returns (bool) {
        return luws[luAddress];
    }

    function addWallet(address newWallet) external {
        luws[newWallet] = true;
    }
}
