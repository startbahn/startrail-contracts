import { ByteArray, crypto, log } from '@graphprotocol/graph-ts'

import { SRR, SRRProvenance } from '../../generated/schema'
import {
  CreateCustomHistoryFromMigration as CustomHistoryCreatedFromMigrationEvent,
  CreateSRRFromMigration as CreateSRRFromMigrationEvent,
  MigrateSRR as MigrateSRREvent,
  ProvenanceDateMigrationFix as ProvenanceDateMigrationFixEvent,
  ProvenanceFromMigration as SRRProvenanceFromMigrationEvent,
  ProvenanceFromMigration1 as SRRProvenanceWithCustomHistoryFromMigrationEvent,
  SRRCommitmentCancelledFromMigration as SRRCommitmentCancelledFromMigrationEvent,
  SRRCommitmentFromMigration as SRRCommitmentFromMigrationEvent,
  SRRCommitmentFromMigration1 as SRRCommitmentWithCustomHistoryFromMigrationEvent,
  TransferFromMigration as TransferFromMigrationEvent,
  UpdateSRRFromMigration as UpdateSRRFromMigrationEvent,
  UpdateSRRMetadataDigestFromMigration as UpdateSRRMetadataDigestFromMigrationEvent,
} from '../../generated/StartrailRegistry/StartrailRegistry'
import {
  checkAndClearCommitOnTransfer,
  handleCreateCustomHistoryInternal,
  handleSRRCommitmentCancelledInternal,
  handleSRRCommitmentInternal,
  handleSRRProvenanceInternal,
  handleUpdateSRRInternal,
  handleUpdateSRRMetadataHashInternal,
  saveCreateSRRInternal,
} from './srr-handlers'
import {
  currentChainId,
  logInvocation,
  secondsToMillis,
  srrEntityId,
  toUTCString,
  ZERO_ADDRESS,
} from './utils'

/*
 * This module contains handlers related to the Ethereum mainnet to Polygon
 * token migration.
 *
 * A number of events specific to Migration were emitted with details of
 * the origin chain and timestamps etc. These handlers consume those and update
 * the subgraph appropriately.
 *
 * See notion page for details:
 * https://www.notion.so/startbahn/Token-Migration-from-Mainnet-to-Polygon-81c30f0393c24fa4b199c0d33f8020c1
 */

export function handleTransferFromMigration(
  event: TransferFromMigrationEvent
): void {
  logInvocation('handleTransferFromMigration', event)
  let originTimestampMillis = secondsToMillis(event.params.originTimestamp)

  let srrId = srrEntityId(event.address, event.params.tokenId)
  let srr = SRR.load(srrId)

  // In the normal case where a Transfer is emitted before a CreateSRR.
  // However due to a Mainnet migration in Oct 2020 sometimes this order is
  // flipped. So we handle this case here by creating the entity.
  if (!srr) {
    srr = new SRR(srrId)
    srr.tokenId = event.params.tokenId.toString()
    srr.createdAt = originTimestampMillis
    srr.createdAtStr = toUTCString(srr.createdAt)
    srr.originChain = currentChainId()
    srr.originTxHash = event.params.originTxHash
  }

  if (event.params.from.toHex() != ZERO_ADDRESS.toHex()) {
    checkAndClearCommitOnTransfer(srr, originTimestampMillis)
  }

  srr.ownerAddress = event.params.to
  srr.updatedAt = originTimestampMillis
  srr.updatedAtStr = toUTCString(srr.updatedAt)

  srr.save()
}

export function handleCreateSRRFromMigration(
  event: CreateSRRFromMigrationEvent
): void {
  logInvocation('handleCreateSRRFromMigration', event)

  let timestampMillis = secondsToMillis(event.params.originTimestamp)
  let srrId = srrEntityId(event.address, event.params.tokenId)
  let srr = SRR.load(srrId)

  // In the normal case where a Transfer is emitted before a CreateSRR.
  // However due to a Mainnet migration in Oct 2020 sometimes this order is
  // flipped. So we handle this case here by creating the entity.
  if (!srr) {
    srr = new SRR(srrId)
    srr.tokenId = event.params.tokenId.toString()
    srr.createdAt = timestampMillis
    srr.createdAtStr = toUTCString(srr.createdAt)
    srr.originTxHash = event.params.originTxHash
  }

  saveCreateSRRInternal(
    srr,
    event.params.registryRecord.isPrimaryIssuer,
    event.params.registryRecord.artistAddress,
    event.params.registryRecord.issuer,
    event.params.metadataDigest.toHex(),
    false,
    timestampMillis,
    event
  )
}

