import {
  Address,
  BigInt,
  ByteArray,
  Bytes,
  crypto,
  ethereum,
  log,
} from '@graphprotocol/graph-ts'

import {
  CustomHistory,
  CustomHistoryMetadataHistory,
  LicensedUserWallet,
  SRR,
  SRRHistory,
  SRRMetadataHistory,
  SRRProvenance,
  SRRTransferCommit,
} from '../../generated/schema'
import {
  History as SRRHistoryEvent,
  LockExternalTransfer as LockExternalTransferEvent,
  Provenance as SRRProvenanceWithIntermediaryEvent,
  Provenance1 as SRRProvenanceWithCustomHistoryAndIntermediaryEvent,
  RoyaltiesSet as RoyaltiesSetEvent,
  SRRCommitmentCancelled as SRRCommitmentCancelledEvent,
  Transfer as TransferEvent,
  UpdateSRR as UpdateSRRWithSenderEvent,
  UpdateSRRMetadataDigest as UpdateSRRMetadataWithCIDEvent,
} from '../../generated/StartrailRegistry/StartrailRegistry'
import {
  currentChainId,
  eventUTCMillis,
  logInvocation,
  srrEntityId,
  toUTCString,
  ZERO_ADDRESS,
} from './utils'

/*
 * This module contains shared handlers and shared functions related to SRR
 * events from both the StartrailRegistry and the Collection contracts.
 */

/*============================================================================
 *
 * Handlers - Complete
 *
 *==========================================================================*/

export function handleTransfer(event: TransferEvent): void {
  logInvocation('handleTransfer', event)

  let timestampMillis = eventUTCMillis(event)
  let isMint = event.params.from.toHex() == ZERO_ADDRESS.toHex()

  let srrId = srrEntityId(event.address, event.params.tokenId)
  let srr = SRR.load(srrId)
  if (!srr) {
    srr = new SRR(srrId)
    srr.tokenId = event.params.tokenId.toString()
    srr.lockExternalTransfer = false

    srr.originChain = currentChainId()
    srr.originTxHash = event.transaction.hash

    if (isMint === true) {
      srr.createdAt = timestampMillis
      srr.createdAtStr = toUTCString(srr.createdAt)
    }
  }
  srr.ownerAddress = event.params.to
  srr.updatedAt = timestampMillis
  srr.updatedAtStr = toUTCString(srr.updatedAt)
  srr.save()

  if (isMint === false) {
    handleSRRProvenanceInternal(
      timestampMillis,
      srrId,
      event.params.from,
      event.params.to,
      null,
      null,
      null,
      false
    )
    checkAndClearCommitOnTransfer(srr, timestampMillis)
    srr.save()
  }
}

export function handleUpdateSRRWithSender(
  event: UpdateSRRWithSenderEvent
): void {
  logInvocation('handleUpdateSRRWithSender', event)
  handleUpdateSRRInternal(
    eventUTCMillis(event),
    event.params.isPrimaryIssuer,
    event.params.artistAddress,
    srrEntityId(event.address, event.params.tokenId)
  )
}

export function handleUpdateSRRMetadataWithCid(
  event: UpdateSRRMetadataWithCIDEvent
): void {
  logInvocation('handleUpdateSRRMetadataDigest', event)
  handleUpdateSRRMetadataDigestInternal(
    eventUTCMillis(event),
    srrEntityId(event.address, event.params.tokenId),
    event.params.metadataCID,
    event
  )
}

export function handleSRRCommitmentCancelled(
  event: SRRCommitmentCancelledEvent
): void {
  logInvocation('handleSRRCommitmentCancelled', event)
  handleSRRCommitmentCancelledInternal(
    eventUTCMillis(event),
    srrEntityId(event.address, event.params.tokenId)
  )
}

export function handleSRRProvenanceWithIntermediary(
  event: SRRProvenanceWithIntermediaryEvent
): void {
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
    params.isIntermediary
  )
}

export function handleSRRProvenanceWithCustomHistoryAndIntermediary(
  event: SRRProvenanceWithCustomHistoryAndIntermediaryEvent
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
    params.isIntermediary
  )
}

