import { BigNumber, ethers } from 'ethers'
import stripHexPrefix from 'strip-hex-prefix'

// see Startrail IDGenerator*.sol for the same algorithms in Solidity

const power10 = (exp) => BigNumber.from(10).pow(exp)

const ID_CAP = power10(8)
const ID_CAP_V2 = power10(12)

const srrIdComputeInternal = (
  artistAddress: string,
  metadataDigest: string,
  modulus: BigNumber
): number => {
  const encodedInput =
    stripHexPrefix(metadataDigest) + stripHexPrefix(artistAddress)
  const idHash = ethers.utils.keccak256(Buffer.from(encodedInput, 'hex'))
  return BigNumber.from(idHash).mod(modulus).toNumber()
}

const srrIdCompute = (artistAddress: string, metadataDigest: string): number =>
  srrIdComputeInternal(artistAddress, metadataDigest, ID_CAP)

const srrIdV2Compute = (
  artistAddress: string,
  metadataDigest: string
): number => srrIdComputeInternal(artistAddress, metadataDigest, ID_CAP_V2)

export { srrIdCompute, srrIdV2Compute }