export function handleMigrateSRR(event: MigrateSRREvent): void {
  logInvocation('handleMigrateSRR', event)
  let srrId = srrEntityId(event.address, event.params.tokenId)
  let srr = SRR.load(srrId)
  if (srr) {
    srr.originChain = event.params.originChain
    srr.save()
  }
}

export function handleSRRCommitmentFromMigration(
  event: SRRCommitmentFromMigrationEvent
): void {
  logInvocation('handleSRRCommitmentFromMigration', event)
  let params = event.params
  handleSRRCommitmentInternal(
    secondsToMillis(event.params.originTimestamp),
    params.commitment,
    srrEntityId(event.address, params.tokenId),
    null
  )
}

export function handleSRRCommitmentWithCustomHistoryFromMigration(
  event: SRRCommitmentWithCustomHistoryFromMigrationEvent
): void {
  logInvocation('handleSRRCommitmentWithCustomHistoryFromMigration', event)
  let params = event.params
  handleSRRCommitmentInternal(
    secondsToMillis(event.params.originTimestamp),
    params.commitment,
    srrEntityId(event.address, params.tokenId),
    params.customHistoryId
  )
}

export function handleSRRProvenanceFromMigration(
  event: SRRProvenanceFromMigrationEvent
): void {
  logInvocation('handleSRRProvenanceFromMigration', event)
  let params = event.params
  handleSRRProvenanceInternal(
    secondsToMillis(event.params.originTimestamp),
    srrEntityId(event.address, params.tokenId),
    params.from,
    params.to,
    null,
    params.historyMetadataDigest,
    params.historyMetadataURI,
    false
  )
}

export function handleSRRProvenanceWithCustomHistoryFromMigration(
  event: SRRProvenanceWithCustomHistoryFromMigrationEvent
): void {
  logInvocation('handleSRRProvenanceWithCustomHistoryFromMigration', event)
  let params = event.params
  handleSRRProvenanceInternal(
    secondsToMillis(event.params.originTimestamp),
    srrEntityId(event.address, params.tokenId),
    params.from,
    params.to,
    params.customHistoryId,
    params.historyMetadataDigest,
    params.historyMetadataURI,
    false
  )
}
export function handleSRRCommitmentCancelledFromMigration(
  event: SRRCommitmentCancelledFromMigrationEvent
): void {
  logInvocation('handleSRRCommitmentCancelledFromMigration', event)
  handleSRRCommitmentCancelledInternal(
    secondsToMillis(event.params.originTimestamp),
    srrEntityId(event.address, event.params.tokenId)
  )
}
export function handleCreateCustomHistoryFromMigration(
  event: CustomHistoryCreatedFromMigrationEvent
): void {
  logInvocation('handleCreateCustomHistoryFromMigration', event)
  handleCreateCustomHistoryInternal(
    secondsToMillis(event.params.originTimestamp),
    event.params.id,
    event.params.name,
    event.params.customHistoryTypeId,
    event.params.metadataDigest.toHex(),
    event.params.originChain,
    event.params.originTxHash
  )
}

export function handleUpdateSRRFromMigration(
  event: UpdateSRRFromMigrationEvent
): void {
  logInvocation('handleUpdateSRRFromMigration', event)
  handleUpdateSRRInternal(
    secondsToMillis(event.params.originTimestamp),
    event.params.registryRecord.isPrimaryIssuer,
    event.params.registryRecord.artistAddress,
    srrEntityId(event.address, event.params.tokenId)
  )
}

export function handleUpdateSRRMetadataDigestFromMigration(
  event: UpdateSRRMetadataDigestFromMigrationEvent
): void {
  logInvocation('handleUpdateSRRMetadataDigestFromMigration', event)
  handleUpdateSRRMetadataHashInternal(
    secondsToMillis(event.params.originTimestamp),
    srrEntityId(event.address, event.params.tokenId),
    event.params.metadataDigest.toHex(),
    event
  )
}

/**
 * This event patched an issue that resulted in bad timestamps from the
 * migration.
 *
 * See details in
 * https://www.notion.so/startbahn/Provenance-Migration-Dates-Fix-65eeecfa2cc144b59243957dccc3997d
 */
export function handleProvenanceDateMigrationFix(
  event: ProvenanceDateMigrationFixEvent
): void {
  logInvocation('handleProvenanceDateMigrationFix', event)
  let srrId = srrEntityId(event.address, event.params.tokenId)
  let provenanceId = crypto
    .keccak256(ByteArray.fromUTF8(srrId + '66000'))
    .toHex()
  let prov = SRRProvenance.load(provenanceId)
  if (!prov) {
    log.error('received fix event but provenance not found: {}', [provenanceId])
    return
  }
  prov.createdAt = event.params.originTimestamp
  prov.createdAtStr = toUTCString(prov.createdAt)
  prov.timestamp = event.params.originTimestamp
  prov.save()
}