export function handleLockExternalTransfer(
  event: LockExternalTransferEvent
): void {
  logInvocation('handleLockExternalTransfer', event)
  let srrId = srrEntityId(event.address, event.params.tokenId)
  let srr = SRR.load(srrId)
  if (!srr) {
    log.error('received lock external transfer event but srr not found: {}', [
      srrId,
    ])
    return
  }
  srr.lockExternalTransfer = event.params.flag
  srr.save()
}

export function handleRoyaltiesSet(event: RoyaltiesSetEvent): void {
  logInvocation('handleRoyaltiesSet', event)
  let srrId = srrEntityId(event.address, event.params.tokenId)
  const srr = SRR.load(srrId)
  if (!srr) {
    log.error('received royalties set event but srr not found: {}', [srrId])
    return
  }

  const timestampMillis = eventUTCMillis(event)

  srr.updatedAt = timestampMillis
  srr.updatedAtStr = toUTCString(srr.updatedAt)

  const royalty = event.params.royalty
  srr.royaltyBasisPoints = royalty.basisPoints
  srr.royaltyReceiver = royalty.receiver

  srr.save()
}

export function handleSRRHistory(event: SRRHistoryEvent): void {
  logInvocation('handleSRRHistory', event)

  let tokenIds: BigInt[] = event.params.tokenIds
  let customHistoryIds: BigInt[] = event.params.customHistoryIds

  // NOTE: Sonarlint complains about not using forof loop here.
  // However assemblyscript does not support iterators (for-of) or closures
  // (required for Array forEach) so we use the old school for loop here.
  // Also seems sonar does not support supressing warnings with the default
  // setup..?
  for (let tokenIdsIdx = 0; tokenIdsIdx < tokenIds.length; tokenIdsIdx++) {
    let srrId = srrEntityId(event.address, tokenIds[tokenIdsIdx])
    for (
      let customHistoryIdsIdx = 0;
      customHistoryIdsIdx < customHistoryIds.length;
      customHistoryIdsIdx++
    ) {
      let customHistoryId = customHistoryIds[customHistoryIdsIdx].toString()
      let historyId = crypto
        .keccak256(ByteArray.fromUTF8(srrId + customHistoryId))
        .toHex()
      let history = new SRRHistory(historyId)
      history.srr = srrId
      history.customHistory = customHistoryId.toString()
      history.createdAt = eventUTCMillis(event)
      history.createdAtStr = toUTCString(history.createdAt)
      history.save()
    }
  }
}

/*============================================================================
 *
 * Handlers - Partial / Shared Logic
 *
 *==========================================================================*/

/**
 * Can't use a union type to handle the 2 Provenance events with one function.
 *
 * So this function exists to handle both with a superset of the
 * available parameters.
 */
export function handleSRRProvenanceInternal(
  eventTimestampMillis: BigInt,
  srrEntityId: string,
  from: Address,
  to: Address,
  customHistoryId: BigInt | null,
  historyMetadataHash: string | null,
  historyMetadataURI: string | null,
  isIntermediary: boolean
): void {
  let srr = SRR.load(srrEntityId)
  if (!srr) {
    log.error('received event for unknown SRR: {}', [srrEntityId])
    return
  }

  // Update existing SRR
  srr.ownerAddress = to
  srr.updatedAt = eventTimestampMillis
  srr.updatedAtStr = toUTCString(srr.updatedAt)
  srr.save()

  // Create new Provenance if we can't find srrProvenance with provenanceId.
  // This is because we need to create a provenance entity even if the transfer event is emitted to be compatible with opensea.
  let provenanceId = crypto
    .keccak256(
      ByteArray.fromUTF8(srrEntityId + eventTimestampMillis.toString())
    )
    .toHex()
  let provenance = SRRProvenance.load(provenanceId)
  if (!provenance) {
    provenance = new SRRProvenance(provenanceId)

    provenance.srr = srr.id
    provenance.from = from
    provenance.to = to

    if (historyMetadataHash) {
      // isHexString
      if (historyMetadataHash.length == 64) {
        provenance.metadataDigest =
          Bytes.fromHexString(historyMetadataHash).toHex()
      } else {
        provenance.metadataDigest = historyMetadataHash
      }
    } else {
      provenance.metadataDigest = ''
    }

    if (historyMetadataURI) {
      provenance.metadataURI = historyMetadataURI
    } else {
      provenance.metadataURI = ''
    }

    if (customHistoryId) {
      // CustomHistory.load(event.params.customHistoryId)
      provenance.customHistory = customHistoryId.toString()
    }
    provenance.isIntermediary = isIntermediary

    provenance.timestamp = eventTimestampMillis
    provenance.createdAt = eventTimestampMillis
    provenance.createdAtStr = toUTCString(provenance.createdAt)

    provenance.save()
  }
}

