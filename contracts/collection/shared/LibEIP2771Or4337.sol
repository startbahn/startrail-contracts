// SPDX-License-Identifier: GPL-3.0-only

pragma solidity 0.8.28;

import "../../common/INameRegistry.sol";
import "../registry/interfaces/IStartrailCollectionFeatureRegistry.sol";

interface ILUMInLibEIP2771Or4337 {
    function isActiveWallet(address walletAddress) external view returns (bool);
    function walletAddressGivenAlias(
        address walletAddress
    ) external view returns (address);
    function walletAddressAliasBackward(
        address walletAddress
    ) external view returns (address);
}

library LibEIP2771Or4337 {
    // Copied this key value from Contracts.sol because it can't be imported and
    // used. This is because:
    //  - libraries can't inherit from other contracts
    //  - keys in Contracts.sol are `internal` so not accessible if not inherited
    uint8 constant NAME_REGISTRY_KEY_LICENSED_USER_MANAGER = 3;

    error NotTrustedForwarderOrActiveDeployedWallet();

    function isTrustedForwarder(
        address featureRegistryAddress
    ) internal view returns (bool) {
        return
            msg.sender ==
            IStartrailCollectionFeatureRegistry(featureRegistryAddress)
                .getEIP2771TrustedForwarder();
    }

    function onlyLicensedUser(address featureRegistryAddress) internal view {
        bool isActive = licensedUserManager(featureRegistryAddress)
            .isActiveWallet(msgSender(featureRegistryAddress));
        if (!isActive) {
            revert NotTrustedForwarderOrActiveDeployedWallet();
        }
        if (!isTrustedForwarder(featureRegistryAddress)) {
            uint256 codeSize;
            address sender = msg.sender;
            assembly {
                codeSize := extcodesize(sender)
            }

            if (codeSize == 0) {
                revert NotTrustedForwarderOrActiveDeployedWallet();
            }
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

    function msgSenderAfterAlias(
        address featureRegistryAddress
    ) internal view returns (address) {
        address sender = msgSender(featureRegistryAddress);
        return
            licensedUserManager(featureRegistryAddress).walletAddressGivenAlias(
                sender
            );
    }

    function msgSenderAliasBackward(
        address featureRegistryAddress
    ) internal view returns (address) {
        address sender = msgSender(featureRegistryAddress);
        return
            licensedUserManager(featureRegistryAddress)
                .walletAddressAliasBackward(sender);
    }

    function licensedUserManager(
        address featureRegistryAddress
    ) internal view returns (ILUMInLibEIP2771Or4337) {
        return
            ILUMInLibEIP2771Or4337(
                INameRegistry(
                    IStartrailCollectionFeatureRegistry(featureRegistryAddress)
                        .getNameRegistry()
                ).get(NAME_REGISTRY_KEY_LICENSED_USER_MANAGER)
            );
    }
}
