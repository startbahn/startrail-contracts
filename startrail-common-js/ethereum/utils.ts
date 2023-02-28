import { isValidChecksumAddress } from 'ethereumjs-util'
import stripHexPrefix from 'strip-hex-prefix'

const REG_EXP_KECCAK_HASH = /^([0-9A-Fa-f]){64}$/

const isKeccak256Hash = (hash: string): boolean =>
  REG_EXP_KECCAK_HASH.test(stripHexPrefix(hash))
const isEthereumTxHash = (txHash: string): boolean => isKeccak256Hash(txHash)

const isEthereumAddress = (addr: string): boolean =>
  isValidChecksumAddress(addr as any)

const zeroBytes32 = `0x${''.padStart(64, '0')}`

// add the 0x prefix if not already
const add0xPrefix = (hexString: string): string =>
  hexString.startsWith('0x') ? hexString : `0x${hexString}`

export {
  add0xPrefix,
  isEthereumAddress,
  isEthereumTxHash,
  isKeccak256Hash,
  zeroBytes32,
}
