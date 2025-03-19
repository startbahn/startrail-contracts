enum CollectionFeatureEnum {
  BulkFeature = 'BulkFeature',
  ERC721Feature = 'ERC721Feature',
  ERC2981RoyaltyFeature = 'ERC2981RoyaltyFeature',
  LockExternalTransferFeature = 'LockExternalTransferFeature',
  SRRFeature = 'SRRFeature',
  SRRApproveTransferFeature = 'SRRApproveTransferFeature',
  SRRMetadataFeature = 'SRRMetadataFeature',
  SRRHistoryFeature = 'SRRHistoryFeature',
}

const erc721CommonFuncSignatures = Object.freeze([
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

const lockExternalTransferCommonFuncSignatures = Object.freeze([
  `setLockExternalTransfer(uint256,bool)`,
  `getLockExternalTransfer(uint256)`,
])

const srrCommonFuncSignatures = Object.freeze([
  `createSRR(bool,address,string,bool,address,address,uint16)`,
  `getSRR(uint256)`,
  `updateSRR(uint256,bool,address)`,
])

const srrMetadataCommonFuncSignatures = Object.freeze([
  `updateSRRMetadata(uint256,string)`,
  `getSRRMetadata(uint256)`,
  `tokenURI(uint256)`,
])

const srrApproveTransferCommonFuncSignatures = Object.freeze([
  `approveSRRByCommitment(uint256,bytes32,string,uint256)`,
  `approveSRRByCommitment(uint256,bytes32,string)`,
  `cancelSRRCommitment(uint256)`,
  `transferSRRByReveal(address,bytes32,uint256,bool)`,
  `getSRRCommitment(uint256)`,
])

const srrHistoryCommonFuncSignatures = Object.freeze([
  `addHistory(uint256[],uint256[])`,
])

const erc2981RoyaltyCommonFuncSignatures = Object.freeze([
  `updateSRRRoyalty(uint256,address,uint16)`,
  `updateSRRRoyaltyReceiverMulti(uint256[],address)`,
  `getSRRRoyalty(uint256)`,
  `royaltyInfo(uint256,uint256)`,
])

const bulkCommonFuncSignatures = Object.freeze([
  `approveSRRByCommitmentFromBulk(address,uint256,bytes32,string,uint256)`,
  `transferFromWithProvenanceFromBulk(address,address,uint256,string,uint256,bool)`,
])

type CollectionFunctionSignaturesType = {
  [Key in CollectionFeatureEnum]: {
    [version: string]: string[]
  }
}

const CollectionFunctionSignatures: CollectionFunctionSignaturesType =
  Object.freeze({
    ERC721Feature: {
      V01: [...erc721CommonFuncSignatures],
      V02: [...erc721CommonFuncSignatures],
      V03: [...erc721CommonFuncSignatures],
      V04: [...erc721CommonFuncSignatures],
      V05: [...erc721CommonFuncSignatures],
    },
    LockExternalTransferFeature: {
      V01: [...lockExternalTransferCommonFuncSignatures],
    },
    SRRFeature: {
      V01: [...srrCommonFuncSignatures],
      V02: [...srrCommonFuncSignatures],
    },
    SRRApproveTransferFeature: {
      V01: [
        ...srrApproveTransferCommonFuncSignatures,
        `approveSRRByCommitmentFromBulk(uint256,bytes32,string,uint256)`,
      ],
      V02: [...srrApproveTransferCommonFuncSignatures],
      V03: [...srrApproveTransferCommonFuncSignatures],
      V04: [...srrApproveTransferCommonFuncSignatures],
    },
    SRRMetadataFeature: {
      V01: [...srrMetadataCommonFuncSignatures],
    },
    SRRHistoryFeature: {
      V01: [...srrHistoryCommonFuncSignatures],
    },
    ERC2981RoyaltyFeature: {
      V01: [...erc2981RoyaltyCommonFuncSignatures],
    },
    BulkFeature: {
      V01: [
        ...bulkCommonFuncSignatures,
        `createSRRFromBulk(bool,address,string,address,bool,address,uint16)`,
      ],
      V02: [
        ...bulkCommonFuncSignatures,
        `createSRRFromBulk(bool,address,string,address,bool,address,address,uint16)`,
      ],
      V03: [
        ...bulkCommonFuncSignatures,
        `createSRRFromBulk(bool,address,string,address,bool,address,address,uint16)`,
      ],
      V04: [
        ...bulkCommonFuncSignatures,
        `createSRRFromBulk(bool,address,string,address,bool,address,address,uint16)`,
      ],
    },
  })

export {
  CollectionFeatureEnum,
  CollectionFunctionSignaturesType,
  CollectionFunctionSignatures,
}
