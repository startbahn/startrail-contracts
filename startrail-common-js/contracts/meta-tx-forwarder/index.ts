import { BigNumber, Signer, Wallet } from 'ethers'
import { RequireExactlyOne } from 'type-fest'

import { Provider, TransactionResponse } from '@ethersproject/abstract-provider'
import { Contract } from '@ethersproject/contracts'

import { Logger } from '../../logger'
import {
  EIP712TypedData,
  EIP712TypedDataBuilder,
} from '../../meta-tx/eip712-typed-data-builder'
import {
  metaTxRequests,
  MetaTxRequestType,
} from '../../meta-tx/meta-tx-request-registry'
import { joinSignatures, signRequest } from '../../meta-tx/sign'
import MetaTxForwarderABI from '../abi/MetaTxForwarder.json'
import { encodeContractFunctionCalldata } from '../utils'

/**
 * APIMetaTxRequest
 */
interface MetaTxRequest {
  requestTypeKey: MetaTxRequestType
  fromAddress: string
  nonce: BigNumber | string // 2d nonce packed
  requestData: Record<string, any>
}

/**
 * Mirrors IMetaTxRequest.sol ExecutionRequest struct
 */
interface ExecutionRequest {
  typeHash: string
  from: string
  nonce: BigNumber | string // 2d nonce packed
  suffixData: string | Buffer
  callData: '0x' | string | Buffer
}

interface EncodeExecuteTransactionRequest {
  request: MetaTxRequest
  signatures: string[]
  encodeType: 'SingleSig' | 'MultiSig'
}

type EncodeExecuteTransactionResponse = RequireExactlyOne<
  {
    _request: ExecutionRequest
    _signature: string
    _signatures: string
  },
  '_signature' | '_signatures'
>

/**
 * Interface to the MetaTxForwarder contract.
 *
 * Helps to build EIP712 typed data as well as sign it and exceute meta-tx
 * requests.
 */
class MetaTxForwarder {
  chainId: number
  ethersProvider: Provider
  contract: Contract
  typedDataBuilder: EIP712TypedDataBuilder

  #signer: Signer

  /**
   * Construct a MetaTxForwarder instance
   * @param chainId Chain Id (137=mumbai, 80001=polygon, 31337=hardhat local)
   * @param signer Transaction signer (not signer of metatx but signer of
   *               the Ethereum tx broadcast to network)
   * @param ethersProvider Instance of an ethers provider
   * @param metaTxForwarderAddress Address of the contracvt
   */
  constructor(
    chainId: number,
    ethersProvider: Provider,
    signer: Signer,
    metaTxForwarderAddress: string
  ) {
    this.chainId = chainId
    this.ethersProvider = ethersProvider
    this.#signer = signer

    this.contract = new Contract(
      metaTxForwarderAddress,
      MetaTxForwarderABI,
      this.#signer
    )

    this.typedDataBuilder = new EIP712TypedDataBuilder(
      chainId,
      metaTxForwarderAddress
    )

    Logger.info(
      `MetaTxForwarder contact handle constructed ` +
        `[${this.contract.address}]`
    )
  }

  /**
   * Build the EIP712 typed data structure for signing.
   */
  buildRequestTypedData({
    requestTypeKey,
    fromAddress,
    nonce,
    requestData,
  }: MetaTxRequest): EIP712TypedData {
    return this.typedDataBuilder.build({
      requestTypeKey,
      from: fromAddress,
      nonce: typeof nonce === 'string' ? nonce : nonce.toString(),
      requestData,
    })
  }

  /**
   * Build and sign EIP712 typed data structure.
   */
  signRequestTypedData(
    { requestTypeKey, fromAddress, nonce, requestData }: MetaTxRequest,
    signers: Wallet[]
  ): Promise<string[]> {
    return signRequest({
      requestTypeKey,
      chainId: this.chainId,
      forwarderAddress: this.contract.address,
      fromAddress,
      nonce: BigNumber.from(nonce),
      requestData,
      signers,
    })
  }

  /**
   * Call executeTransactionLUW on MetaTxForwarder.
   * @param request MetaTxRequest details
   * @param signatures Signatures in flattened string format
   * @param gasLimit Transaction gasLimit
   * @param gasPrice Transaction gasPrice in wei
   */
  async executeTransactionLUW({
    request,
    signatures,
    gasLimit = 500000,
    gasPrice,
  }: {
    request: MetaTxRequest
    signatures: string[]
    gasLimit: number
    gasPrice: number
  }): Promise<TransactionResponse> {
    const callProperties = await this.encodeExecuteTransactionProps({
      request,
      signatures,
      encodeType: 'MultiSig',
    })
    return this.contract.executeTransactionLUW(
      Object.values(callProperties._request),
      callProperties._signatures,
      {
        gasLimit,
        gasPrice,
      }
    )
  }

  /**
   * Call executeTransactionEOA on MetaTxForwarder.
   * @param request MetaTxRequest details
   * @param signature Signature in string format
   * @param gasLimit Transaction gasLimit
   * @param gasPrice Transaction gasPrice in wei
   */
  async executeTransactionEOA({
    request,
    signature,
    gasLimit = 500000,
    gasPrice,
  }: {
    request: MetaTxRequest
    signature: string
    gasLimit: number
    gasPrice: number
  }): Promise<TransactionResponse> {
    const callProperties = await this.encodeExecuteTransactionProps({
      request,
      signatures: [signature],
      encodeType: 'MultiSig',
    })
    return this.contract.executeTransactionEOA(
      Object.values(callProperties._request),
      callProperties._signatures,
      {
        gasLimit,
        gasPrice,
      }
    )
  }

  /**
   * Encode an executeTransactionLUW call to MetaTxForwarder.
   * @param request MetaTxRequest details
   * @param signatures Signatures in flattened string format
   * @return properties to be passed to an executeTransaction call
   */
  encodeExecuteTransactionProps({
    request: { requestTypeKey, fromAddress, nonce, requestData },
    signatures,
    encodeType,
  }: EncodeExecuteTransactionRequest): EncodeExecuteTransactionResponse {
    const metaTxRequest = metaTxRequests[requestTypeKey]

    const suffixData = this.typedDataBuilder.encodeSuffixData(
      requestTypeKey,
      requestData
    )
    const callData =
      metaTxRequest.requiresDataField === true
        ? encodeContractFunctionCalldata(
            metaTxRequest.destinationContract,
            metaTxRequest.functionNameOrSig,
            requestData
          )
        : '0x'

    const executionRequest: ExecutionRequest = {
      typeHash: metaTxRequest.eip712TypeHash,
      from: fromAddress,
      nonce,
      suffixData,
      callData,
    }

    const joinedSignatures = joinSignatures(signatures)

    const result: Partial<EncodeExecuteTransactionResponse> = {
      _request: executionRequest,
    }

    switch (encodeType) {
      case 'SingleSig':
        result._signature = joinedSignatures
        break
      case 'MultiSig':
        result._signatures = joinedSignatures
        break
      default:
        throw new Error(`Encode type ${encodeType} not supported`)
    }
    return result as EncodeExecuteTransactionResponse
  }
}

export { MetaTxForwarder, ExecutionRequest }
