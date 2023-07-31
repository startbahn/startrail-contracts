// SPDX-License-Identifier: GPL-3.0-only

pragma solidity 0.8.13;

interface IFeatureRegistryBase {
    /**
     * @notice Update the mapping of supported ERC165 interfaces.
     * @param interfaceId 4 bytes interface id of the supported interface
     * @param status true if interface supported, false if not (false will be
     *   used if an interface was removed or no longer supported)
     */
    function setSupportedInterface(bytes4 interfaceId, bool status) external;

    /**
     * @notice Get the support status of a given ERC165 interface.
     * NOTE: intentionally does not use the standard `supportsInterface(bytes4)`
     *   as this function is provided as a shared lookup for CollectionProxy
     *   contracts which will themselves provide that standard interface and
     *   proxy calls to this getter function.
     * @param interfaceId 4 bytes interface id of thes supported interface
     * @return true if the interface is supported
     */
    function getSupportedInterface(
        bytes4 interfaceId
    ) external view returns (bool);
}
