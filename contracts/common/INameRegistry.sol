// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.6.11;

interface INameRegistry {
    function get(uint8 key) external view returns (address);
    function set(uint8 key, address value) external;
    function administrator() external view returns (address);
}
