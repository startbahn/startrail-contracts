// SPDX-License-Identifier: GPL-3.0-only

pragma solidity 0.8.21;

interface IStartrailCollectionFeatureRegistry {
    /**
     * @dev Get the EIP2771 trusted forwarder address
     * @return the trusted forwarder
     */
    function getEIP2771TrustedForwarder() external view returns (address);

    /**
     * @dev Get the NameRegistry contract address
     * @return NameRegistry address
     */
    function getNameRegistry() external view returns (address);
}
