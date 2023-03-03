import { TypedDataField } from '@ethersproject/abstract-signer'

import { buildTypeList } from './helpers'
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

const addDestinationField = (
  fields: ReadonlyArray<TypedDataField>
): ReadonlyArray<TypedDataField> => {
  // Insert 'destination' after the core fields which are as follows:
  //
  // [0] = from
  // [1] = nonce
  // [2] = data (optional)
  //
  const insertPosition = fields[2].name === 'data' ? 3 : 2

  return [
    // from and nonce
    ...fields.slice(0, insertPosition),

    // destination should go next
    { name: 'destination', type: 'address' },

    // remaining fields
    ...fields.slice(insertPosition),
  ]
}

//
// Collection contract message types (see feature contracts under collection/features)
//

interface DestinationRecord {
  destination: string
}

const CollectionCreateSRRTypes: ReadonlyArray<TypedDataField> = addDestinationField(
  buildTypeList({
    isPrimaryIssuer: 'bool',
    artistAddress: 'address',
    metadataCID: 'string',
    lockExternalTransfer: 'bool',
    to: 'address',
    royaltyReceiver: 'address',
    royaltyPercentage: 'uint16',
  })
)

interface CollectionCreateSRRRecord extends DestinationRecord {
  isPrimaryIssuer: boolean
  artistAddress: string
  metadataCID: string
  lockExternalTransfer: boolean
  to: string
  royaltyReceiver: string
  royaltyPercentage: string
}

//
// The following are derived from the StartrailRegistry types. Simply adding a
// a destination field to the type list for the collection address.
//

const CollectionUpdateSRRTypes: ReadonlyArray<TypedDataField> = addDestinationField(
  StartrailRegistryUpdateSRRTypes
)

interface CollectionUpdateSRRRecord
  extends DestinationRecord,
    StartrailRegistryUpdateSRRRecord {}

const CollectionUpdateSRRMetadataWithCidTypes: ReadonlyArray<TypedDataField> = addDestinationField(
  StartrailRegistryUpdateSRRMetadataWithCidTypes
)

interface CollectionUpdateSRRMetadataWithCidRecord
  extends DestinationRecord,
    StartrailRegistryUpdateSRRMetadataWithCidRecord {}

const CollectionUpdateSRRRoyaltyTypes: ReadonlyArray<TypedDataField> = addDestinationField(
  StartrailRegistryUpdateSRRRoyaltyTypes
)

interface CollectionUpdateSRRRoyaltyRecord
  extends DestinationRecord,
    StartrailRegistryUpdateSRRRoyaltyRecord {}

const CollectionUpdateSRRMetadataTypes: ReadonlyArray<TypedDataField> = addDestinationField(
  StartrailRegistryUpdateSRRMetadataTypes
)

interface CollectionUpdateSRRMetadataRecord
  extends DestinationRecord,
    StartrailRegistryUpdateSRRMetadataRecord {}

const CollectionApproveSRRByCommitmentTypes: ReadonlyArray<TypedDataField> = addDestinationField(
  StartrailRegistryApproveSRRByCommitmentTypes
)

interface CollectionApproveSRRByCommitmentRecord
  extends DestinationRecord,
    StartrailRegistryApproveSRRByCommitmentRecord {}

const CollectionApproveSRRByCommitmentV2Types: ReadonlyArray<TypedDataField> = addDestinationField(
  StartrailRegistryApproveSRRByCommitmentV2Types
)

interface CollectionApproveSRRByCommitmentV2Record
  extends DestinationRecord,
    StartrailRegistryApproveSRRByCommitmentV2Record {}

const CollectionApproveSRRByCommitmentWithCustomHistoryIdTypes: ReadonlyArray<TypedDataField> = addDestinationField(
  StartrailRegistryApproveSRRByCommitmentWithCustomHistoryIdTypes
)

interface CollectionApproveSRRByCommitmentWithCustomHistoryIdRecord
  extends DestinationRecord,
    StartrailRegistryApproveSRRByCommitmentWithCustomHistoryIdRecord {}

const CollectionApproveSRRByCommitmentWithCustomHistoryIdV2Types: ReadonlyArray<TypedDataField> = addDestinationField(
  StartrailRegistryApproveSRRByCommitmentWithCustomHistoryIdV2Types
)

interface CollectionApproveSRRByCommitmentWithCustomHistoryIdV2Record
  extends DestinationRecord,
    StartrailRegistryApproveSRRByCommitmentWithCustomHistoryIdV2Record {}

const CollectionCancelSRRCommitmentTypes: ReadonlyArray<TypedDataField> = addDestinationField(
  StartrailRegistryCancelSRRCommitmentTypes
)

interface CollectionCancelSRRCommitmentRecord
  extends DestinationRecord,
    StartrailRegistryCancelSRRCommitmentRecord {}

const CollectionAddHistoryTypes: ReadonlyArray<TypedDataField> = addDestinationField(
  StartrailRegistryAddHistoryTypes
)

interface CollectionAddHistoryRecord
  extends DestinationRecord,
    StartrailRegistryAddHistoryRecord {}

const CollectionSetLockExternalTransferTypes: ReadonlyArray<TypedDataField> = addDestinationField(
  StartrailRegistrySetLockExternalTransferTypes
)

interface CollectionSetLockExternalTransferRecord
  extends DestinationRecord,
    StartrailRegistrySetLockExternalTransferRecord {}

const CollectionTransferFromWithProvenanceTypes: ReadonlyArray<TypedDataField> = addDestinationField(
  StartrailRegistryTransferFromWithProvenanceTypes
)

interface CollectionTransferFromWithProvenanceRecord
  extends DestinationRecord,
    StartrailRegistryTransferFromWithProvenanceRecord {}

const CollectionTransferFromWithProvenanceV2Types: ReadonlyArray<TypedDataField> = addDestinationField(
  StartrailRegistryTransferFromWithProvenanceV2Types
)

interface CollectionTransferFromWithProvenanceV2Record
  extends DestinationRecord,
    StartrailRegistryTransferFromWithProvenanceV2Record {}
//
// Collection message types (FOR TEMPORARY STUB ONLY - TO BE REMOVED)
//

const CreateCollectionTypes: ReadonlyArray<TypedDataField> = buildTypeList({
  erc721Symbol: 'string',
  metadataDigest: 'bytes32',
})

interface CreateCollection {
  erc721Symbol: string
  metadataDigest: Buffer | string
}

export {
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
  CollectionUpdateSRRRoyaltyRecord,
  CollectionUpdateSRRRoyaltyTypes,
  CollectionUpdateSRRRecord,
  CollectionUpdateSRRTypes,
  CreateCollection,
  CreateCollectionTypes,
}