export function handleSRRCommitmentInternal(
  eventTimestampMillis: BigInt,
  commitment: Bytes,
  srrEntityId: string,
  customHistoryId: BigInt | null
): void {
  let srr = SRR.load(srrEntityId)
  if (!srr) {
    log.error('received event for unknown SRR: {}', [srrEntityId])
    return
  }

  log.info('SRRCommitment commitment = {}', [commitment.toHex()])

  srr.transferCommitment = commitment
  srr.updatedAt = eventTimestampMillis
  srr.updatedAtStr = toUTCString(srr.updatedAt)
  srr.save()

  let srrCommit = SRRTransferCommit.load(srrEntityId)
  if (!srrCommit) {
    srrCommit = new SRRTransferCommit(srrEntityId)
    srrCommit.createdAt = eventTimestampMillis
    srrCommit.createdAtStr = toUTCString(srrCommit.createdAt)
  }

  srrCommit.commitment = srr.transferCommitment
  srrCommit.lastAction = 'approve'

  if (customHistoryId) {
    srrCommit.customHistory = customHistoryId.toString()
  }

  srrCommit.updatedAt = eventTimestampMillis
  srrCommit.updatedAtStr = toUTCString(srrCommit.updatedAt)
  srrCommit.save()
}

export function handleCreateCustomHistoryInternal(
  eventTimestampMillis: BigInt,
  id: BigInt,
  name: string,
  customHistoryTypeId: BigInt,
  metadataDigest: string,
  originChain: string,
  originTxHash: Bytes
): void {
  let ch = new CustomHistory(id.toString())
  ch.name = name
  ch.historyType = customHistoryTypeId.toString()
  ch.metadataDigest = metadataDigest
  ch.originChain = originChain
  ch.originTxHash = originTxHash
  ch.createdAt = eventTimestampMillis
  ch.createdAtStr = toUTCString(ch.createdAt)
  ch.updatedAt = eventTimestampMillis
  ch.updatedAtStr = toUTCString(ch.updatedAt)
  ch.save()
}

export function handleUpdateCustomHistoryInternal(
  customHistoryId: string,
  now: BigInt,
  metadataDigest: string,
  name: string
): void {
  let ch = CustomHistory.load(customHistoryId)
  if (!ch) {
    log.error('received event for unknown CustomHistory: {}', [customHistoryId])
    return
  }

  let id = crypto
    .keccak256(ByteArray.fromUTF8(ch.metadataDigest + now.toString()))
    .toHex()

  let chMh = new CustomHistoryMetadataHistory(id)
  chMh.metadataDigest = ch.metadataDigest
  chMh.name = ch.name
  chMh.customHistory = customHistoryId
  chMh.createdAt = now
  chMh.createdAtStr = toUTCString(chMh.createdAt)

  ch.metadataDigest = metadataDigest
  ch.name = name
  ch.updatedAt = now
  ch.updatedAtStr = toUTCString(ch.updatedAt)

  chMh.save()
  ch.save()
}

export function handleUpdateSRRInternal(
  eventTimestampMillis: BigInt,
  isPrimaryIssuer: boolean,
  artistAddress: Address,
  srrEntityId: string
): void {
  let srr = SRR.load(srrEntityId)
  if (!srr) {
    log.error('received event for unknown SRR: {}', [srrEntityId])
    return
  }

  const artist = getLicensedUserIdFromAddress(artistAddress)
  if (!artist) {
    log.error('received event for unknown SRR artist address: {}', [
      artistAddress.toHex(),
    ])
    return
  }

  srr.isPrimaryIssuer = isPrimaryIssuer
  srr.artistAddress = artistAddress
  srr.artist = artist
  srr.updatedAt = eventTimestampMillis
  srr.updatedAtStr = toUTCString(srr.updatedAt)

  srr.save()
}

