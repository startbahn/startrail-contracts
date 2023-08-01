const functionSignatures = Object.freeze({
  erc721: {
    v1: [
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
    ],
  },
  lockExternalTransfer: {
    v1: [
      `setLockExternalTransfer(uint256,bool)`,
      `getLockExternalTransfer(uint256)`,
    ],
  },
  srr: {
    v1: [
      `createSRR(bool,address,string,bool,address,address,uint16)`,
      `getSRR(uint256)`,
      `updateSRR(uint256,bool,address)`,
    ],
  },
  srrApproveTransfer: {
    v1: [
      `approveSRRByCommitment(uint256,bytes32,string,uint256)`,
      `approveSRRByCommitment(uint256,bytes32,string)`,
      `approveSRRByCommitmentFromBulk(uint256,bytes32,string,uint256)`,
      `cancelSRRCommitment(uint256)`,
      `transferSRRByReveal(address,bytes32,uint256,bool)`,
      `getSRRCommitment(uint256)`,
    ],
  },
  srrMetadata: {
    v1: [
      `updateSRRMetadata(uint256,string)`,
      `getSRRMetadata(uint256)`,
      `tokenURI(uint256)`,
    ],
  },
  srrHistory: {
    v1: [`addHistory(uint256[],uint256[])`],
  },
  erc2981Royalty: {
    v1: [
      `updateSRRRoyalty(uint256,address,uint16)`,
      `updateSRRRoyaltyReceiverMulti(uint256[],address)`,
      `getSRRRoyalty(uint256)`,
      `royaltyInfo(uint256,uint256)`,
    ],
  },
})

export default functionSignatures
