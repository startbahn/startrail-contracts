// SPDX-License-Identifier: GPL-3.0-only
pragma solidity ^0.8.28;

import "./PackedUserOperation.sol";

interface IAccount {
    function validateUserOp(
        PackedUserOperation calldata userOp,
        bytes32 userOpHash,
        uint256 missingAccountFunds
    ) external returns (uint256 validationData);
}
