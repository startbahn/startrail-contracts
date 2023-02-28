// SPDX-License-Identifier: UNLICENSED

pragma solidity 0.6.11;
pragma experimental ABIEncoderV2;

interface ILicensedUserType {
    enum UserType {ADMIN, HANDLER, ARTIST}

    function getUserType() external view returns (UserType);
}
