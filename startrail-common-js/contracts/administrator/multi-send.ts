import { ethers } from 'ethers'
import stripHexPrefix from 'strip-hex-prefix'

import { Operation } from '../types'

/*
 * Utilities for building transactions to send through the MultiSend.sol
 * contract.
 */

interface MultiSendTxRequest {
  operation: Operation
  to: string
  data: string
}

/**
 * Encode a single MultiSend transaction given a MultiSend
 * tx details object.
 * @return hex encoded string for packed tx data
 */
const encodeMultiSendTransaction = ({
  operation,
  to,
  data,
}: MultiSendTxRequest): string => {
  const dataBuffer = Buffer.from(stripHexPrefix(data), 'hex')
  return ethers.utils.solidityPack(
    // see MultiSend.sol multiSend function for details of this structure:
    ['uint8', 'address', 'uint256', 'uint256', 'bytes'],
    [operation, to, 0, dataBuffer.length, dataBuffer]
  )
}

/**
 * Encode an array of MultiSend tx details objects into a single hex string
 * for passing into the MultiSend.sol multiSend function.
 * @return hex encoded string in format for passing to multiSend()
 */
const encodeMultiSendTransactions = (
  transactions: MultiSendTxRequest[]
): string =>
  `0x` +
  transactions
    .map((tx) => stripHexPrefix(encodeMultiSendTransaction(tx)))
    .join('')

/**
 * Encode an array of calldata and operation and to details into a single hex
 * string for passing into the MultiSend.sol multiSend function.
 *
 * All transactions will have the same destination and operation. Use
 * `encodeMultiSendTransactions` if the transactions have different
 * destinations or operations.
 *
 * @param operation Operation type for all
 * @param to Address of contract to send all to
 * @param calldataList Array of encoded calldata strings (1 per tx)
 * @return hex encoded string in format for passing to multiSend()
 */
const encodeMultiSendTransactionsSingleDestination = (
  operation: Operation,
  to: string,
  calldataList: string[]
): string =>
  encodeMultiSendTransactions(
    calldataList.map((data): MultiSendTxRequest => ({ operation, to, data }))
  )

export {
  encodeMultiSendTransaction,
  encodeMultiSendTransactions,
  encodeMultiSendTransactionsSingleDestination,
  MultiSendTxRequest,
}
