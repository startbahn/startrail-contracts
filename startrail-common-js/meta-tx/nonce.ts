import { BigNumber, Contract } from 'ethers'

const BITS_PER_NONCE = 128

/**
 * Pack nonce channel and nonce under channel into a single 32 byte
 * (uint256 in solidity) value
 * @param channel 1st dimension of nonce
 * @param nonce 2nd dimension of nonce
 * @returns Combined nonce
 */
const packNonce = (
  channel: number | BigNumber,
  nonce: number | BigNumber
): BigNumber => BigNumber.from(channel).shl(BITS_PER_NONCE).add(nonce)

/**
 * Unpack the 2 128-bit components from the packed 256-bit nonce.
 * @param  Packed 2D Nonce (upper 128bits - nonce1, lower 128bits - nonce2)
 * @returns [channel, nonce]
 */
const unpackNonce = (nonce: BigNumber): [BigNumber, BigNumber] => [
  nonce.shr(BITS_PER_NONCE), // nonce1
  nonce.mod(BigNumber.from(2).pow(BITS_PER_NONCE)), // nonce2
]

/**
 * Get next nonce from the MetaTxForwarder contract
 * @param forwarder MetaTxForwarder contract handle
 * @param signer Address of meta-tx signer
 * @param channel? 1st dimension of the 2D nonce (defaults to 0)
 * @returns Combined nonce
 */
const getNonce = async (
  forwarder: Contract,
  signer: string,
  channel = 0
): Promise<BigNumber> => {
  const nextNonceInChannel = await forwarder.getNonce(signer, channel)
  return packNonce(channel, nextNonceInChannel)
}

export { getNonce, packNonce, unpackNonce }
