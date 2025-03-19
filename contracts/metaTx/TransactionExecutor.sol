// SPDX-License-Identifier: GPL-3.0-only

pragma solidity 0.8.28;

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
    ) internal returns (bool) {
        (bool success, ) = _to.call(_data);
        if (success) {
            emit ExecutionSuccess(_txHash);
            return success;
        }

        assembly {
            returndatacopy(0, 0, returndatasize())
            revert(0, returndatasize())
        }
    }
}
