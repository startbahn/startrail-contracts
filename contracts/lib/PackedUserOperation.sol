// SPDX-License-Identifier: GPL-3.0-only

pragma solidity 0.8.28;

// @dev https://eips.ethereum.org/EIPS/eip-4337
struct PackedUserOperation {
    address sender;
    uint256 nonce;
    bytes initCode;
    bytes callData;
    bytes32 accountGasLimits;
    uint256 preVerificationGas;
    bytes32 gasFees;
    bytes paymasterAndData;
    bytes signature;
}
