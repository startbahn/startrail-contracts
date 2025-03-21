// SPDX-License-Identifier: GPL-3.0-only

pragma solidity 0.8.28;

import {IERC173} from "@solidstate/contracts/interfaces/IERC173.sol";

import "../collection/CollectionRegistry.sol";
import "../common/SignatureDecoder.sol";
import "../name/Contracts.sol";

import "./IMetaTxRequest.sol";
import "./IMetaTxForwarderV2.sol";
import "./MetaTxRequestManager.sol";
import "./replayProtection/ReplayProtection.sol";
import "./TransactionExecutor.sol";

interface ILicensedUserManager {
    function isValidSignatureSet(
        address _walletAddress,
        bytes32 _hash,
        bytes calldata _signatures
    ) external returns (bytes4);
}

error DestinationNotACollectionProxy();

/**
 * @title MetaTxForwarder - forward meta tx requests to destination contracts.
 * @author Chris Hatch - <chris.hatch@startbahn.jp>
 * @dev A meta-tx forwarding contract using EIP2771 to forward the sender address.
 */
contract MetaTxForwarderV3 is
    Contracts,
    IMetaTxForwarderV2,
    SignatureDecoder,
    TransactionExecutor,
    ReplayProtection,
    MetaTxRequestManager
{
    error ZeroAddress();

    // Valid signature check response (use EIP1271 style response)
    // Value is the function signature of isValidSignatureSet
    // Also defined in LicensedUserManager.sol which returns this value.
    bytes4 internal constant IS_VALID_SIG_SUCCESS = 0x9878440b;

    address public collectionRegistry;

    //
    // Initializer
    //

    /**
     * @dev Setup the contract
     * @param _nameRegistry NameRegistry address.
     */
    function initialize(address _nameRegistry) external initializer {
        if (_nameRegistry == address(0)) {
            revert ZeroAddress();
        }
        MetaTxRequestManager.__MTRM_initialize(_nameRegistry);
    }

    //
    // Proxy / Execute Transaction Functions
    //

    /**
     * @dev Execute a meta-tx request given request details and a list of
     *      signatures for a Licensed User Wallet (LUW). Asks the
     *      LicensedUserManager (LUM) if the signatures of the request are valid.
     *      This includes a multisig threshold check.
     * @param _request ExecutionRequest - transaction details
     * @param _signatures List of signatures authorizing the transaction.
     * @return success Success or failure
     */
    function executeTransactionLUW(
        ExecutionRequest calldata _request,
        bytes calldata _signatures
    )
        external
        override
        requestTypeRegistered(_request.typeHash)
        returns (bool success)
    {
        return executeTransactionInternal(_request, _signatures, false);
    }

    /**
     * @dev Execute a meta-tx request given request details and a single
     *      signature signed by an EOA.
     * @param _request ExecutionRequest - transaction details
     * @param _signature Flattened signature of hash of encoded meta-tx details.
     * @return success Success or failure
     */
    function executeTransactionEOA(
        ExecutionRequest calldata _request,
        bytes calldata _signature
    )
        external
        override
        requestTypeRegistered(_request.typeHash)
        returns (bool success)
    {
        return executeTransactionInternal(_request, _signature, true);
    }

    /**
     * @dev Execute a meta-tx request given request details and signature(s).
     *      This internal function handles validation of signatures from either
     *      an EOA or a LicensedUser wallet.
     * @param _request ExecutionRequest - transaction details
     * @param _signatures Flattened signature of hash of encoded meta-tx details.
     * @return success Success or failure
     */
    function executeTransactionInternal(
        ExecutionRequest calldata _request,
        bytes calldata _signatures,
        bool isEOASignature
    ) internal requestTypeRegistered(_request.typeHash) returns (bool success) {
        require(
            checkAndUpdateNonce(_request.from, _request.nonce),
            "Invalid nonce"
        );

        bytes memory txHashEncoded = encodeRequest(_request);
        bytes32 txHash = keccak256(txHashEncoded);

        if (isEOASignature) {
            uint8 v;
            bytes32 r;
            bytes32 s;
            (v, r, s) = signatureSplit(_signatures, 0);
            require(
                ecrecover(txHash, v, r, s) == _request.from,
                "Signer verification failed"
            );
        } else {
            require(
                ILicensedUserManager(
                    INameRegistry(nameRegistryAddress).get(
                        Contracts.LICENSED_USER_MANAGER
                    )
                ).isValidSignatureSet(_request.from, txHash, _signatures) ==
                    IS_VALID_SIG_SUCCESS,
                "isValidSignatureSet check failed"
            );
        }

        // Determine the destination contract
        address destination = requestTypes[_request.typeHash].destination;
        bool destinationInRequest = destination == address(0x0);
        if (destinationInRequest) {
            // If the registered destination address is 0 than it's assumed that the
            // first request parameter is the destination address and that it is a
            // Collection address
            destination = address(
                bytes20(bytes32(_request.suffixData[:32]) << 96)
            );

            // Verify it's a registered CollectionProxy address
            if (!CollectionRegistry(collectionRegistry).registry(destination)) {
                revert DestinationNotACollectionProxy();
            }
        }

        bytes memory callData;

        // If callData provided then use it as is
        if (_request.callData.length > 0) {
            callData = _request.callData;
        } else {
            // If callData NOT provided build it using the EIP712 encoding
            // and strip out the destination if it's there.
            // This method can't be used for requests with bytes, strings or
            // arrays. In these cases the request must define a separate prop
            // 'callData'.
            callData = abi.encodePacked(
                requestTypes[_request.typeHash].functionSignature,
                destinationInRequest
                    ? _request.suffixData[32:]
                    : _request.suffixData
            );
        }

        // Append the sender (EIP-2771)
        callData = abi.encodePacked(callData, _request.from);

        success = executeCall(destination, callData, txHash);
    }

    function setCollectionRegistry(
        address _registry
    ) external onlyAdministrator {
        if (_registry == address(0)) {
            revert ZeroAddress();
        }
        collectionRegistry = _registry;
    }
}
