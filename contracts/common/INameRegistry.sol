// SPDX-License-Identifier: GPL-3.0-only

pragma solidity 0.8.21;

interface INameRegistry {
    function get(uint8 key) external view returns (address);
    function set(uint8 key, address value) external;
    function administrator() external view returns (address);
}
