import { BigNumber, Contract, ethers, Signer } from 'ethers'

import {
  Provider,
  TransactionReceipt,
  TransactionResponse,
} from '@ethersproject/abstract-provider'

import { hasLog, waitTx } from '../../ethereum/tx-helpers'
import { Logger } from '../../logger'
import GnosisSafeJSON from '../abi/GnosisSafe.json'
import MultiSendJSON from '../abi/MultiSend.json'
import { Operation } from '../types'
import {
  encodeMultiSendTransactions,
  encodeMultiSendTransactionsSingleDestination,
  MultiSendTxRequest,
} from './multi-send'

interface ExecTransactionRequest {
  to: string
  data: string | Buffer
  nonce?: number | BigNumber | string
  gasLimit?: number
  waitConfirmed?: boolean
  multiSend?: boolean
  numConfirmations?: number
  signer?: ethers.Signer
}

// see GnosisSafe.execTransaction
interface ExecTransactionCallProps {
  to: string
  value: number
  data: string | Buffer
  operation: Operation
  safeTxGas: number
  baseGas: number
  gasPrice: number
  gasToken: string
  refundReceiver: string
  signatures?: string
}

// event ExecutionSuccess(bytes32 txHash, uint256 payment)
const EventHashExecutionSuccess = `0x442e715f626346e8c54381002da614f62bee8d27386535b2521ec8540898556e`

/**
 * Interface to the Startrail Administrator contract.
 *
 * The contract is a Gnosis Safe instance.
 */
class Administrator {
  ethersProvider: Provider
  contract: Contract
  multiSendContract: Contract
  logger

  #signer: Signer

  /**
   * Construct an Administrator instance
   * @param signer Transaction signer (must be an owner on admin contract)
   * @param ethersProvider Instance of an ethers provider
   * @param administratorContractAddress Address of the admin contract
   * @param multiSendContractAddress Address of the MultiSend library contract
   */
  constructor(
    ethersProvider: Provider,
    signer: Signer,
    administratorContractAddress: string,
    multiSendAddress: string
  ) {
    this.ethersProvider = ethersProvider
    this.#signer = signer

    this.contract = new Contract(
      administratorContractAddress,
      GnosisSafeJSON.abi,
      this.#signer
    )
    this.multiSendContract = new Contract(
      multiSendAddress,
      MultiSendJSON.abi,
      this.#signer
    )

    Logger.info(
      `Administrator contract handle constructed [${this.contract.address}]`
    )
  }

  /**
   * Execute a transaction through the Administrator contract wallet.
   *
   * @throws Error if ExecutionSuccess NOT emitted
   */
  async execTransaction({
    to,
    data,
    nonce,
    gasLimit = 500000,
    waitConfirmed = true,
    multiSend = false,
    numConfirmations,
    signer = this.#signer,
  }: ExecTransactionRequest): Promise<
    TransactionReceipt | TransactionResponse
  > {
    const execTransactionProps = await this.encodeAndSignExecTransactionRequest(
      {
        to,
        data,
        nonce,
        multiSend,
        signer,
      }
    )

    const execRsp: TransactionResponse = await this.contract.execTransaction(
      ...Object.values(execTransactionProps),
      {
        gasLimit,
      }
    )

    if (!waitConfirmed) {
      return execRsp
    }

    // wait and look for result
    const execReceipt: TransactionReceipt = await waitTx(
      this.ethersProvider,
      execRsp,
      numConfirmations
    )
    this.verifyExecutionResult(execReceipt)

    return execReceipt
  }

  /**
   * Check the TxReceipt for an ExecutionSuccess event.
   * @throws Error if ExecutionSuccess NOT emitted
   */
  verifyExecutionResult(execReceipt: TransactionReceipt) {
    // Logger.info(JSON.stringify(execReceipt, null, 2));
    if (!hasLog(execReceipt, EventHashExecutionSuccess)) {
      const errMsg =
        `administrator.execTransaction: failure (hash: ` +
        `${execReceipt.transactionHash})`
      Logger.error(
        errMsg + ` [txReceipt: ${JSON.stringify(execReceipt, null, 2)}]\n`
      )
      throw Error(errMsg)
    }
  }

