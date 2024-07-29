import { BigNumber } from 'ethers'

import { TypedDataField } from '@ethersproject/abstract-signer'

import { buildTypeList } from './helpers'

//
// StartrailRegistry message types (see StartrailRegistry.sol)
//

/**
 * Deprecated form. Backward compatibility for deployment
 */
const StartrailRegistryCreateSRRWithLockExternalTransferTypes: ReadonlyArray<TypedDataField> =
  buildTypeList({
    isPrimaryIssuer: 'bool',
    artistAddress: 'address',
    metadataDigest: 'bytes32',
    lockExternalTransfer: 'bool',
  })

/**
 * Deprecated form. Backward compatibility for deployment
 */
interface StartrailRegistryCreateSRRWithLockExternalTransferRecord {
  isPrimaryIssuer: boolean
  artistAddress: string
  metadataDigest: Buffer | string
  lockExternalTransfer: boolean
}

/**
 * Deprecated form. Backward compatibility for deployment
 */
const StartrailRegistryCreateSRRFromLicensedUserTypes: ReadonlyArray<TypedDataField> =
  buildTypeList({
    isPrimaryIssuer: 'bool',
    artistAddress: 'address',
    metadataDigest: 'bytes32',
    lockExternalTransfer: 'bool',
    to: 'address',
  })

/**
 * Deprecated form. Backward compatibility for deployment
 */
interface StartrailRegistryCreateSRRFromLicensedUserRecord {
  isPrimaryIssuer: boolean
  artistAddress: string
  metadataDigest: Buffer | string
  lockExternalTransfer: boolean
  to: string
}

/**
 * Deprecated form. Backward compatibility for deployment
 */
const StartrailRegistryCreateSRRFromLicensedUserWithCidTypes: ReadonlyArray<TypedDataField> =
  buildTypeList({
    isPrimaryIssuer: 'bool',
    artistAddress: 'address',
    metadataDigest: 'bytes32',
    metadataCID: 'string',
    lockExternalTransfer: 'bool',
    to: 'address',
  })

/**
 * Deprecated form. Backward compatibility for deployment
 */
interface StartrailRegistryCreateSRRFromLicensedUserWithCidRecord {
  isPrimaryIssuer: boolean
  artistAddress: string
  metadataDigest: Buffer | string
  metadataCID: Buffer | string
  lockExternalTransfer: boolean
  to: string
}

/**
 * Deprecated form. Backward compatibility for deployment
 */
interface StartrailRegistryCreateSRRFromLicensedUserWithRoyaltyRecord {
  isPrimaryIssuer: boolean
  artistAddress: string
  metadataDigest: Buffer | string
  metadataCID: Buffer | string
  lockExternalTransfer: boolean
  to: string
  royaltyReceiver: string
  royaltyBasisPoints: number
}

/**
 * Deprecated form. Backward compatibility for deployment
 */
const StartrailRegistryCreateSRRFromLicensedUserWithRoyaltyTypes: ReadonlyArray<TypedDataField> =
  buildTypeList({
    isPrimaryIssuer: 'bool',
    artistAddress: 'address',
    metadataDigest: 'bytes32',
    metadataCID: 'string',
    lockExternalTransfer: 'bool',
    to: 'address',
    royaltyReceiver: 'address',
    royaltyBasisPoints: 'uint16',
  })

interface StartrailRegistryCreateSRRFromLicensedUserWithIPFSAndRoyaltyRecord {
  isPrimaryIssuer: boolean
  artistAddress: string
  metadataCID: Buffer | string
  lockExternalTransfer: boolean
  to: string
  royaltyReceiver: string
  royaltyBasisPoints: number
}

const StartrailRegistryCreateSRRFromLicensedUserWithIPFSAndRoyaltyTypes: ReadonlyArray<TypedDataField> =
  buildTypeList({
    isPrimaryIssuer: 'bool',
    artistAddress: 'address',
    metadataCID: 'string',
    lockExternalTransfer: 'bool',
    to: 'address',
    royaltyReceiver: 'address',
    royaltyBasisPoints: 'uint16',
  })

const StartrailRegistryUpdateSRRTypes: ReadonlyArray<TypedDataField> =
  buildTypeList({
    tokenId: 'uint256',
    isPrimaryIssuer: 'bool',
    artistAddress: 'address',
  })

