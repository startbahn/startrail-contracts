// SPDX-License-Identifier: GPL-3.0-only
pragma solidity 0.8.13;

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
  )
    external
    returns (bytes4);
}

/**
 * @title MetaTxForwarder - forward meta tx requests to destination contracts.
 * @author Chris Hatch - <chris.hatch@startbahn.jp>
 * @dev A meta-tx forwarding contract using EIP2771 to forward the sender address.
 */
contract MetaTxForwarderV2 is 
  Contracts,
  IMetaTxForwarderV2,
  SignatureDecoder,
  TransactionExecutor,
  ReplayProtection,
  MetaTxRequestManager
{
  // Valid signature check response (use EIP1271 style response)
  // Value is the function signature of isValidSignatureSet
  // Also defined in LicensedUserManager.sol which returns this value.
  bytes4 internal constant IS_VALID_SIG_SUCCESS = 0x9878440b; 

  //
  // Initializer
  //

  /**
   * @dev Setup the contract
   * @param _nameRegistry NameRegistry address.
   */
  function initialize(address _nameRegistry) public initializer {
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
    require(
      checkAndUpdateNonce(_request.from, _request.nonce),
      "Invalid nonce"
    );

    bytes memory txHashEncoded = encodeRequest(_request);
    bytes32 txHash = keccak256(txHashEncoded);

    require(
      ILicensedUserManager(
        INameRegistry(nameRegistryAddress).get(
          Contracts.LICENSED_USER_MANAGER
        )
      ).isValidSignatureSet(
        _request.from,
        txHash,
        _signatures
      ) == IS_VALID_SIG_SUCCESS,
      "isValidSignatureSet check failed"
    );

    bytes memory callData;

    // If callData provided then use it
    if (_request.callData.length > 0) {
      callData = _request.callData;
    } else {
      // If callData NOT provided build it using the EIP712 encoding
      // This can't be used for requests with bytes, strings or arrays.
      // In these cases the request must define a separate calldata prop.
      callData = abi.encodePacked(
        requestTypes[_request.typeHash].functionSignature,
        _request.suffixData
      );
    }

    // Append the sender (EIP-2771)
    callData = abi.encodePacked(callData, _request.from);

    success = executeCall(
      requestTypes[_request.typeHash].destination,
      callData,
      txHash
    );
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
    require(
      checkAndUpdateNonce(_request.from, _request.nonce),
      "Invalid nonce"
    );

    bytes memory txHashEncoded = encodeRequest(_request);
    bytes32 txHash = keccak256(txHashEncoded);

    uint8 v;
    bytes32 r;
    bytes32 s;
    (v, r, s) = signatureSplit(_signature, 0);
      
    require(
      ecrecover(txHash, v, r, s) == _request.from,
      "Signer verification failed"
    );

    bytes memory callData;

    // If callData provided then use it
    if (_request.callData.length > 0) {
      callData = _request.callData;
    } else {
      // If callData NOT provided build it using the EIP712 encoding
      // This can't be used for requests with bytes, strings or arrays.
      // In these cases the request must define a separate calldata prop.
      callData = abi.encodePacked(
        requestTypes[_request.typeHash].functionSignature,
        _request.suffixData
      );
    }

    // Append the sender (EIP-2771)
    callData = abi.encodePacked(callData, _request.from);

    success = executeCall(
      requestTypes[_request.typeHash].destination,
      callData,
      txHash
    );
  }
}
