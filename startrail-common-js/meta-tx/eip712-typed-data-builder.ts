import { BigNumber } from 'ethers'

import { TypedDataDomain, TypedDataField } from '@ethersproject/abstract-signer'
import { AddressZero } from '@ethersproject/constants'
import { TypedDataEncoder } from '@ethersproject/hash/lib/typed-data'

import { encodeContractFunctionCalldata } from '../contracts/utils'
import MessageTypesRegistry, { EIP712DomainTypes } from './eip712-message-types'
import { metaTxRequests, MetaTxRequestType } from './meta-tx-request-registry'

const DOMAIN_NAME = 'Startrail'
const DOMAIN_VERSION = '1'

interface EIP712TypedData {
  types: Record<string, ReadonlyArray<TypedDataField>>
  primaryType: MetaTxRequestType
  domain: TypedDataDomain
  message: Record<string, any>
}

/**
 * EIP712 Typed data structure builder.
 *
 * See the section "Specification of the eth_signTypedData JSON RPC"
 * in the EIP 712 Spec for full details of the structure.
 *
 * It builds the JSON to be sent to eth_signTypedData for signing.
 *
 * All Startrail meta transactions are sent to the MetaTxForwarder
 * contract whose address is embedded in the JSON. The chainId is also
 * embedded in the JSON. This ensures signatures can not be replayed on
 * other chains.
 */
class EIP712TypedDataBuilder {
  domainData: Readonly<TypedDataDomain> // EIP712Domain

  /**
   * Create an instance and set up the domain data.
   * @param chainId Ethereum chainId of network these signatures are for
   * @param metaTxForwarderAddress MetaTxForwarder contract address
   */
  constructor(chainId: number, metaTxForwarderAddress: string) {
    this.domainData = {
      name: DOMAIN_NAME,
      version: DOMAIN_VERSION,
      chainId,
      verifyingContract: metaTxForwarderAddress,
    }
  }

  /**
   * Builds EIP712 TypedData JSON according to the spec:
   *    https://eips.ethereum.org/EIPS/eip-712
   *
   * Startrail types are defined and registered with the
   * MetaTxRequestManager.sol contract.
   *
   * @param requestTypeKey MetaTx request type key (see
   *          MetaTxRequestManager.sol contract and the
   *          request-registry.js)
   * @param from LicensedUser address to send request from
   * @param nonce MetaTx nonce (see getNonce and the
   *          ReplayProtection.sol) contract
   * @param requestData Properties specific to this request.
   */
  build({
    requestTypeKey,
    from,
    nonce,
    requestData,
  }: {
    requestTypeKey: MetaTxRequestType
    from: string
    nonce: string | BigNumber
    requestData: Record<string, any>
  }): EIP712TypedData {
    const messageData = this._requestParamsToTypedParams(requestData)

    // Add data prop if required
    const metaTxRequest = metaTxRequests[requestTypeKey]
    if (metaTxRequest.requiresDataField === true) {
      messageData.data = encodeContractFunctionCalldata(
        metaTxRequest.destinationContract,
        metaTxRequest.functionSignature,
        messageData
      )
    }

    return {
      types: {
        EIP712Domain: EIP712DomainTypes,
        [requestTypeKey]: MessageTypesRegistry[requestTypeKey + `Types`],
      },
      domain: this.domainData,
      primaryType: requestTypeKey,
      message: {
        from,
        nonce: BigNumber.isBigNumber(nonce) ? nonce.toString() : nonce,
        ...messageData,
      },
    }
  }

  /**
   * Encode suffixData for the meta transaction.
   * @param metaTxRequestType Request type for encoding
   * @param requestData Request props
   */
  encodeSuffixData(
    metaTxRequestType: MetaTxRequestType,
    requestData: Record<string, any>
  ): string {
    const messageData = this._requestParamsToTypedParams(requestData)
    const metaTxRequest = metaTxRequests[metaTxRequestType]

    const encoder = new TypedDataEncoder({
      [metaTxRequestType]: metaTxRequest.eip712Types,
    } as Record<string, TypedDataField[]>)

    const requestDataProps: Record<string, any> = {
      // dummy values for the generic props (these are stripped off after encoding)
      from: AddressZero,
      nonce: 1,
      // data to be encoded as suffixData
      ...messageData,
    }

    // If it's a requiresDataField request then add a dummy value.
    // This satisifies encodeData but does not add bytes to the result.
    if (metaTxRequest.requiresDataField === true) {
      requestDataProps.data = '0x00'
    }

    const encodedData = encoder.encodeData(metaTxRequestType, requestDataProps)

    // Skip over 192 hex digits of non suffixData:
    // - 32 bytes / 64 digits for each of the fields: [typeHash, from, nonce]
    // - plus 2 digits for '0x'
    // - plus 64 digits IF requiresDataField
    let skipHexDigits = 194
    if (metaTxRequest.requiresDataField === true) {
      skipHexDigits += 64
    }

    return `0x${encodedData.substring(skipHexDigits)}`
  }

  /**
   * Convert params in format for sending to contract function to a format
   * used by the typed data.
   * @param request Smart contract function request parameters
   * @return Request converted.
   */
  _requestParamsToTypedParams(
    request: Record<string, any>
  ): Record<string, any> {
    return this._convertBigNumberValuesToString(
      this._removeUnderscoreFromKeys(request)
    )
  }

  /**
   * Convert any BigNumber values to number strings.
   * @param request Smart contract function request parameters
   * @return Request with any BigNumber values converted to string.
   */
  _convertBigNumberValuesToString(
    request: Record<string, any>
  ): Record<string, any> {
    return Object.keys(request).reduce((result, key) => {
      const val = request[key]
      const newVal = BigNumber.isBigNumber(val) ? val.toString() : val
      result[key] = newVal
      return result
    }, {})
  }

  /**
   * Strip underscores from key names.
   *
   * Smart contract function parameter names are prefixed with '_'.
   *
   * Our EIP712 property names are not prefixed.
   *
   * @param request Smart contract function request parameters
   * @return Request with any leading underscore removed from keys.
   */
  _removeUnderscoreFromKeys(request: Record<string, any>): Record<string, any> {
    return Object.keys(request).reduce((result, key) => {
      const newKey = key.startsWith('_') ? key.substring(1) : key
      result[newKey] = request[key]
      return result
    }, {})
  }
}

export { EIP712TypedDataBuilder, EIP712TypedData }
