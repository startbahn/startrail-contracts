import { BigNumber } from 'ethers'

import { TypedDataField } from '@ethersproject/abstract-signer'

//
// Domain separator type
//

const EIP712DomainTypes: ReadonlyArray<TypedDataField> = [
  { name: 'name', type: 'string' }, // Startrail
  { name: 'version', type: 'string' }, // 1
  { name: 'chainId', type: 'uint256' }, // 1: mainnet, 4: rinkeby, etc.
  { name: 'verifyingContract', type: 'address' }, // MetaTxForwarder
]

//
// Generic MetaTx properties - shared by all the Startrail EIP712 signatures
//

const GenericParamTypes: ReadonlyArray<TypedDataField> = [
  { name: 'from', type: 'address' },
  { name: 'nonce', type: 'uint256' },
]

//
// Helper functions
//

/**
 * Check if a type is a Dynamic Array type.
 *
 * This includes any dynamic length array including string and bytes.
 *
 * see https://docs.soliditylang.org/en/v0.8.5/internals/layout_in_storage.html?highlight=bytes%20string#mappings-and-dynamic-arrays
 */
const isDynamicArrayType = (type: string): boolean =>
  type === 'string' || type === 'bytes' || type.indexOf('[]') !== -1

/**
 * Build a list of TypedDataField's given a mapping of field nammes to types.
 */
const buildTypeList = (
  fields: Record<string, string>
): ReadonlyArray<TypedDataField> => {
  const typeList: Array<TypedDataField> = [...GenericParamTypes]

  // calldata in 'data' required if one or more dynamic array types
  // see STARTRAIL-737
  if (Object.values(fields).some(isDynamicArrayType)) {
    typeList.push({ name: 'data', type: 'bytes' })
  }

  for (const name in fields) {
    typeList.push({ name, type: fields[name] })
  }

  return typeList
}

//
// LicensedUserManager Wallet message types (see OwnerManager.sol)
//

const WalletAddOwnerTypes: ReadonlyArray<TypedDataField> = buildTypeList({
  wallet: 'address',
  owner: 'address',
  threshold: 'uint256',
})

interface WalletAddOwnerRecord {
  wallet: string
  owner: string
  threshold: number | BigNumber | string
}

const WalletRemoveOwnerTypes: ReadonlyArray<TypedDataField> = buildTypeList({
  wallet: 'address',
  prevOwner: 'address',
  owner: 'address',
  threshold: 'uint256',
})

interface WalletRemoveOwnerRecord extends WalletAddOwnerRecord {
  prevOwner: string
}

const WalletSwapOwnerTypes: ReadonlyArray<TypedDataField> = buildTypeList({
  wallet: 'address',
  prevOwner: 'address',
  oldOwner: 'address',
  newOwner: 'address',
})

interface WalletSwapOwnerRecord {
  wallet: string
  prevOwner: string
  oldOwner: string
  newOwner: string
}

const WalletChangeThresholdTypes: ReadonlyArray<TypedDataField> = buildTypeList(
  {
    wallet: 'address',
    threshold: 'uint256',
  }
)

interface WalletChangeThresholdRecord {
  wallet: string
  threshold: number | BigNumber | string
}

const WalletSetEnglishNameTypes: ReadonlyArray<TypedDataField> = buildTypeList({
  wallet: 'address',
  name: 'string',
})

interface WalletSetEnglishNameRecord {
  wallet: string
  name: string
}

const WalletSetOriginalNameTypes: ReadonlyArray<TypedDataField> = buildTypeList(
  {
    wallet: 'address',
    name: 'string',
  }
)

interface WalletSetOriginalNameRecord {
  wallet: string
  name: string
}

//
// StartrailRegistry message types (see StartrailRegistry.sol)
// for backward compatibility. We plan to remove it in a future release.
//

const StartrailRegistryCreateSRRTypes: ReadonlyArray<TypedDataField> = buildTypeList(
  {
    isPrimaryIssuer: 'bool',
    artistAddress: 'address',
    metadataDigest: 'bytes32',
  }
)

interface StartrailRegistryCreateSRRRecord {
  isPrimaryIssuer: boolean
  artistAddress: string
  metadataDigest: string
}

const StartrailRegistryUpdateSRRTypes: ReadonlyArray<TypedDataField> = buildTypeList(
  {
    tokenId: 'uint256',
    isPrimaryIssuer: 'bool',
    artistAddress: 'address',
  }
)

