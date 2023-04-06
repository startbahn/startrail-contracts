import { TypedDataField } from '@ethersproject/abstract-signer'

import { buildTypeList } from './helpers'
import {
  StartrailRegistryAddHistoryRecord,
  StartrailRegistryAddHistoryTypes,
  StartrailRegistryApproveSRRByCommitmentV2Record,
  StartrailRegistryApproveSRRByCommitmentV2Types,
  StartrailRegistryApproveSRRByCommitmentWithCustomHistoryIdV2Record,
  StartrailRegistryApproveSRRByCommitmentWithCustomHistoryIdV2Types,
  StartrailRegistryCancelSRRCommitmentRecord,
  StartrailRegistryCancelSRRCommitmentTypes,
  StartrailRegistrySetLockExternalTransferRecord,
  StartrailRegistrySetLockExternalTransferTypes,
  StartrailRegistryTransferFromWithProvenanceV2Record,
  StartrailRegistryTransferFromWithProvenanceV2Types,
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
    royaltyBasisPoints: 'uint16',
  })
)

interface CollectionCreateSRRRecord extends DestinationRecord {
  isPrimaryIssuer: boolean
  artistAddress: string
  metadataCID: string
  lockExternalTransfer: boolean
  to: string
  royaltyReceiver: string
  royaltyBasisPoints: number
}

const CollectionTransferOwnershipTypes: ReadonlyArray<TypedDataField> = addDestinationField(
  buildTypeList({
    newOwner: 'address',
  })
)

interface CollectionTransferOwnershipRecord extends DestinationRecord {
  newOwner: string
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

const CollectionApproveSRRByCommitmentV2Types: ReadonlyArray<TypedDataField> = addDestinationField(
  StartrailRegistryApproveSRRByCommitmentV2Types
)

interface CollectionApproveSRRByCommitmentV2Record
  extends DestinationRecord,
    StartrailRegistryApproveSRRByCommitmentV2Record {}

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

const CollectionTransferFromWithProvenanceV2Types: ReadonlyArray<TypedDataField> = addDestinationField(
  StartrailRegistryTransferFromWithProvenanceV2Types
)

interface CollectionTransferFromWithProvenanceV2Record
  extends DestinationRecord,
    StartrailRegistryTransferFromWithProvenanceV2Record {}

export {
  CollectionAddHistoryRecord,
  CollectionAddHistoryTypes,
  CollectionApproveSRRByCommitmentV2Record,
  CollectionApproveSRRByCommitmentV2Types,
  CollectionApproveSRRByCommitmentWithCustomHistoryIdV2Record,
  CollectionApproveSRRByCommitmentWithCustomHistoryIdV2Types,
  CollectionCancelSRRCommitmentRecord,
  CollectionCancelSRRCommitmentTypes,
  CollectionCreateSRRRecord,
  CollectionCreateSRRTypes,
  CollectionSetLockExternalTransferRecord,
  CollectionSetLockExternalTransferTypes,
  CollectionTransferFromWithProvenanceV2Record,
  CollectionTransferFromWithProvenanceV2Types,
  CollectionTransferOwnershipRecord,
  CollectionTransferOwnershipTypes,
  CollectionUpdateSRRMetadataWithCidRecord,
  CollectionUpdateSRRMetadataWithCidTypes,
  CollectionUpdateSRRRoyaltyRecord,
  CollectionUpdateSRRRoyaltyTypes,
  CollectionUpdateSRRRecord,
  CollectionUpdateSRRTypes,
}
