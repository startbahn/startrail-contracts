// SPDX-License-Identifier: GPL-3.0-only

pragma solidity 0.8.28;

import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {Initializable} from "@openzeppelin/contracts/proxy/utils/Initializable.sol";
import {IAccount} from "../lib/IAccount.sol";
import {IAccountExecute} from "../lib/IAccountExecute.sol";
import {LicensedUserManagerV03} from "./LicensedUserManagerV03.sol";
import "../lib/PackedUserOperation.sol";
import "../lib/Call.sol";

/**
 * @title LicensedUserWallet
 * @author Tomohiro Nakamura - <tomo@startbahn.jp>
 * @dev ERC-4337 compatible wallet managed by LicensedUserManagerV03
 */
contract LicensedUserWallet is Initializable, IAccount {

    error InvalidLicensedUserManager();
    error InvalidEntryPoint();

    uint256 internal constant SIG_VALIDATION_FAILED = 1;
    uint256 internal constant SIG_VALIDATION_SUCCESS = 0;

    address public licensedUserManagerAddress;

    /**
     * @notice Initialize the wallet with its managing LicensedUserManager
     * @dev Called once during deployment via BeaconProxy pattern
     * @param _licensedUserManagerAddress Address of the LUM that manages this wallet
     */
    function initialize(
        address _licensedUserManagerAddress
    ) public initializer {
        if (_licensedUserManagerAddress == address(0)) {
            revert InvalidLicensedUserManager();
        }
        licensedUserManagerAddress = _licensedUserManagerAddress;
    }

    /**
     * @notice ERC-4337 UserOperation validation
     * @param op The UserOperation to validate
     * @param userOpHash Hash of the UserOperation
     * @param missingAccountFunds Amount of funds missing for the operation
     * @return validationData 0 for success, 1 for failure
     */
    function validateUserOp(
        PackedUserOperation calldata op,
        bytes32 userOpHash,
        uint256 missingAccountFunds
    ) external returns (uint256) {
        if (
            msg.sender !=
            LicensedUserManagerV03(licensedUserManagerAddress).entryPoint()
        ) {
            revert InvalidEntryPoint();
        }

        if (isValidSignature(userOpHash, op.signature) == 0x1626ba7e) {
            return SIG_VALIDATION_SUCCESS;
        } else {
            return SIG_VALIDATION_FAILED;
        }
    }

    function execute(Call[] calldata calls) public payable {
        uint256 len = calls.length;
        for (uint256 i = 0; i < len; i++) {
            Call memory call = calls[i];
            if (call.to != address(0)) {
                (bool success, ) = call.to.call{value: call.value}(call.data);
                if (!success) {
                    assembly {
                        let size := returndatasize()
                        let ptr := mload(0x40)
                        returndatacopy(ptr, 0, size)
                        revert(ptr, size)
                    }
                }
            }
        }
    }

    function supportsInterface(
        bytes4 interfaceId
    ) external view virtual returns (bool) {
        return interfaceId == 0x01ffc9a7; // ERC165 Interface ID for ERC165
        // TODO add others
    }

    /**
     * @notice EIP-1271 signature validation
     * @dev Validates signatures by checking against wallet owners stored in LUM
     * @param hash The hash that was signed
     * @param signature The signature to validate
     * @return bytes4 0x1626ba7e for valid signature, 0xffffffff for invalid
     */
    function isValidSignature(
        bytes32 hash,
        bytes calldata signature
    ) public view returns (bytes4) {
        // Delegate to LUM for owner verification to avoid data duplication
        // TODO: make multi-sig work
        bytes4 lumResult = LicensedUserManagerV03(licensedUserManagerAddress)
            .isValidSignatureSet(address(this), hash, signature);

        if (lumResult == 0x9878440b) {
            // IS_VALID_SIG_SUCCESS from LUM
            // bytes4(keccak256("isValidSignature(bytes32,bytes)")
            return 0x1626ba7e;
        } else {
            return 0xffffffff;
        }
    }
}