  /**
   * Get next available nonce value.
   *
   * See GnosisSafe.nonce
   */
  async nonce(): Promise<BigNumber> {
    return this.contract.nonce()
  }

  /**
   * Encode transaction details for MultiSend request
   * @return {string} hex encoded string for packed tx data
   */
  encodeMultiSend(transactions: MultiSendTxRequest[]): string {
    return encodeMultiSendTransactions(transactions)
  }

  /**
   * Encode transaction details for MultiSend request where all transactions
   * are sent to the same destination with the same operation.
   * @param operation Operation type for all
   * @param to Destination for all
   * @param calldataList Array of encoded calldata strings (1 per tx)
   * @return hex encoded string of packed tx data
   */
  encodeMultiSendSingleDestination(
    operation: Operation,
    to: string,
    calldataList: string[]
  ): string {
    return encodeMultiSendTransactionsSingleDestination(
      operation,
      to,
      calldataList
    )
  }

  /**
   * Encode execTransaction txHash and sign it with given signer.
   *
   * Return execTransaction call properties.
   */
  async encodeAndSignExecTransactionRequest({
    to,
    data,
    nonce,
    multiSend = false,
    signer = this.#signer,
  }: ExecTransactionRequest): Promise<ExecTransactionCallProps> {
    // If nonce given ensure it's a BigNumber
    // If not given fetch the latest from the contract
    const nonceBN = nonce
      ? ethers.BigNumber.from(nonce)
      : await this.contract.nonce()
    Logger.info(`\nexecTransaction\n\tnonce: ${nonceBN.toString()}`)

    const execTransactionProps = await this.execTransactionProps(
      to,
      data,
      multiSend
    )

    const txHash = await this.contract.getTransactionHash(
      ...Object.values(execTransactionProps),
      nonceBN.toString()
    )
    Logger.info(`\tadmin wallet txHash: ${txHash}`)

    // only 1 signature supported for now so just assign to signatures:
    const signatures = await this.signTxHash(txHash, signer)
    Logger.info(`\tsignatures string: ${JSON.stringify(signatures, null, 2)}`)

    return { ...execTransactionProps, signatures }
  }

  /**
   * Build execTransaction parameter properties.
   * @param to Destination contract
   * @param calldata Call data
   * @param multiSend? Send multiple transactions using MultiSend contract
   */
  async execTransactionProps(
    to: string,
    calldata: string | Buffer,
    multiSend = false
  ): Promise<ExecTransactionCallProps> {
    let operation
    let destinationAddr: string
    let txCalldata: string | Buffer

    if (!multiSend) {
      operation = Operation.CALL
      destinationAddr = to
      txCalldata = calldata
    } else {
      operation = Operation.DELEGATECALL
      destinationAddr = this.multiSendContract.address
      const { data } =
        await this.multiSendContract.populateTransaction.multiSend(calldata)
      txCalldata = data as string
    }

    return {
      to: destinationAddr,
      value: 0,
      data: txCalldata,
      operation,
      safeTxGas: 0,
      baseGas: 0,
      gasPrice: 0,
      gasToken: ethers.constants.AddressZero,
      refundReceiver: ethers.constants.AddressZero,
    }
  }

  /**
   * Sign the TxHash with eth_sign and adjust the signature as required by the
   * contract.
   * @param txHash TxHash of proxy tx to send
   * @param signer An ethers signer to eth_sign the hash with
   */
  private async signTxHash(
    txHash: string,
    signer: ethers.Signer
  ): Promise<string> {
    const signature = await signer.signMessage(ethers.utils.arrayify(txHash))

    // Add 4 to the 'v' component of the signature to tell GnosisSafe this is
    // an eth_sign signature.
    //
    // See Gnosis safe docs here:
    //   https://docs.gnosis.io/safe/docs/contracts_signatures/#span-stylecolordb3a3deth_signspan-signature
    //
    // See the signature check in the contract here:
    //   https://github.com/gnosis/safe-contracts/blob/d5b86e1002dad75d3365cd81dde9b27a9d493d21/contracts/GnosisSafe.sol#L252
    const signatureWithVplus4 = signature
      .replace(/1b$/, '1f') // v = 27 + 4
      .replace(/1c$/, '20') // v = 28 + 4

    return signatureWithVplus4
  }
}

export { Administrator }
