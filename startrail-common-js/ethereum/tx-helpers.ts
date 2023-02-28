import { Contract, ContractReceipt, Event } from 'ethers'

import { Result } from '@ethersproject/abi'
import {
  Log,
  Provider,
  TransactionReceipt,
  TransactionResponse,
} from '@ethersproject/abstract-provider'

import { Logger } from '../logger'

/**
 * Get event by name from a contract transaction receipt.
 */
const getEvent = (
  receipt: ContractReceipt,
  eventName: string
): Event | undefined => receipt.events?.find((e) => e.event === eventName)

/**
 * Decode an event given the raw log, event name and contract handle.
 * @param contract
 * @param eventName
 * @param log
 * @returns Array of event arguments or undefined if not found
 */
const decodeEventLog = (
  contract: Contract,
  eventName: string,
  log: Log
): Result => {
  let eventArgs
  try {
    eventArgs = contract.interface.decodeEventLog(
      eventName,
      log.data,
      log.topics
    )
  } catch (err) {
    Logger.warn(
      `WARN: failed to decode event log for ${eventName} [err: ${err}]`
    )
  }
  return eventArgs
}

/**
 * Check if a log topic hash exists in a receipt.
 */
const hasLog = (receipt: TransactionReceipt, topicHash: string): boolean =>
  receipt.logs.some((log) => log.topics.indexOf(topicHash) !== -1)

/**
 * Get list of event values for all events matching 'eventName' on 'contract'
 * starting from block 'startBlock'.
 */
const queryEventValues = async (queryDetails: {
  provider: Provider
  contract: Contract
  eventName: string
  startBlock: number
  endBlock?: number
  blocksPerQuery?: number
}): Promise<Result[]> => {
  const events = await queryEvents(queryDetails)
  return events.map((log: Log) =>
    decodeEventLog(queryDetails.contract, queryDetails.eventName, log)
  )
}

/**
 * Get list of events for all events matching 'eventName' on 'contract'
 * starting from block 'startBlock'.
 */
const queryEvents = async ({
  provider,
  contract,
  eventName,
  startBlock,
  endBlock,
  blocksPerQuery = 50000, // tune this depending on the provider
}: {
  provider: Provider
  contract: Contract
  eventName: string
  startBlock: number
  endBlock?: number
  blocksPerQuery?: number
}): Promise<Log[]> => {
  const toBlock = endBlock ? endBlock : await provider.getBlockNumber()
  Logger.info(
    `\nqueryEvents: querying ${eventName} events from block ` +
      `${startBlock} to latestBlock ${toBlock}`
  )

  const eventFilter = contract.filters[eventName]()
  const events: Log[] = []

  for (
    let fromBlock = startBlock;
    fromBlock < toBlock;
    fromBlock += blocksPerQuery
  ) {
    const queryFilter = {
      ...eventFilter,
      fromBlock,
      toBlock: Math.min(fromBlock + blocksPerQuery, toBlock),
    }
    Logger.info(
      `Querying block range ${queryFilter.fromBlock} to ${queryFilter.toBlock}`
    )
    const logs = await provider.getLogs(queryFilter)
    events.push(...logs)
  }

  return events
}

/**
 * Wait for a transaction to be mined and confirmed.
 * @param ethersProvider JsonRpcProvider instance
 * @param txResultOrHash Transaction response types or the hash
 * @param numConfirmations? (Default=1)
 */
const waitTx = async (
  ethersProvider: Provider,
  txResultOrHash: TransactionResponse | Contract | string,
  numConfirmations = 1
): Promise<TransactionReceipt> => {
  let txHash

  if ((<TransactionResponse>txResultOrHash).hash) {
    // TransactionResponse from contract write method
    txHash = (<TransactionResponse>txResultOrHash).hash
  } else if ((<Contract>txResultOrHash).deployTransaction) {
    // ContractFactory.deploy result
    txHash = (<Contract>txResultOrHash).deployTransaction.hash
  } else {
    // assume it's the txHash string itself
    txHash = txResultOrHash
  }

  Logger.info(
    `\nWaiting for tx to be mined with ${numConfirmations} confirmation ` +
      `blocks ...\n\ttxHash: ${txHash}`
  )

  const txReceipt = await ethersProvider.waitForTransaction(
    txHash,
    numConfirmations
  )
  Logger.info(
    `\nTx confirmed!\n` + `\tgasUsed: ${txReceipt.gasUsed.toString()}\n`
  )
  Logger.info(`-----------------------------------------------`)

  return txReceipt
}

/**
 * Sleep for a given number of seconds.
 *
 * Useful tool to space out tx broadcasts and batch queries.
 *
 * @param seconds Number of seconds to sleep for
 */
const sleep = (seconds: number): Promise<number> =>
  new Promise((resolve) => setTimeout(resolve, seconds * 1000))

export {
  decodeEventLog,
  getEvent,
  hasLog,
  queryEvents,
  queryEventValues,
  sleep,
  waitTx,
}
