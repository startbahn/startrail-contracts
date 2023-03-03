// SPDX-License-Identifier: GPL-3.0-only

pragma solidity 0.8.13;

interface ILicensedUserType {
    enum UserType {ADMIN, HANDLER, ARTIST}

    function getUserType() external view returns (UserType);
}
