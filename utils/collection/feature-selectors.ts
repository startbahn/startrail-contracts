import hre from 'hardhat'

import { Interface } from '@ethersproject/abi'

import funcSigs from './feature-signatures'

const getContractInterface = async (
  contractName: string
): Promise<Interface> => {
  const artifact = await hre.artifacts.readArtifact(contractName)
  return new Interface(artifact.abi)
}

/**
 * Compute the 4-byte selectors for a list of function signatures
 * @param contractName Feature contract the functionSignatures are on
 * @param functionSignatures List of function signatures (eg. exists(uint256)) to get selectors for
 * @returns List of 4-byte selectors (eg. 0xabcd1234) corresponding to the functionSignatures
 */
const getSelectors = async (
  contractName: string,
  functionSignatures: ReadonlyArray<string>
): Promise<string[]> => {
  const contractInterface = await getContractInterface(contractName)
  return functionSignatures.map((sig) => contractInterface.getSighash(sig))
}

const erc721FunctionSelectors = () =>
  getSelectors(`ERC721Feature`, funcSigs.erc721.v1)

const lockExternalTransferFunctionSelectors = () =>
  getSelectors(`LockExternalTransferFeature`, funcSigs.lockExternalTransfer.v1)

const srrFunctionSelectors = () => getSelectors(`SRRFeature`, funcSigs.srr.v1)

const srrApproveTransferFunctionSelectors = () =>
  getSelectors(`SRRApproveTransferFeature`, funcSigs.srrApproveTransfer.v1)

const srrMetadataFunctionSelectors = () =>
  getSelectors(`SRRMetadataFeature`, funcSigs.srrMetadata.v1)

const erc2981RoyaltyFunctionSelectors = () =>
  getSelectors(`ERC2981RoyaltyFeature`, funcSigs.erc2981Royalty.v1)

const featureSelectors = {
  erc721: erc721FunctionSelectors,
  lockExternalTransfer: lockExternalTransferFunctionSelectors,
  srr: srrFunctionSelectors,
  srrApproveTransfer: srrApproveTransferFunctionSelectors,
  erc2981Royalty: erc2981RoyaltyFunctionSelectors,
  srrMetadata: srrMetadataFunctionSelectors,
}

export default featureSelectors