export function handleUpdateSRRMetadataDigestInternal(
  eventTimestampMillis: BigInt,
  srrEntityId: string,

  metadataDigest: string,
  event: ethereum.Event
): void {
  let srr = SRR.load(srrEntityId)
  if (!srr) {
    log.error('received event for unknown SRR: {}', [srrEntityId])
    return
  }

  srr.updatedAt = eventTimestampMillis
  srr.updatedAtStr = toUTCString(srr.updatedAt)
  srr.metadataDigest = metadataDigest
  srr.save()

  saveSRRMetadataHistory(srr, eventTimestampMillis, event)
}

/*============================================================================
 *
 * Helpers
 *
 *==========================================================================*/

export function saveCreateSRRInternal(
  srr: SRR,
  isPrimaryIssuer: boolean,
  artist: Address,
  issuer: Address,
  metadataDigest: string,
  lockExternalTransfer: boolean,
  updateTimestamp: BigInt,
  event: ethereum.Event
): void {
  srr.isPrimaryIssuer = isPrimaryIssuer
  srr.metadataDigest = metadataDigest
  srr.lockExternalTransfer = lockExternalTransfer

  srr.artistAddress = artist
  srr.artist = getLicensedUserIdFromAddress(artist)
  srr.issuer = getLicensedUserIdFromAddress(issuer)

  srr.updatedAt = updateTimestamp
  srr.updatedAtStr = toUTCString(srr.updatedAt)
  srr.save()

  saveSRRMetadataHistory(srr, updateTimestamp, event)
}

export function saveSRRMetadataHistory(
  srr: SRR,
  eventTimestampMillis: BigInt,
  event: ethereum.Event
): void {
  let metadataHistoryId = crypto
    .keccak256(
      ByteArray.fromUTF8(
        event.transaction.hash.toHex() +
          event.logIndex.toHex() +
          (srr.metadataDigest as string)
      )
    )
    .toHex()

  let srrMetadataHistory = new SRRMetadataHistory(metadataHistoryId) // metadataHistoryId)
  srrMetadataHistory.srr = srr.id
  srrMetadataHistory.createdAt = eventTimestampMillis
  srrMetadataHistory.createdAtStr = toUTCString(srrMetadataHistory.createdAt)
  srrMetadataHistory.metadataDigest = srr.metadataDigest as string
  srrMetadataHistory.save()
}

export function handleSRRCommitmentCancelledInternal(
  eventTimestampMillis: BigInt,
  srrEntityId: string
): void {
  let srr = SRR.load(srrEntityId)
  if (!srr) {
    log.error('received event for unknown SRR: {}', [srrEntityId])
    return
  }

  srr.transferCommitment = null
  srr.updatedAt = eventTimestampMillis
  srr.updatedAtStr = toUTCString(srr.updatedAt)
  srr.save()

  let srrCommit = SRRTransferCommit.load(srrEntityId)
  if (!srrCommit) {
    log.error(
      `received event but don't have corresponding SRRTransferCommit: {}`,
      [srrEntityId]
    )
    return
  }

  srrCommit.lastAction = 'cancel'
  srrCommit.commitment = null
  srrCommit.updatedAt = eventTimestampMillis
  srrCommit.updatedAtStr = toUTCString(srrCommit.updatedAt)
  srrCommit.save()
}

export function getLicensedUserIdFromAddress(address: Address): string | null {
  let id = address.toHex()
  let luw = LicensedUserWallet.load(id)
  return !luw ? null : luw.id
}

export function checkAndClearCommitOnTransfer(
  srr: SRR,
  eventTime: BigInt
): void {
  log.info('clearing transferCommitment on token = {}', [srr.id])
  let srrCommit = SRRTransferCommit.load(srr.id)
  if (srrCommit) {
    srrCommit.commitment = null
    srrCommit.lastAction = 'transfer'
    srrCommit.updatedAt = eventTime
    srrCommit.updatedAtStr = toUTCString(srrCommit.updatedAt)
    srrCommit.save()
  }
  srr.transferCommitment = null
}