//
// StartrailRegistry message types (see StartrailRegistry.sol)
//

const StartrailRegistryCreateSRRWithLockExternalTransferTypes: ReadonlyArray<TypedDataField> = buildTypeList(
  {
    isPrimaryIssuer: 'bool',
    artistAddress: 'address',
    metadataDigest: 'bytes32',
    lockExternalTransfer: 'bool',
  }
)

interface StartrailRegistryCreateSRRWithLockExternalTransferRecord {
  isPrimaryIssuer: boolean
  artistAddress: string
  metadataDigest: Buffer | string
  lockExternalTransfer: boolean
}

interface StartrailRegistryUpdateSRRRecord {
  tokenId: BigNumber | string
  isPrimaryIssuer: boolean
  artistAddress: string
}

const StartrailRegistryCreateSRRFromLicensedUserTypes: ReadonlyArray<TypedDataField> = buildTypeList(
  {
    isPrimaryIssuer: 'bool',
    artistAddress: 'address',
    metadataDigest: 'bytes32',
    lockExternalTransfer: 'bool',
    to: 'address',
  }
)

interface StartrailRegistryCreateSRRFromLicensedUserRecord {
  isPrimaryIssuer: boolean
  artistAddress: string
  metadataDigest: Buffer | string
  lockExternalTransfer: boolean
  to: string
}

const StartrailRegistryUpdateSRRMetadataTypes: ReadonlyArray<TypedDataField> = buildTypeList(
  {
    tokenId: 'uint256',
    metadataDigest: 'bytes32',
  }
)

interface StartrailRegistryUpdateSRRMetadataRecord {
  tokenId: BigNumber | string
  metadataDigest: string
}

const StartrailRegistryApproveSRRByCommitmentTypes: ReadonlyArray<TypedDataField> = buildTypeList(
  {
    tokenId: 'uint256',
    commitment: 'bytes32',
    historyMetadataDigest: 'string',
  }
)

interface StartrailRegistryApproveSRRByCommitmentRecord {
  tokenId: BigNumber | string
  commitment: Buffer | string
  historyMetadataDigest: Buffer | string
}

const StartrailRegistryApproveSRRByCommitmentWithCustomHistoryIdTypes: ReadonlyArray<TypedDataField> = buildTypeList(
  {
    tokenId: 'uint256',
    commitment: 'bytes32',
    historyMetadataDigest: 'string',
    customHistoryId: 'uint256',
  }
)

interface StartrailRegistryApproveSRRByCommitmentWithCustomHistoryIdRecord
  extends StartrailRegistryApproveSRRByCommitmentRecord {
  customHistoryId: BigNumber | string
}

const StartrailRegistryCancelSRRCommitmentTypes: ReadonlyArray<TypedDataField> = buildTypeList(
  {
    tokenId: 'uint256',
  }
)

interface StartrailRegistryCancelSRRCommitmentRecord {
  tokenId: BigNumber | string
}

const StartrailRegistryAddHistoryTypes: ReadonlyArray<TypedDataField> = buildTypeList(
  {
    tokenIds: 'uint256[]',
    customHistoryIds: 'uint256[]',
  }
)

interface StartrailRegistryAddHistoryRecord {
  tokenIds: BigNumber[] | string[]
  customHistoryIds: BigNumber[] | string[]
}

const StartrailRegistrySetLockExternalTransferTypes: ReadonlyArray<TypedDataField> = buildTypeList(
  { tokenId: 'uint256', flag: 'bool' }
)

interface StartrailRegistrySetLockExternalTransferRecord {
  tokenId: BigNumber | string
  flag: boolean
}

const StartrailRegistryTransferFromWithProvenanceTypes: ReadonlyArray<TypedDataField> = buildTypeList(
  {
    to: 'address',
    tokenId: 'uint256',
    historyMetadataDigest: 'string',
    customHistoryId: 'uint256',
    isIntermediary: 'bool',
  }
)

interface StartrailRegistryTransferFromWithProvenanceRecord {
  to: string
  tokenId: BigNumber | string
  historyMetadataDigest: Buffer | string
  customHistoryId: BigNumber | string
  isIntermediary: boolean
}

//
// BulkIssue message types (see BulkIssue.sol)
//

