// SPDX-License-Identifier: GPL-3.0-only

pragma solidity 0.8.21;

import "../../common/INameRegistry.sol";
import "../registry/interfaces/IStartrailCollectionFeatureRegistry.sol";

interface ILUM {
    function isActiveWallet(address walletAddress) external view returns (bool);
}

// Copied this key value from Contracts.sol because it can't be imported and
// used. This is because:
//  - libraries can't inherit from other contracts
//  - keys in Contracts.sol are `internal` so not accessible if not inherited
uint8 constant NAME_REGISTRY_KEY_LICENSED_USER_MANAGER = 3;

library LibEIP2771 {
    error NotLicensedUser();
    error NotTrustedForwarder();

    function isTrustedForwarder(
        address featureRegistryAddress
    ) internal view returns (bool) {
        return
            msg.sender ==
            IStartrailCollectionFeatureRegistry(featureRegistryAddress)
                .getEIP2771TrustedForwarder();
    }

    function onlyTrustedForwarder(
        address featureRegistryAddress
    ) internal view {
        if (!isTrustedForwarder(featureRegistryAddress)) {
            revert NotTrustedForwarder();
        }
    }

    function onlyLicensedUser(address featureRegistryAddress) internal view {
        if (
            !ILUM(
                INameRegistry(
                    IStartrailCollectionFeatureRegistry(featureRegistryAddress)
                        .getNameRegistry()
                ).get(NAME_REGISTRY_KEY_LICENSED_USER_MANAGER)
            ).isActiveWallet(msgSender(featureRegistryAddress))
        ) {
            revert NotLicensedUser();
        }
    }

    /**
     * @dev return the sender of this call.
     *
     * This should be used in the contract anywhere instead of msg.sender.
     *
     * If the call came through our trusted forwarder, return the EIP2771
     * address that was appended to the calldata. Otherwise, return `msg.sender`.
     */
    function msgSender(
        address featureRegistryAddress
    ) internal view returns (address ret) {
        if (
            msg.data.length >= 24 && isTrustedForwarder(featureRegistryAddress)
        ) {
            // At this point we know that the sender is a trusted forwarder,
            // so we trust that the last bytes of msg.data are the verified sender address.
            // extract sender address from the end of msg.data
            assembly {
                ret := shr(96, calldataload(sub(calldatasize(), 20)))
            }
        } else {
            return msg.sender;
        }
    }
}
