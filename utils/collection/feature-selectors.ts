import { Interface } from '@ethersproject/abi'
import hre from 'hardhat'

const getContractInterface = async (
  contractName: string
): Promise<Interface> => {
  const artifact = await hre.artifacts.readArtifact(contractName)
  return new Interface(artifact.abi)
}

const getSelectors = async (
  contractName: string,
  functionSignatures: ReadonlyArray<string>
): Promise<string[]> => {
  const contractInterface = await getContractInterface(contractName)
  return functionSignatures.map((sig) => contractInterface.getSighash(sig))
}

const erc721FeatureFunctionSignatures = [
  `__ERC721Feature_initialize(string,string)`,
  `exists(uint256)`,
]

const erc721FeatureFunctionSelectors = () =>
  getSelectors(`ERC721Feature`, erc721FeatureFunctionSignatures)

const erc721FunctionSignatures = [
  `balanceOf(address)`,
  `ownerOf(uint256)`,
  `safeTransferFrom(address,address,uint256)`,
  `safeTransferFrom(address,address,uint256,bytes)`,
  `transferFrom(address,address,uint256)`,
  `approve(address,uint256)`,
  `getApproved(uint256)`,
  `setApprovalForAll(address,bool)`,
  `isApprovedForAll(address,address)`,
]

const erc721FunctionSelectors = () =>
  getSelectors(`ERC721Feature`, erc721FunctionSignatures)

const erc721MetadataFunctionSignatures = [
  `name()`,
  `symbol()`,
  `tokenURI(uint256)`,
]

const erc721MetadataFunctionSelectors = () =>
  getSelectors(`ERC721Feature`, erc721MetadataFunctionSignatures)

const lockExternalTransferFeatureFunctionSignatures = [
  `setLockExternalTransfer(uint256,bool)`,
  `getLockExternalTransfer(uint256)`,
]

const lockExternalTransferFeatureFunctionSelectors = () =>
  getSelectors(
    `LockExternalTransferFeature`,
    lockExternalTransferFeatureFunctionSignatures
  )

const srrFeatureFunctionSignatures = [
  `createSRR(bool,address,string,bool,address,address,uint16)`,
  `getSRR(uint256)`,
  `updateSRR(uint256,bool,address)`,
]

const srrFeatureFunctionSelectors = () =>
  getSelectors(`SRRFeature`, srrFeatureFunctionSignatures)

const srrApproveTransferFeatureFunctionSignatures = [
  `approveSRRByCommitment(uint256,bytes32,string,uint256)`,
  `approveSRRByCommitment(uint256,bytes32,string)`,
  `approveSRRByCommitmentFromBulk(uint256,bytes32,string,uint256)`,
  `cancelSRRCommitment(uint256)`,
  `transferSRRByReveal(address,bytes32,uint256,bool)`,
  `getSRRCommitment(uint256)`,
]

const srrApproveTransferFeatureFunctionSelectors = () =>
  getSelectors(
    `SRRApproveTransferFeature`,
    srrApproveTransferFeatureFunctionSignatures
  )

const erc2981RoyaltyFeatureFunctionSignatures = [
  `updateSRRRoyalty(uint256,address,uint16)`,
  `updateSRRRoyaltyReceiverMulti(uint256[],address)`,
  `getSRRRoyalty(uint256)`,
  `royaltyInfo(uint256,uint256)`,
]

const erc2981RoyaltyFeatureFunctionSelectors = () =>
  getSelectors(`ERC2981RoyaltyFeature`, erc2981RoyaltyFeatureFunctionSignatures)

export {
  erc721FeatureFunctionSelectors,
  erc721FeatureFunctionSignatures,
  erc721MetadataFunctionSelectors,
  erc721MetadataFunctionSignatures,
  erc721FunctionSelectors,
  erc721FunctionSignatures,
  lockExternalTransferFeatureFunctionSelectors,
  lockExternalTransferFeatureFunctionSignatures,
  srrFeatureFunctionSelectors,
  srrFeatureFunctionSignatures,
  srrApproveTransferFeatureFunctionSelectors,
  srrApproveTransferFeatureFunctionSignatures,
  erc2981RoyaltyFeatureFunctionSelectors,
  erc2981RoyaltyFeatureFunctionSignatures,
}
