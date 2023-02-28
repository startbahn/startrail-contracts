// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.6.11;

/**
 * @title TransactionExecutor - execute transaction for a wallet
 * @author Chris Hatch - <chris.hatch@startbahn.jp>
 */
contract TransactionExecutor {

  event ExecutionSuccess(bytes32 txHash);

  string internal constant EXECUTE_FAILED_WITHOUT_REASON =
    "Proxied transaction failed without a reason string";

  /**
   * @dev Execute a call.
   * @param _to Call destination address
   * @param _data Call data to send
   * @param _txHash Hash of transaction request
   * @return True if call succeeded, false if failed
   */
  function executeCall(
    address _to,
    bytes memory _data,
    bytes32 _txHash
  )
    internal
    returns (bool)
  {
    (bool success, bytes memory returnData) = _to.call(_data);
    if (success) {
        emit ExecutionSuccess(_txHash);
        return success;
    }

    // Rethrow the error from the proxied transaction (STARTRAIL-678)
    //
    // Reasons:
    //  - tx status: 0 so it's obvious there was a failure
    //  - reason string visibility - including on etherscan
    //  - we are the relayer so we don't need to claim payments
    string memory reason = returnData.length > 0 ?
      extractErrorMessage(returnData) :
      EXECUTE_FAILED_WITHOUT_REASON;

    revert(reason);
  }


  /**
   * @dev Extract an error message from call return data.
   * @param _returnData Return data from a call
   * @return message Error message if found, otherwise an empty string.
   */
  function extractErrorMessage(
    bytes memory _returnData
  )
    internal
    pure
    returns (string memory message)
  {
    // decode revert string:
    // - skip the (selector(4),offset(32),length(32)) fields = 68 bytes
    // - an example error response encoding is shown here:
    //   https://solidity.readthedocs.io/en/v0.7.3/control-structures.html#revert
    if (_returnData.length > 68) {
      assembly {
        message := add(_returnData, 68)
      }
    }
  }

}