// SPDX-License-Identifier: GPL-3.0-only
pragma solidity 0.8.28;

import "../metaTx/eip2771/EIP2771BaseRecipient.sol";

interface ILUM {
    function isActiveWallet(address walletAddress) external view returns (bool);
}

abstract contract EIP2771Or4337Recipient is EIP2771BaseRecipient {
    error OnlyTrustedForwarderOrActiveDeployedWallet();

    /*
     * require a function to be called either through trusted forwarder OR
     * directly by an active deployed LicensedUserWallet
     */
    modifier trustedForwarderAndDeployedActiveWalletOnly(
        address licensedUserManagerAddress
    ) {
        if (
            !isTrustedForwarderOrActiveDeployedWallet(
                msg.sender,
                licensedUserManagerAddress
            )
        ) {
            revert OnlyTrustedForwarderOrActiveDeployedWallet();
        }
        _;
    }

    function isActiveDeployedWallet(
        address wallet,
        address licensedUserManagerAddress
    ) public view returns (bool isFromActiveDeployedWallet) {
        isFromActiveDeployedWallet = false;
        uint256 codeSize;
        address sender = msg.sender;
        assembly {
            codeSize := extcodesize(sender)
        }

        if (codeSize > 0) {
            isFromActiveDeployedWallet = ILUM(licensedUserManagerAddress).isActiveWallet(sender);
        }
    }

    function isTrustedForwarderOrActiveDeployedWallet(
        address forwarder,
        address licensedUserManagerAddress
    ) public view returns (bool) {
        return isTrustedForwarder(forwarder) || isActiveDeployedWallet(forwarder, licensedUserManagerAddress);
    }
}
