// SPDX-License-Identifier: GPL-3.0-only
pragma solidity ^0.6.11;

// Using ABIEncoderV2 to support using ExecutionRequest struct as calldata
pragma experimental ABIEncoderV2;

import "./IMetaTxRequest.sol";

/**
 * @title Meta transaction forwarding interface.
 */
interface IMetaTxForwarderV1 is IMetaTxRequest {
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
    returns (bool success);

  // NOTE: The following function will be tested and finished after the first
  // release of the LUM contracts. A sketched implementation is commented out
  // in the implementation MetaTxForwarder.sol

  /**
   * @dev Execute a meta-tx request given request details and a single 
   *      signature signed by an EOA.
   * @param _request ExecutionRequest - transaction details
   * @param _signature Flattened signature of hash of encoded meta-tx details.
   * @return success Success or failure
   */
  // function executeTransactionEOA(
  //   ExecutionRequest calldata _request,
  //   bytes calldata _signature
  // )
  //   external
  //   returns (bool success);

}
