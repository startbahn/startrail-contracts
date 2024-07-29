import { log } from '@graphprotocol/graph-ts'

import {
  ApproveSRRByCommitmentWithProof as ApproveSRRByCommitmentWithProofEvent,
  ApproveSRRByCommitmentWithProof1 as ApproveSRRByCommitmentWithProofEventLegacy,
  BatchPrepared as BatchPreparedEvent,
  CreateSRRWithProof as CreateSRRWithProofEvent,
  CreateSRRWithProof1 as CreateSRRWithProofEventLegacy,
  TransferFromWithProvenanceWithProof as TransferFromWithProvenanceWithProofEvent,
  TransferFromWithProvenanceWithProof1 as TransferFromWithProvenanceWithProofEventLegacy,
} from '../generated/Bulk/Bulk'
import { Bulk } from '../generated/schema'
import { eventUTCMillis, logInvocation, toUTCString } from './lib/utils'
import { updateBulkInternal } from './lib/bulk-handlers'

export function handleBatchPrepared(event: BatchPreparedEvent): void {
  logInvocation('handleBatchPrepared', event)

  const merkleRoot = event.params.merkleRoot.toHex()
  let batch = Bulk.load(merkleRoot)
  if (batch) {
    log.info('already received this event for merkleRoot: {}', [
      event.params.merkleRoot.toString(),
    ])
    return
  }

  batch = new Bulk(merkleRoot)
  batch.merkleRoot = event.params.merkleRoot
  batch.sender = event.params.sender

  batch.createdAt = batch.updatedAt = eventUTCMillis(event)
  batch.createdAtStr = toUTCString(batch.createdAt)
  batch.updatedAtStr = toUTCString(batch.updatedAt)
  batch.save()
}

export function handleCreateSRRWithProof(event: CreateSRRWithProofEvent): void {
  logInvocation('handleCreateSRRWithProof', event)
  updateBulkInternal(
    event.params.merkleRoot,
    event.params.contractAddress,
    event.params.tokenId,
    event.params.leafHash,
    event,
    'CreateSRRWithProofEvent'
  )
}

export function handleCreateSRRWithProofLegacy(
  event: CreateSRRWithProofEventLegacy
): void {
  logInvocation('handleCreateSRRWithProofLegacy', event)
  updateBulkInternal(
    event.params.merkleRoot,
    null,
    event.params.tokenId,
    event.params.leafHash,
    event,
    'CreateSRRWithProofEventLegacy'
  )
}

export function handleApproveSRRByCommitmentWithProof(
  event: ApproveSRRByCommitmentWithProofEvent
): void {
  logInvocation('handleApproveSRRByCommitmentWithProof', event)
  updateBulkInternal(
    event.params.merkleRoot,
    event.params.contractAddress,
    event.params.tokenId,
    event.params.leafHash,
    event,
    'ApproveSRRByCommitmentWithProofEvent'
  )
}

export function handleApproveSRRByCommitmentWithProofLegacy(
  event: ApproveSRRByCommitmentWithProofEventLegacy
): void {
  logInvocation('handleApproveSRRByCommitmentWithProofLegacy', event)
  updateBulkInternal(
    event.params.merkleRoot,
    null,
    event.params.tokenId,
    event.params.leafHash,
    event,
    'ApproveSRRByCommitmentWithProofEventLegacy'
  )
}

export function handleTransferFromWithProvenanceWithProof(
  event: TransferFromWithProvenanceWithProofEvent
): void {
  logInvocation('handleTransferFromWithProvenanceWithProof', event)

  updateBulkInternal(
    event.params.merkleRoot,
    event.params.contractAddress,
    event.params.tokenId,
    event.params.leafHash,
    event,
    'TransferFromWithProvenanceWithProofEvent'
  )
}

export function handleTransferFromWithProvenanceWithProofLegacy(
  event: TransferFromWithProvenanceWithProofEventLegacy
): void {
  logInvocation('handleTransferFromWithProvenanceWithProofLegacy', event)

  updateBulkInternal(
    event.params.merkleRoot,
    null,
    event.params.tokenId,
    event.params.leafHash,
    event,
    'TransferFromWithProvenanceWithProofLegacy'
  )
}
