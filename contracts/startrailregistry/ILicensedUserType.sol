// SPDX-License-Identifier: GPL-3.0-only

pragma solidity 0.8.28;

interface ILicensedUserType {
    enum UserType {ADMIN, HANDLER, ARTIST}

    function getUserType() external view returns (UserType);
}
