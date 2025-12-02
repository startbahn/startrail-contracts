// SPDX-License-Identifier: GPL-3.0-only
pragma solidity ^0.8.28;

import "./PackedUserOperation.sol";

interface IAccountExecute {
    function executeUserOp(
        PackedUserOperation calldata userOp,
        bytes32 userOpHash
    ) external;
}
