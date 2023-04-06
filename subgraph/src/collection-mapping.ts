import { log } from '@graphprotocol/graph-ts'

import { Collection, SRR } from '../generated/schema'
import {
  CreateSRR as CreateSRREvent,
  OwnershipTransferred as OwnershipTransferredEvent,
  SRRCommitment as SRRCommitmentEvent,
  SRRCommitment1 as SRRCommitmentWithCustomHistoryEvent,
  UpdateSRR as UpdateSRREvent,
} from '../generated/templates/Collection/CollectionProxyFeaturesAggregate'
import {
  handleLockExternalTransfer,
  handleRoyaltiesSet,
  handleSRRCommitmentCancelled,
  handleSRRCommitmentInternal,
  handleSRRProvenanceWithCustomHistoryAndIntermediary,
  handleSRRProvenanceWithIntermediary,
  handleTransfer,
  handleUpdateSRRInternal,
  handleUpdateSRRMetadataWithCid,
  handleUpdateSRRWithSender,
  saveCreateSRRInternal,
} from './lib/srr-handlers'
import {
  eventUTCMillis,
  logInvocation,
  srrEntityId,
  toUTCString,
} from './lib/utils'

// reexport handlers
export {
  handleLockExternalTransfer,
  handleSRRCommitmentCancelled,
  handleSRRProvenanceWithCustomHistoryAndIntermediary,
  handleSRRProvenanceWithIntermediary,
  handleUpdateSRRWithSender,
  handleRoyaltiesSet,
  handleTransfer,
  handleUpdateSRRMetadataWithCid,
}

export function handleCreateSRR(event: CreateSRREvent): void {
  logInvocation('handleCreateSRR', event)

  let timestampMillis = eventUTCMillis(event)
  let srrId = srrEntityId(event.address, event.params.tokenId)
  let srr = SRR.load(srrId)
  if (!srr) {
    log.error('received CreateSRR on collection event but srr not found: {}', [
      srrId,
    ])
    return
  }

  let collectionAddress = event.address.toHex()
  srr.collection = collectionAddress

  saveCreateSRRInternal(
    srr,
    event.params.registryRecord.isPrimaryIssuer,
    event.params.registryRecord.artistAddress,
    event.params.registryRecord.issuer,
    event.params.metadataCID,
    event.params.lockExternalTransfer,
    timestampMillis,
    event
  )
}

export function handleUpdateSRR(event: UpdateSRREvent): void {
  logInvocation('handleUpdateSRR', event)
  handleUpdateSRRInternal(
    eventUTCMillis(event),
    event.params.isPrimaryIssuer,
    event.params.artistAddress,
    srrEntityId(event.address, event.params.tokenId)
  )
}

export function handleSRRCommitment(event: SRRCommitmentEvent): void {
  logInvocation('handleSRRCommitment', event)
  let params = event.params
  handleSRRCommitmentInternal(
    eventUTCMillis(event),
    params.commitment,
    srrEntityId(event.address, params.tokenId),
    null
  )
}

export function handleSRRCommitmentWithCustomHistory(
  event: SRRCommitmentWithCustomHistoryEvent
): void {
  logInvocation('handleSRRCommitmentWithCustomHistory', event)
  let params = event.params
  handleSRRCommitmentInternal(
    eventUTCMillis(event),
    params.commitment,
    srrEntityId(event.address, params.tokenId),
    params.customHistoryId
  )
}

export function handleOwnershipTransferred(
  event: OwnershipTransferredEvent
): void {
  logInvocation('handleOwnershipTransferred', event)

  let collectionAddress = event.address.toHex()
  let collection = Collection.load(collectionAddress)
  if (!collection) {
    log.error('received event for unknown Collection: {}', [collectionAddress])
    return
  }

  collection.ownerAddress = event.params.newOwner
  collection.updatedAt = eventUTCMillis(event)
  collection.updatedAtStr = toUTCString(collection.updatedAt)
  collection.save()
}
