import { BigNumber, Wallet } from 'ethers'
import { clone } from 'lodash'
import stripHexPrefix from 'strip-hex-prefix'

import { TypedDataField } from '@ethersproject/abstract-signer'

import {
  EIP712TypedData,
  EIP712TypedDataBuilder,
} from './eip712-typed-data-builder'
import { MetaTxRequestType } from './meta-tx-request-registry'

const throwSignTypedDataNotAvailable = () => {
  throw new Error(
    `Signer._signTypedData not available. Upgrade to ethers >= v5.0.18.`
  )
}

/**
 * Sign a MetaTx request with 1 or more wallets.
 *
 * Given the request details this function will first build EIP712 typed data
 * and then for each given signer wallet it will sign the typed data using
 * signTypedData_v4.
 *
 * @param requestTypeKey - key from meta-tx-request-registry.js
 * @param chainId - chain Id for network this signature will be sendt to
 * @param forwarderAddress - address of MetaTxForwarder contract
 * @param fromAddress - address of LicensedUser wallet or EOA to send request from
 * @param nonce - 2D nonce of the MetaTx
 * @param requestData - request parameters
 * @param signers - wallets to sign with
 * @return Array of signatures in flattened string format
 */
const signRequest = ({
  requestTypeKey,
  chainId,
  forwarderAddress,
  fromAddress,
  nonce,
  requestData,
  signers,
}: {
  requestTypeKey: MetaTxRequestType
  chainId: number
  forwarderAddress: string
  fromAddress: string
  nonce: BigNumber
  requestData: Record<string, any>
  signers: Wallet[]
}): Promise<string[]> => {
  if (signers.some((signer) => undefined === signer._signTypedData)) {
    throwSignTypedDataNotAvailable()
  }

  const eip712TypedDataBuilder = new EIP712TypedDataBuilder(
    chainId,
    forwarderAddress
  )
  const typedDataObj = eip712TypedDataBuilder.build({
    requestTypeKey,
    from: fromAddress,
    nonce: nonce.toString(),
    requestData,
  })
  // console.log(JSON.stringify(typedDataObj, null, 2))

  return signTypedData(typedDataObj, signers)
}

/**
 * Sign an EIP712 typed data record with signTypedData_v4.
 * @param typedData - EIP712 typed data JSON to sign
 * @param signers - wallets to sign with
 * @return Array of signatures in flattened string format
 */
const signTypedData = (
  typedData: EIP712TypedData,
  signers: Wallet[]
): Promise<string[]> => {
  if (signers.some((signer) => undefined === signer._signTypedData)) {
    throwSignTypedDataNotAvailable()
  }

  const { domain, types, primaryType, message } = typedData

  // types field list is readonly but in _signTypedData it is not
  // so we clone here to allow it to be passed in:
  const typesMutable = clone({
    [primaryType]: types[primaryType],
  }) as { [x: string]: TypedDataField[] }

  // Signatures must be sent in a wallet addresses alphanum order.
  // This is due to the way owner addresses are stored in the
  // OwnerManager.sol contract.
  signers.sort(compareWalletByAddressString)

  return Promise.all(
    signers.map((signer) =>
      // sign EIP712 typed data
      signer._signTypedData(domain, typesMutable, message)
    )
  )
}

/**
 * Join array of flattened signatures into the format required by calls to
 * the MetaTxForwarder contract execution functions:
 *  - all flattened signature strings without leading 0x are concatenated together
 *  - add a 0x to the front of the resulting string
 * @param signatures Array of flattened signature strings
 * @return Signatures concatenated together
 */
const joinSignatures = (signatures: string[]): string =>
  `0x${signatures.map((sig) => stripHexPrefix(sig)).join('')}`

/**
 * Compare function for sort() that will compare by Wallet address.
 */
const compareWalletByAddressString = (a: Wallet, b: Wallet): number => {
  const aAddr = a.address.toLowerCase()
  const bAddr = b.address.toLowerCase()
  if (aAddr < bAddr) {
    return -1
  } else if (aAddr > bAddr) {
    return 1
  } else {
    return 0
  }
}

export { joinSignatures, signRequest, signTypedData }
