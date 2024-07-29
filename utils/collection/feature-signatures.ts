const erc721DefaultFuncSignatures = Object.freeze([
  // feature
  `__ERC721Feature_initialize(string,string)`,
  `exists(uint256)`,
  `transferFromWithProvenance(address,uint256,string,uint256,bool)`,
  // core standard
  `balanceOf(address)`,
  `ownerOf(uint256)`,
  `safeTransferFrom(address,address,uint256)`,
  `safeTransferFrom(address,address,uint256,bytes)`,
  `transferFrom(address,address,uint256)`,
  `approve(address,uint256)`,
  `getApproved(uint256)`,
  `setApprovalForAll(address,bool)`,
  `isApprovedForAll(address,address)`,
  // metadata standard
  `name()`,
  `symbol()`,
  // tokenURI() is added with the SRRMetadataFeature below
])

const lockExternalTransferDefaultFuncSignatures = Object.freeze([
  `setLockExternalTransfer(uint256,bool)`,
  `getLockExternalTransfer(uint256)`,
])

const srrDefaultFuncSignatures = Object.freeze([
  `createSRR(bool,address,string,bool,address,address,uint16)`,
  `getSRR(uint256)`,
  `updateSRR(uint256,bool,address)`,
])

const srrMetadataDefaultFuncSignatures = Object.freeze([
  `updateSRRMetadata(uint256,string)`,
  `getSRRMetadata(uint256)`,
  `tokenURI(uint256)`,
])

const srrApproveTransferDefaultFuncSignatures = Object.freeze([
  `approveSRRByCommitment(uint256,bytes32,string,uint256)`,
  `approveSRRByCommitment(uint256,bytes32,string)`,
  `cancelSRRCommitment(uint256)`,
  `transferSRRByReveal(address,bytes32,uint256,bool)`,
  `getSRRCommitment(uint256)`,
])

const srrHistoryDefaultFuncSignatures = Object.freeze([
  `addHistory(uint256[],uint256[])`,
])

const erc2981RoyaltyDefaultFuncSignatures = Object.freeze([
  `updateSRRRoyalty(uint256,address,uint16)`,
  `updateSRRRoyaltyReceiverMulti(uint256[],address)`,
  `getSRRRoyalty(uint256)`,
  `royaltyInfo(uint256,uint256)`,
])

const bulkDefaultFuncSignatures = Object.freeze([
  `createSRRFromBulk(bool,address,string,address,bool,address,uint16)`,
  `approveSRRByCommitmentFromBulk(address,uint256,bytes32,string,uint256)`,
  `transferFromWithProvenanceFromBulk(address,address,uint256,string,uint256,bool)`,
])

const functionSignatures = Object.freeze({
  erc721: {
    v1: [...erc721DefaultFuncSignatures],
    v2: [...erc721DefaultFuncSignatures],
    v3: [...erc721DefaultFuncSignatures],
  },
  lockExternalTransfer: {
    v1: [...lockExternalTransferDefaultFuncSignatures],
  },
  srr: {
    v1: [...srrDefaultFuncSignatures],
    v2: [...srrDefaultFuncSignatures],
  },
  srrApproveTransfer: {
    v1: [
      ...srrApproveTransferDefaultFuncSignatures,
      `approveSRRByCommitmentFromBulk(uint256,bytes32,string,uint256)`,
    ],
    v2: [...srrApproveTransferDefaultFuncSignatures],
  },
  srrMetadata: {
    v1: [...srrMetadataDefaultFuncSignatures],
  },
  srrHistory: {
    v1: [...srrHistoryDefaultFuncSignatures],
  },
  erc2981Royalty: {
    v1: [...erc2981RoyaltyDefaultFuncSignatures],
  },
  bulk: {
    v1: [...bulkDefaultFuncSignatures],
  },
})

export default functionSignatures
