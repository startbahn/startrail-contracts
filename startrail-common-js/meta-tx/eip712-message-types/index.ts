import { TypedDataField } from '@ethersproject/abstract-signer'

import {
  BulkIssueSendBatchRecord,
  BulkIssueSendBatchTypes,
  BulkSendBatchRecord,
  BulkSendBatchTypes,
  BulkTransferSendBatchRecord,
  BulkTransferSendBatchTypes,
} from './bulk-types'
import {
  CollectionFactoryCreateCollectionRecord,
  CollectionFactoryCreateCollectionTypes,
} from './collection-factory-types'
import {
  CollectionAddHistoryRecord,
  CollectionAddHistoryTypes,
  CollectionApproveSRRByCommitmentRecord,
  CollectionApproveSRRByCommitmentTypes,
  CollectionApproveSRRByCommitmentV2Record,
  CollectionApproveSRRByCommitmentV2Types,
  CollectionApproveSRRByCommitmentWithCustomHistoryIdRecord,
  CollectionApproveSRRByCommitmentWithCustomHistoryIdTypes,
  CollectionApproveSRRByCommitmentWithCustomHistoryIdV2Record,
  CollectionApproveSRRByCommitmentWithCustomHistoryIdV2Types,
  CollectionCancelSRRCommitmentRecord,
  CollectionCancelSRRCommitmentTypes,
  CollectionCreateSRRRecord,
  CollectionCreateSRRTypes,
  CollectionSetLockExternalTransferRecord,
  CollectionSetLockExternalTransferTypes,
  CollectionTransferFromWithProvenanceRecord,
  CollectionTransferFromWithProvenanceTypes,
  CollectionTransferFromWithProvenanceV2Record,
  CollectionTransferFromWithProvenanceV2Types,
  CollectionUpdateSRRMetadataRecord,
  CollectionUpdateSRRMetadataTypes,
  CollectionUpdateSRRMetadataWithCidRecord,
  CollectionUpdateSRRMetadataWithCidTypes,
  CollectionUpdateSRRRecord,
  CollectionUpdateSRRRoyaltyRecord,
  CollectionUpdateSRRRoyaltyTypes,
  CollectionUpdateSRRTypes,
  CreateCollection,
  CreateCollectionTypes,
} from './collection.types'
import { EIP712DomainTypes, GenericParamTypes } from './core-types'
import { isDynamicArrayType } from './helpers'
import {
  WalletAddOwnerRecord,
  WalletAddOwnerTypes,
  WalletChangeThresholdRecord,
  WalletChangeThresholdTypes,
  WalletRemoveOwnerRecord,
  WalletRemoveOwnerTypes,
  WalletSetEnglishNameRecord,
  WalletSetEnglishNameTypes,
  WalletSetOriginalNameRecord,
  WalletSetOriginalNameTypes,
  WalletSwapOwnerRecord,
  WalletSwapOwnerTypes,
} from './licensed-user-types'
import {
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
  StartrailRegistryUpdateSRRRecord,
  StartrailRegistryUpdateSRRRoyaltyRecord,
  StartrailRegistryUpdateSRRRoyaltyTypes,
  StartrailRegistryUpdateSRRTypes,
} from './startrail-registry-types'

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

  StartrailRegistryCreateSRRFromLicensedUserTypes,
  StartrailRegistryCreateSRRFromLicensedUserWithCidTypes,
  StartrailRegistryCreateSRRFromLicensedUserWithRoyaltyTypes,
  StartrailRegistryCreateSRRWithLockExternalTransferTypes,
  StartrailRegistryUpdateSRRTypes,
  StartrailRegistryUpdateSRRMetadataTypes,
  StartrailRegistryUpdateSRRMetadataWithCidTypes,
  StartrailRegistryUpdateSRRRoyaltyTypes,
  StartrailRegistryApproveSRRByCommitmentTypes,
  StartrailRegistryApproveSRRByCommitmentV2Types,
  StartrailRegistryApproveSRRByCommitmentWithCustomHistoryIdTypes,
  StartrailRegistryApproveSRRByCommitmentWithCustomHistoryIdV2Types,
  StartrailRegistryCancelSRRCommitmentTypes,
  StartrailRegistryAddHistoryTypes,
  StartrailRegistrySetLockExternalTransferTypes,
  StartrailRegistryTransferFromWithProvenanceTypes,
  StartrailRegistryTransferFromWithProvenanceV2Types,

  BulkIssueSendBatchTypes,
  BulkTransferSendBatchTypes,
  BulkSendBatchTypes,

  CollectionFactoryCreateCollectionTypes,

  CollectionCreateSRRTypes,
  CollectionUpdateSRRTypes,
  CollectionUpdateSRRMetadataTypes,
  CollectionUpdateSRRMetadataWithCidTypes,
  CollectionUpdateSRRRoyaltyTypes,
  CollectionApproveSRRByCommitmentTypes,
  CollectionApproveSRRByCommitmentWithCustomHistoryIdTypes,
  CollectionApproveSRRByCommitmentV2Types,
  CollectionApproveSRRByCommitmentWithCustomHistoryIdV2Types,
  CollectionCancelSRRCommitmentTypes,
  CollectionAddHistoryTypes,
  CollectionSetLockExternalTransferTypes,
  CollectionTransferFromWithProvenanceTypes,
  CollectionTransferFromWithProvenanceV2Types,
  CreateCollectionTypes,
}

