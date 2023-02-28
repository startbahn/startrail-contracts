// SPDX-License-Identifier: UNLICENSED

pragma solidity 0.6.11;

contract Storage {
    mapping(uint256 => mapping(bytes32 => mapping(bytes32 => address)))
        internal _addressStorage;
    mapping(uint256 => mapping(bytes32 => mapping(bytes32 => uint256)))
        internal _uintStorage;
    mapping(uint256 => mapping(bytes32 => mapping(bytes32 => bool)))
        internal _boolStorage;
    mapping(uint256 => mapping(bytes32 => mapping(bytes32 => int256)))
        internal _intStorage;
    mapping(uint256 => mapping(bytes32 => mapping(bytes32 => bytes)))
        internal _bytesStorage;
    mapping(uint256 => mapping(bytes32 => mapping(bytes32 => bytes32)))
        internal _bytes32Storage;
    mapping(uint256 => mapping(bytes32 => mapping(bytes32 => string)))
        internal _stringStorage;
    mapping(uint256 => mapping(bytes32 => mapping(bytes32 => uint8)))
        internal _uint8Storage;
}