const BulkIssueSendBatchTypes: ReadonlyArray<TypedDataField> = buildTypeList({
  merkleRoot: 'bytes32',
})

interface BulkIssueSendBatchRecord {
  merkleRoot: Buffer | string
}

const BulkTransferSendBatchTypes: ReadonlyArray<TypedDataField> = buildTypeList(
  {
    merkleRoot: 'bytes32',
  }
)

interface BulkTransferSendBatchRecord {
  merkleRoot: Buffer | string
}

const BulkSendBatchTypes: ReadonlyArray<TypedDataField> = buildTypeList({
  merkleRoot: 'bytes32',
})

interface BulkSendBatchRecord {
  merkleRoot: Buffer | string
}

//
// All message type lists in a lookup
//
const MessageTypesRegistry: Record<string, ReadonlyArray<TypedDataField>> = {
  WalletAddOwnerTypes,
  WalletRemoveOwnerTypes,
  WalletSwapOwnerTypes,
  WalletChangeThresholdTypes,
  WalletSetEnglishNameTypes,
  WalletSetOriginalNameTypes,
  StartrailRegistryCreateSRRTypes,
  StartrailRegistryCreateSRRFromLicensedUserTypes,
  StartrailRegistryCreateSRRWithLockExternalTransferTypes,
  StartrailRegistryUpdateSRRTypes,
  StartrailRegistryUpdateSRRMetadataTypes,
  StartrailRegistryApproveSRRByCommitmentTypes,
  StartrailRegistryApproveSRRByCommitmentWithCustomHistoryIdTypes,
  StartrailRegistryCancelSRRCommitmentTypes,
  StartrailRegistryAddHistoryTypes,
  StartrailRegistrySetLockExternalTransferTypes,
  StartrailRegistryTransferFromWithProvenanceTypes,
  BulkIssueSendBatchTypes,
  BulkTransferSendBatchTypes,
  BulkSendBatchTypes,
}

//
// Union of All record types
//
type MessageRecordType =
  | WalletAddOwnerRecord
  | WalletRemoveOwnerRecord
  | WalletChangeThresholdRecord
  | WalletSwapOwnerRecord
  | WalletSetEnglishNameRecord
  | WalletSetOriginalNameRecord
  | StartrailRegistryCreateSRRRecord
  | StartrailRegistryCreateSRRFromLicensedUserRecord
  | StartrailRegistryCreateSRRWithLockExternalTransferRecord
  | StartrailRegistryUpdateSRRRecord
  | StartrailRegistryUpdateSRRMetadataRecord
  | StartrailRegistryApproveSRRByCommitmentRecord
  | StartrailRegistryApproveSRRByCommitmentWithCustomHistoryIdRecord
  | StartrailRegistryCancelSRRCommitmentRecord
  | StartrailRegistryAddHistoryRecord
  | StartrailRegistrySetLockExternalTransferRecord
  | StartrailRegistryTransferFromWithProvenanceRecord
  | BulkIssueSendBatchRecord
  | BulkTransferSendBatchRecord
  | BulkSendBatchRecord

export {
  MessageTypesRegistry as default,
  EIP712DomainTypes,
  GenericParamTypes,
  MessageRecordType,
  WalletAddOwnerRecord,
  WalletRemoveOwnerRecord,
  WalletChangeThresholdRecord,
  WalletSwapOwnerRecord,
  WalletSetEnglishNameRecord,
  WalletSetOriginalNameRecord,
  StartrailRegistryCreateSRRRecord,
  StartrailRegistryCreateSRRFromLicensedUserRecord,
  StartrailRegistryCreateSRRWithLockExternalTransferRecord,
  StartrailRegistryUpdateSRRRecord,
  StartrailRegistryUpdateSRRMetadataRecord,
  StartrailRegistryApproveSRRByCommitmentRecord,
  StartrailRegistryApproveSRRByCommitmentWithCustomHistoryIdRecord,
  StartrailRegistryCancelSRRCommitmentRecord,
  StartrailRegistryAddHistoryRecord,
  StartrailRegistrySetLockExternalTransferRecord,
  StartrailRegistryTransferFromWithProvenanceRecord,
  BulkIssueSendBatchRecord,
  BulkTransferSendBatchRecord,
  BulkSendBatchRecord,
  buildTypeList,
  isDynamicArrayType,
}