interface StartrailRegistryUpdateSRRRecord {
  tokenId: BigNumber | string
  isPrimaryIssuer: boolean
  artistAddress: string
}

const StartrailRegistryUpdateSRRMetadataWithCidTypes: ReadonlyArray<TypedDataField> =
  buildTypeList({
    tokenId: 'uint256',
    metadataCID: 'string',
  })

interface StartrailRegistryUpdateSRRMetadataWithCidRecord {
  tokenId: BigNumber | string
  metadataCID: string
}

const StartrailRegistryUpdateSRRRoyaltyTypes: ReadonlyArray<TypedDataField> =
  buildTypeList({
    tokenId: 'uint256',
    royaltyReceiver: 'address',
    royaltyBasisPoints: 'uint16',
  })

/**
 * Deprecated form. Backward compatibility for deployment
 */
const StartrailRegistryUpdateSRRMetadataTypes: ReadonlyArray<TypedDataField> =
  buildTypeList({
    tokenId: 'uint256',
    metadataDigest: 'bytes32',
  })

/**
 * Deprecated form. Backward compatibility for deployment
 */
interface StartrailRegistryUpdateSRRMetadataRecord {
  tokenId: BigNumber | string
  metadataDigest: string
}

interface StartrailRegistryUpdateSRRRoyaltyRecord {
  tokenId: BigNumber | string
  royaltyReceiver: string
  royaltyBasisPoints: number
}

// v1: using historyMetadataDigest
const StartrailRegistryApproveSRRByCommitmentTypes: ReadonlyArray<TypedDataField> =
  buildTypeList({
    tokenId: 'uint256',
    commitment: 'bytes32',
    historyMetadataDigest: 'string',
  })

// v1: using historyMetadataDigest
interface StartrailRegistryApproveSRRByCommitmentRecord {
  tokenId: BigNumber | string
  commitment: Buffer | string
  historyMetadataDigest: Buffer | string
}

// v1: using historyMetadataDigest
const StartrailRegistryApproveSRRByCommitmentWithCustomHistoryIdTypes: ReadonlyArray<TypedDataField> =
  buildTypeList({
    tokenId: 'uint256',
    commitment: 'bytes32',
    historyMetadataDigest: 'string',
    customHistoryId: 'uint256',
  })

// v1: using historyMetadataDigest
interface StartrailRegistryApproveSRRByCommitmentWithCustomHistoryIdRecord
  extends StartrailRegistryApproveSRRByCommitmentRecord {
  customHistoryId: BigNumber | string
}

// v2: using historyMetadataHash
const StartrailRegistryApproveSRRByCommitmentV2Types: ReadonlyArray<TypedDataField> =
  buildTypeList({
    tokenId: 'uint256',
    commitment: 'bytes32',
    historyMetadataHash: 'string',
  })

// v2: using historyMetadataHash
interface StartrailRegistryApproveSRRByCommitmentV2Record {
  tokenId: BigNumber | string
  commitment: Buffer | string
  historyMetadataHash: Buffer | string
}

// v2: using historyMetadataHash
const StartrailRegistryApproveSRRByCommitmentWithCustomHistoryIdV2Types: ReadonlyArray<TypedDataField> =
  buildTypeList({
    tokenId: 'uint256',
    commitment: 'bytes32',
    historyMetadataHash: 'string',
    customHistoryId: 'uint256',
  })

// v2: using historyMetadataHash
interface StartrailRegistryApproveSRRByCommitmentWithCustomHistoryIdV2Record
  extends StartrailRegistryApproveSRRByCommitmentV2Record {
  customHistoryId: number | BigNumber | string
}

const StartrailRegistryCancelSRRCommitmentTypes: ReadonlyArray<TypedDataField> =
  buildTypeList({
    tokenId: 'uint256',
  })

interface StartrailRegistryCancelSRRCommitmentRecord {
  tokenId: BigNumber | string
}

const StartrailRegistryAddHistoryTypes: ReadonlyArray<TypedDataField> =
  buildTypeList({
    tokenIds: 'uint256[]',
    customHistoryIds: 'uint256[]',
  })

interface StartrailRegistryAddHistoryRecord {
  tokenIds: BigNumber[] | string[]
  customHistoryIds: number[] | BigNumber[] | string[]
}