//
// Union of All record types
//
type MessageRecordType =
  // LicensedUserManager contract
  | WalletAddOwnerRecord
  | WalletRemoveOwnerRecord
  | WalletChangeThresholdRecord
  | WalletSwapOwnerRecord
  | WalletSetEnglishNameRecord
  | WalletSetOriginalNameRecord

  // StartrailRegistry contract
  | StartrailRegistryCreateSRRFromLicensedUserRecord
  | StartrailRegistryCreateSRRFromLicensedUserWithCidRecord
  | StartrailRegistryCreateSRRFromLicensedUserWithRoyaltyRecord
  | StartrailRegistryCreateSRRWithLockExternalTransferRecord
  | StartrailRegistryUpdateSRRRecord
  | StartrailRegistryUpdateSRRMetadataRecord
  | StartrailRegistryUpdateSRRMetadataWithCidRecord
  | StartrailRegistryUpdateSRRRoyaltyRecord
  | StartrailRegistryApproveSRRByCommitmentRecord
  | StartrailRegistryApproveSRRByCommitmentV2Record
  | StartrailRegistryApproveSRRByCommitmentWithCustomHistoryIdRecord
  | StartrailRegistryApproveSRRByCommitmentWithCustomHistoryIdV2Record
  | StartrailRegistryCancelSRRCommitmentRecord
  | StartrailRegistryAddHistoryRecord
  | StartrailRegistrySetLockExternalTransferRecord
  | StartrailRegistryTransferFromWithProvenanceRecord
  | StartrailRegistryTransferFromWithProvenanceV2Record

  // CollectionFactory contract
  | CollectionFactoryCreateCollectionRecord

  // Collections contracts (proxies)
  | CollectionCreateSRRRecord
  | CollectionUpdateSRRRecord
  | CollectionUpdateSRRMetadataRecord
  | CollectionUpdateSRRMetadataWithCidRecord
  | CollectionUpdateSRRRoyaltyRecord
  | CollectionApproveSRRByCommitmentRecord
  | CollectionApproveSRRByCommitmentV2Record
  | CollectionApproveSRRByCommitmentWithCustomHistoryIdRecord
  | CollectionApproveSRRByCommitmentWithCustomHistoryIdV2Record
  | CollectionCancelSRRCommitmentRecord
  | CollectionAddHistoryRecord
  | CollectionSetLockExternalTransferRecord
  | CollectionTransferFromWithProvenanceRecord
  | CollectionTransferFromWithProvenanceV2Record
  | CreateCollection

  // Bulk contracts
  | BulkIssueSendBatchRecord
  | BulkTransferSendBatchRecord
  | BulkSendBatchRecord

export {
  MessageTypesRegistry as default,
  // Union of all record types
  MessageRecordType,
  // Helpers
  isDynamicArrayType,
  // Shared types
  EIP712DomainTypes,
  GenericParamTypes,
  // LicensedUser contract
  WalletAddOwnerRecord,
  WalletRemoveOwnerRecord,
  WalletChangeThresholdRecord,
  WalletSwapOwnerRecord,
  WalletSetEnglishNameRecord,
  WalletSetOriginalNameRecord,
  // StartrailRegistry contract
  StartrailRegistryCreateSRRFromLicensedUserRecord,
  StartrailRegistryCreateSRRFromLicensedUserWithCidRecord,
  StartrailRegistryCreateSRRFromLicensedUserWithRoyaltyRecord,
  StartrailRegistryCreateSRRWithLockExternalTransferRecord,
  StartrailRegistryUpdateSRRRecord,
  StartrailRegistryUpdateSRRMetadataRecord,
  StartrailRegistryUpdateSRRMetadataWithCidRecord,
  StartrailRegistryUpdateSRRRoyaltyRecord,
  StartrailRegistryApproveSRRByCommitmentRecord,
  StartrailRegistryApproveSRRByCommitmentV2Record,
  StartrailRegistryApproveSRRByCommitmentWithCustomHistoryIdRecord,
  StartrailRegistryApproveSRRByCommitmentWithCustomHistoryIdV2Record,
  StartrailRegistryCancelSRRCommitmentRecord,
  StartrailRegistryAddHistoryRecord,
  StartrailRegistrySetLockExternalTransferRecord,
  StartrailRegistryTransferFromWithProvenanceRecord,
  StartrailRegistryTransferFromWithProvenanceV2Record,
  // CollectionFactory contract
  CollectionFactoryCreateCollectionRecord,
  // Collections contracts
  CollectionCreateSRRRecord,
  CollectionUpdateSRRRecord,
  CollectionUpdateSRRMetadataRecord,
  CollectionUpdateSRRMetadataWithCidRecord,
  CollectionUpdateSRRRoyaltyRecord,
  CollectionApproveSRRByCommitmentRecord,
  CollectionApproveSRRByCommitmentWithCustomHistoryIdRecord,
  CollectionCancelSRRCommitmentRecord,
  CollectionAddHistoryRecord,
  CollectionSetLockExternalTransferRecord,
  CollectionTransferFromWithProvenanceRecord,
  CreateCollection,
  // Bulk contracts
  BulkIssueSendBatchRecord,
  BulkTransferSendBatchRecord,
  BulkSendBatchRecord,
}
