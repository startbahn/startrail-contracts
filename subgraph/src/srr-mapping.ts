import { CustomHistoryType, SRR } from '../generated/schema'
import {
  CreateCustomHistory as CustomHistoryCreatedWithCIDEvent,
  CreateCustomHistory1 as CustomHistoryCreatedEvent,
  CreateCustomHistoryType as CustomHistoryTypeCreatedEvent,
  CreateSRR as CreateSRRWithCIDEvent,
  CreateSRR1 as CreateSRREventLegacy,
  CreateSRR2 as CreateSRRWithLockExternalTransferEvent,
  Provenance2 as SRRProvenanceEventLegacy,
  Provenance3 as SRRProvenanceWithCustomHistoryEventLegacy,
  SRRCommitment as SRRCommitmentEvent,
  SRRCommitment1 as SRRCommitmentWithCustomHistoryEvent,
  UpdateCustomHistory as CustomHistoryUpdatedWithCIDEvent,
  UpdateCustomHistory1 as CustomHistoryUpdatedEvent,
  UpdateSRR1 as UpdateSRREvent,
  UpdateSRRMetadataDigest1 as UpdateSRRMetadataDigestEvent,
} from '../generated/StartrailRegistry/StartrailRegistry'
import {
  handleCreateCustomHistoryInternal,
  handleLockExternalTransfer,
  handleRoyaltiesSet,
  handleSRRCommitmentCancelled,
  handleSRRCommitmentInternal,
  handleSRRHistory,
  handleSRRProvenanceInternal,
  handleSRRProvenanceWithCustomHistoryAndIntermediary,
  handleSRRProvenanceWithIntermediary,
  handleTransfer,
  handleUpdateCustomHistoryInternal,
  handleUpdateSRRInternal,
  handleUpdateSRRMetadataDigestInternal,
  handleUpdateSRRMetadataWithCid,
  handleUpdateSRRWithSender,
  saveCreateSRRInternal,
} from './lib/srr-handlers'
import {
  handleCreateCustomHistoryFromMigration,
  handleCreateSRRFromMigration,
  handleMigrateSRR,
  handleProvenanceDateMigrationFix,
  handleSRRCommitmentCancelledFromMigration,
  handleSRRCommitmentFromMigration,
  handleSRRCommitmentWithCustomHistoryFromMigration,
  handleSRRProvenanceFromMigration,
  handleSRRProvenanceWithCustomHistoryFromMigration,
  handleTransferFromMigration,
  handleUpdateSRRFromMigration,
  handleUpdateSRRMetadataDigestFromMigration,
} from './lib/srr-migration-handlers'
import {
  currentChainId,
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
  handleRoyaltiesSet,
  handleTransfer,
  handleUpdateSRRMetadataWithCid,
  handleUpdateSRRWithSender,
  handleSRRHistory,

  // Migration handlers
  handleCreateCustomHistoryFromMigration,
  handleCreateSRRFromMigration,
  handleMigrateSRR,
  handleProvenanceDateMigrationFix,
  handleSRRCommitmentFromMigration,
  handleSRRCommitmentWithCustomHistoryFromMigration,
  handleSRRProvenanceFromMigration,
  handleSRRProvenanceWithCustomHistoryFromMigration,
  handleTransferFromMigration,
  handleUpdateSRRFromMigration,
  handleUpdateSRRMetadataDigestFromMigration,
  handleSRRCommitmentCancelledFromMigration,
}

export function handleCreateSRR(event: CreateSRREventLegacy): void {
  logInvocation('handleCreateSRR', event)

  let timestampMillis = eventUTCMillis(event)
  let srrId = srrEntityId(event.address, event.params.tokenId)
  let srr = SRR.load(srrId)

  saveCreateSRRInternal(
    srr as SRR,
    event.params.registryRecord.isPrimaryIssuer,
    event.params.registryRecord.artistAddress,
    event.params.registryRecord.issuer,
    event.params.metadataDigest.toHex(),
    false,
    timestampMillis,
    event
  )
}

export function handleCreateSRRWithLockExternalTransfer(
  event: CreateSRRWithLockExternalTransferEvent
): void {
  logInvocation('handleCreateSRRWithLockExternalTransfer', event)

  let timestampMillis = eventUTCMillis(event)
  let srrId = srrEntityId(event.address, event.params.tokenId)
  let srr = SRR.load(srrId)

  saveCreateSRRInternal(
    srr as SRR,
    event.params.registryRecord.isPrimaryIssuer,
    event.params.registryRecord.artistAddress,
    event.params.registryRecord.issuer,
    event.params.metadataDigest.toHex(),
    event.params.lockExternalTransfer,
    timestampMillis,
    event
  )
}

