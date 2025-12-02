// SPDX-License-Identifier: GPL-3.0-only

pragma solidity 0.8.28;

import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

import "./IPaymaster.sol";
import "./INameRegistry.sol";
import "../name/Contracts.sol";
import "../lib/Call.sol";

interface ICollectionRegistry {
    function registry(address collection) external view returns (bool);
}

/**
 * @title StartrailPaymasterV01
 * @author Tomohiro Nakamura - <tomo@startbahn.jp>
 * @dev Minimal ERC-4337 paymaster that sponsors gas only for whitelisted destinations
 *      and is upgradeable via UUPS pattern.
 */
contract StartrailPaymasterV01 is
    OwnableUpgradeable,
    UUPSUpgradeable,
    IPaymaster,
    Contracts
{
    error InvalidCalldata();
    error DestinationNotWhitelisted();
    error ZeroAddress();

    // --- Storage ---
    address public nameRegistryAddress; // NameRegistry holding singleton addresses
    address public collectionRegistryAddress; // CollectionRegistry for collection allowlist

    // execute((address,uint256,bytes)[])
    bytes4 private constant EXECUTE_SELECTOR =
        bytes4(keccak256("execute((address,uint256,bytes)[])"));

    // --- Initializer ---
    function initialize(
        address _nameRegistry,
        address _collectionRegistry
    ) public initializer {
        if (_nameRegistry == address(0)) revert ZeroAddress();
        __Ownable_init(msg.sender);
        __UUPSUpgradeable_init();
        nameRegistryAddress = _nameRegistry;
        collectionRegistryAddress = _collectionRegistry; // optional, can be zero address until set
    }

    function setNameRegistry(address _nameRegistry) external onlyOwner {
        if (_nameRegistry == address(0)) revert ZeroAddress();
        nameRegistryAddress = _nameRegistry;
    }

    function setCollectionRegistry(
        address _collectionRegistry
    ) external onlyOwner {
        collectionRegistryAddress = _collectionRegistry;
    }

    // --- IPaymaster ---
    function validatePaymasterUserOp(
        PackedUserOperation calldata userOp,
        bytes32 /*userOpHash*/,
        uint256 /*maxCost*/
    ) external returns (bytes memory context, uint256 validationData) {
        bytes calldata callData = userOp.callData;
        if (callData.length < 4) revert InvalidCalldata();

        bytes4 selector;
        assembly {
            selector := calldataload(callData.offset)
        }
        if (selector != EXECUTE_SELECTOR) revert InvalidCalldata();

        // Decode LicensedUserWallet.execute(Call[] calls)
        Call[] memory calls = abi.decode(callData[4:], (Call[]));
        uint256 len = calls.length;
        for (uint256 i = 0; i < len; i++) {
            if (!_isWhitelistedDestination(calls[i].to)) {
                revert DestinationNotWhitelisted();
            }
        }

        // No postOp required; unlimited validity; signature valid
        return ("", 0);
    }

    function postOp(
        PostOpMode /*mode*/,
        bytes calldata /*context*/,
        uint256 /*actualGasCost*/,
        uint256 /*actualUserOpFeePerGas*/
    ) external {
        // no-op
    }

    // --- Internal ---
    function _isWhitelistedDestination(
        address destination
    ) internal view returns (bool) {
        if (destination == address(0)) return false;

        INameRegistry nr = INameRegistry(nameRegistryAddress);

        // StartrailRegistry
        if (destination == nr.get(STARTRAIL_REGISTRY)) return true;
        // LicensedUserManager
        if (destination == nr.get(LICENSED_USER_MANAGER)) return true;
        // Bulk
        if (destination == nr.get(BULK)) return true;

        // Registered collections
        if (collectionRegistryAddress != address(0)) {
            if (
                ICollectionRegistry(collectionRegistryAddress).registry(
                    destination
                )
            ) {
                return true;
            }
        }

        return false;
    }

    // --- UUPS ---
    function _authorizeUpgrade(
        address newImplementation
    ) internal override onlyOwner {}
}