const StartrailRegistrySetLockExternalTransferTypes: ReadonlyArray<TypedDataField> =
  buildTypeList({ tokenId: 'uint256', flag: 'bool' })

interface StartrailRegistrySetLockExternalTransferRecord {
  tokenId: BigNumber | string
  flag: boolean
}

// v1: using historyMetadataDigest
const StartrailRegistryTransferFromWithProvenanceTypes: ReadonlyArray<TypedDataField> =
  buildTypeList({
    to: 'address',
    tokenId: 'uint256',
    historyMetadataDigest: 'string',
    customHistoryId: 'uint256',
    isIntermediary: 'bool',
  })

// v1: using historyMetadataDigest
interface StartrailRegistryTransferFromWithProvenanceRecord {
  to: string
  tokenId: BigNumber | string
  historyMetadataDigest: Buffer | string
  customHistoryId: BigNumber | string
  isIntermediary: boolean
}

// v2: using historyMetadataHash
const StartrailRegistryTransferFromWithProvenanceV2Types: ReadonlyArray<TypedDataField> =
  buildTypeList({
    to: 'address',
    tokenId: 'uint256',
    historyMetadataHash: 'string',
    customHistoryId: 'uint256',
    isIntermediary: 'bool',
  })

// v2: using historyMetadataHash
interface StartrailRegistryTransferFromWithProvenanceV2Record {
  to: string
  tokenId: BigNumber | string
  historyMetadataHash: Buffer | string
  customHistoryId: number | BigNumber | string
  isIntermediary: boolean
}

export {
  StartrailRegistryAddHistoryRecord,
  StartrailRegistryAddHistoryTypes,
  StartrailRegistryApproveSRRByCommitmentRecord,
  StartrailRegistryApproveSRRByCommitmentTypes,
  StartrailRegistryApproveSRRByCommitmentV2Record,
  StartrailRegistryApproveSRRByCommitmentV2Types,
  StartrailRegistryApproveSRRByCommitmentWithCustomHistoryIdRecord,
  StartrailRegistryApproveSRRByCommitmentWithCustomHistoryIdTypes,
  StartrailRegistryApproveSRRByCommitmentWithCustomHistoryIdV2Record,
  StartrailRegistryApproveSRRByCommitmentWithCustomHistoryIdV2Types,
  StartrailRegistryCancelSRRCommitmentRecord,
  StartrailRegistryCancelSRRCommitmentTypes,
  StartrailRegistryCreateSRRFromLicensedUserRecord,
  StartrailRegistryCreateSRRFromLicensedUserTypes,
  StartrailRegistryCreateSRRFromLicensedUserWithCidRecord,
  StartrailRegistryCreateSRRFromLicensedUserWithCidTypes,
  StartrailRegistryCreateSRRFromLicensedUserWithRoyaltyRecord,
  StartrailRegistryCreateSRRFromLicensedUserWithRoyaltyTypes,
  StartrailRegistryCreateSRRFromLicensedUserWithIPFSAndRoyaltyRecord,
  StartrailRegistryCreateSRRFromLicensedUserWithIPFSAndRoyaltyTypes,
  StartrailRegistryCreateSRRWithLockExternalTransferRecord,
  StartrailRegistryCreateSRRWithLockExternalTransferTypes,
  StartrailRegistrySetLockExternalTransferRecord,
  StartrailRegistrySetLockExternalTransferTypes,
  StartrailRegistryTransferFromWithProvenanceRecord,
  StartrailRegistryTransferFromWithProvenanceTypes,
  StartrailRegistryTransferFromWithProvenanceV2Record,
  StartrailRegistryTransferFromWithProvenanceV2Types,
  StartrailRegistryUpdateSRRMetadataRecord,
  StartrailRegistryUpdateSRRMetadataTypes,
  StartrailRegistryUpdateSRRMetadataWithCidRecord,
  StartrailRegistryUpdateSRRMetadataWithCidTypes,
  StartrailRegistryUpdateSRRRoyaltyRecord,
  StartrailRegistryUpdateSRRRoyaltyTypes,
  StartrailRegistryUpdateSRRRecord,
  StartrailRegistryUpdateSRRTypes,
}