export function handleCreateSRRWithCID(event: CreateSRRWithCIDEvent): void {
  logInvocation('handleCreateSRRWithCID', event)

  let timestampMillis = eventUTCMillis(event)
  let srrId = srrEntityId(event.address, event.params.tokenId)
  let srr = SRR.load(srrId)

  saveCreateSRRInternal(
    srr as SRR,
    event.params.registryRecord.isPrimaryIssuer,
    event.params.registryRecord.artistAddress,
    event.params.registryRecord.issuer,
    event.params.metadataCID,
    event.params.lockExternalTransfer,
    timestampMillis,
    event
  )
}

export function handleSRRProvenance(event: SRRProvenanceEventLegacy): void {
  logInvocation('handleSRRProvenance', event)
  let params = event.params
  handleSRRProvenanceInternal(
    eventUTCMillis(event),
    srrEntityId(event.address, params.tokenId),
    params.from,
    params.to,
    null,
    params.historyMetadataHash,
    params.historyMetadataURI,
    false
  )
}

export function handleSRRProvenanceWithCustomHistory(
  event: SRRProvenanceWithCustomHistoryEventLegacy
): void {
  logInvocation('handleSRRProvenanceWithCustomHistory', event)
  let params = event.params
  handleSRRProvenanceInternal(
    eventUTCMillis(event),
    srrEntityId(event.address, params.tokenId),
    params.from,
    params.to,
    params.customHistoryId,
    params.historyMetadataHash,
    params.historyMetadataURI,
    false
  )
}

export function handleCustomHistoryType(
  event: CustomHistoryTypeCreatedEvent
): void {
  logInvocation('handleCustomHistoryType', event)

  let id = event.params.id.toString()

  let cht = new CustomHistoryType(id)
  cht.name = event.params.historyType
  cht.createdAt = eventUTCMillis(event)
  cht.createdAtStr = toUTCString(cht.createdAt)

  cht.save()
}

export function handleUpdateCustomHistory(
  event: CustomHistoryUpdatedEvent
): void {
  logInvocation('handleUpdateCustomHistory', event)
  let now = eventUTCMillis(event)
  handleUpdateCustomHistoryInternal(
    event.params.id.toString(),
    now,
    event.params.metadataDigest.toHex(),
    event.params.name
  )
}

export function handleUpdateCustomHistoryWithCID(
  event: CustomHistoryUpdatedWithCIDEvent
): void {
  logInvocation('handleUpdateCustomHistoryWithCID', event)
  let now = eventUTCMillis(event)
  handleUpdateCustomHistoryInternal(
    event.params.id.toString(),
    now,
    event.params.metadataCID,
    event.params.name
  )
}

export function handleCreateCustomHistory(
  event: CustomHistoryCreatedEvent
): void {
  logInvocation('handleCreateCustomHistory', event)
  handleCreateCustomHistoryInternal(
    eventUTCMillis(event),
    event.params.id,
    event.params.name,
    event.params.customHistoryTypeId,
    event.params.metadataDigest.toHex(),
    currentChainId(),
    event.transaction.hash
  )
}

export function handleCreateCustomHistoryWithCid(
  event: CustomHistoryCreatedWithCIDEvent
): void {
  logInvocation('handleCreateCustomHistory', event)
  handleCreateCustomHistoryInternal(
    eventUTCMillis(event),
    event.params.id,
    event.params.name,
    event.params.customHistoryTypeId,
    event.params.metadataCID,
    currentChainId(),
    event.transaction.hash
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

export function handleUpdateSRR(event: UpdateSRREvent): void {
  logInvocation('handleUpdateSRR', event)
  handleUpdateSRRInternal(
    eventUTCMillis(event),
    event.params.registryRecord.isPrimaryIssuer,
    event.params.registryRecord.artistAddress,
    srrEntityId(event.address, event.params.tokenId)
  )
}

export function handleUpdateSRRMetadataDigest(
  event: UpdateSRRMetadataDigestEvent
): void {
  logInvocation('handleUpdateSRRMetadataDigest', event)
  handleUpdateSRRMetadataDigestInternal(
    eventUTCMillis(event),
    srrEntityId(event.address, event.params.tokenId),
    event.params.metadataDigest.toHex(),
    event
  )
}
