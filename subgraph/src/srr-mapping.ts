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
  CustomHistoryType,
  LicensedUserWallet,
  SRR,
  SRRHistory,
  SRRMetadataHistory,
  SRRProvenance,
  SRRTransferCommit,
} from '../generated/schema'
import {
  CreateCustomHistory as CustomHistoryCreatedEvent,
  CreateCustomHistoryFromMigration as CustomHistoryCreatedFromMigrationEvent,
  CreateCustomHistoryType as CustomHistoryTypeCreatedEvent,
  CreateSRR as CreateSRRWithLockExternalTransferEvent,
  CreateSRR1 as CreateSRREventLegacy,
  CreateSRRFromMigration as CreateSRRFromMigrationEvent,
  History as SRRHistoryEvent,
  LockExternalTransfer as LockExternalTransferEvent,
  MigrateSRR as MigrateSRREvent,
  Provenance as SRRProvenanceWithIntermediaryEvent,
  Provenance1 as SRRProvenanceWithCustomHistoryAndIntermediaryEvent,
  Provenance2 as SRRProvenanceEventLegacy,
  Provenance3 as SRRProvenanceWithCustomHistoryEventLegacy,
  ProvenanceDateMigrationFix as ProvenanceDateMigrationFixEvent,
  ProvenanceFromMigration as SRRProvenanceFromMigrationEvent,
  ProvenanceFromMigration1 as SRRProvenanceWithCustomHistoryFromMigrationEvent,
  SRRCommitment as SRRCommitmentEvent,
  SRRCommitment1 as SRRCommitmentWithCustomHistoryEvent,
  SRRCommitmentCancelled as SRRCommitmentCancelledEvent,
  SRRCommitmentCancelledFromMigration as SRRCommitmentCancelledFromMigrationEvent,
  SRRCommitmentFromMigration as SRRCommitmentFromMigrationEvent,
  SRRCommitmentFromMigration1 as SRRCommitmentWithCustomHistoryFromMigrationEvent,
  Transfer as TransferEvent,
  TransferFromMigration as TransferFromMigrationEvent,
  UpdateSRR as UpdateSRRWithSenderEvent,
  UpdateSRR1 as UpdateSRREvent,
  UpdateCustomHistory as CustomHistoryUpdatedEvent,
  UpdateSRRFromMigration as UpdateSRRFromMigrationEvent,
  UpdateSRRMetadataDigest as UpdateSRRMetadataDigestEvent,
  UpdateSRRMetadataDigestFromMigration as UpdateSRRMetadataDigestFromMigrationEvent,
} from '../generated/StartrailRegistry/StartrailRegistry'
import {
  currentChainId,
  eventUTCMillis,
  logInvocation,
  secondsToMillis,
  toUTCString,
  ZERO_ADDRESS,
} from './utils'

export function handleTransfer(event: TransferEvent): void {
  logInvocation('handleTransfer', event)

  let timestampMillis = eventUTCMillis(event)
  let srrId = event.params.tokenId.toString()
  let srrIdBigInt = event.params.tokenId

  let isMint = event.params.from.toHexString() == ZERO_ADDRESS.toHexString()

  let srr = SRR.load(srrId)
  if (!srr) {
    srr = new SRR(srrId)
    srr.tokenId = srrId
    srr.lockExternalTransfer = false

    srr.originChain = currentChainId()
    srr.originTxHash = event.transaction.hash

    if (isMint == true) {
      srr.createdAt = timestampMillis
      srr.createdAtStr = toUTCString(srr.createdAt)
    }
  }
  srr.ownerAddress = event.params.to
  srr.updatedAt = timestampMillis
  srr.updatedAtStr = toUTCString(srr.updatedAt)
  srr.save()

  if (isMint == false) {
    handleSRRProvenanceInternal(
      timestampMillis,
      srrIdBigInt,
      event.params.from,
      event.params.to,
      null,
      null,
      null,
      false
    )
    checkAndClearCommitOnTransfer(srr as SRR, timestampMillis)
    srr.save()
  }
}

export function handleTransferFromMigration(
  event: TransferFromMigrationEvent
): void {
  logInvocation('handleTransferFromMigration', event)
  let originTimestampMillis = secondsToMillis(event.params.originTimestamp)

  let srrId = event.params.tokenId.toString()
  let srr = SRR.load(srrId)

  // In the normal case where a Transfer is emitted before a CreateSRR.
  // However due to a Mainnet migration in Oct 2020 sometimes this order is
  // flipped. So we handle this case here by creating the entity.
  if (!srr) {
    srr = new SRR(srrId)
    srr.tokenId = srrId
    srr.createdAt = originTimestampMillis
    srr.createdAtStr = toUTCString(srr.createdAt)
    srr.originChain = currentChainId()
    srr.originTxHash = event.params.originTxHash
  }

  if (event.params.from.toHexString() != ZERO_ADDRESS.toHexString()) {
    checkAndClearCommitOnTransfer(srr as SRR, originTimestampMillis)
  }

  srr.ownerAddress = event.params.to
  srr.updatedAt = originTimestampMillis
  srr.updatedAtStr = toUTCString(srr.updatedAt)

  srr.save()
}

function checkAndClearCommitOnTransfer(srr: SRR, eventTime: BigInt): void {
  log.info('clearing transferCommitment on token = {}', [srr.tokenId as string])
  let srrCommit = SRRTransferCommit.load(srr.tokenId as string)
  if (srrCommit) {
    srrCommit.commitment = null
    srrCommit.lastAction = 'transfer'
    srrCommit.updatedAt = eventTime
    srrCommit.updatedAtStr = toUTCString(srrCommit.updatedAt)
    srrCommit.save()
  }
  srr.transferCommitment = null
}

export function handleCreateSRR(event: CreateSRREventLegacy): void {
  logInvocation('handleCreateSRR', event)

  let timestampMillis = eventUTCMillis(event)
  let srrId = event.params.tokenId.toString()
  let srr = SRR.load(srrId)

  saveCreateSRRInternal(
    srr as SRR,
    event.params.registryRecord.isPrimaryIssuer,
    event.params.registryRecord.artistAddress,
    event.params.registryRecord.issuer,
    event.params.metadataDigest,
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
  let srrId = event.params.tokenId.toString()
  let srr = SRR.load(srrId)

  saveCreateSRRInternal(
    srr as SRR,
    event.params.registryRecord.isPrimaryIssuer,
    event.params.registryRecord.artistAddress,
    event.params.registryRecord.issuer,
    event.params.metadataDigest,
    event.params.lockExternalTransfer,
    timestampMillis,
    event
  )
}

export function handleCreateSRRFromMigration(
  event: CreateSRRFromMigrationEvent
): void {
  logInvocation('handleCreateSRRFromMigration', event)

  let timestampMillis = secondsToMillis(event.params.originTimestamp)
  let srrId = event.params.tokenId.toString()
  let srr = SRR.load(srrId)

  // In the normal case where a Transfer is emitted before a CreateSRR.
  // However due to a Mainnet migration in Oct 2020 sometimes this order is
  // flipped. So we handle this case here by creating the entity.
  if (!srr) {
    srr = new SRR(srrId)
    srr.tokenId = srrId
    srr.createdAt = timestampMillis
    srr.createdAtStr = toUTCString(srr.createdAt)
    srr.originTxHash = event.params.originTxHash
  }

  saveCreateSRRInternal(
    srr as SRR,
    event.params.registryRecord.isPrimaryIssuer,
    event.params.registryRecord.artistAddress,
    event.params.registryRecord.issuer,
    event.params.metadataDigest,
    false,
    timestampMillis,
    event
  )
}

function saveCreateSRRInternal(
  srr: SRR,
  isPrimaryIssuer: boolean,
  artist: Address,
  issuer: Address,
  metadataDigest: Bytes,
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

  saveSRRMetadataHistory(srr as SRR, updateTimestamp, event)
}

function getLicensedUserIdFromAddress(address: Address): string | null {
  let id = address.toHexString()
  let luw = LicensedUserWallet.load(id)
  return !luw ? null : luw.id
}

export function handleSRRProvenance(event: SRRProvenanceEventLegacy): void {
  logInvocation('handleSRRProvenance', event)
  let params = event.params
  handleSRRProvenanceInternal(
    eventUTCMillis(event),
    params.tokenId,
    params.from,
    params.to,
    null,
    params.historyMetadataDigest,
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
    params.tokenId,
    params.from,
    params.to,
    params.customHistoryId,
    params.historyMetadataDigest,
    params.historyMetadataURI,
    false
  )
}

export function handleSRRProvenanceWithIntermediary(
  event: SRRProvenanceWithIntermediaryEvent
): void {
  logInvocation('handleSRRProvenance', event)
  let params = event.params
  handleSRRProvenanceInternal(
    eventUTCMillis(event),
    params.tokenId,
    params.from,
    params.to,
    null,
    params.historyMetadataDigest,
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
    params.tokenId,
    params.from,
    params.to,
    params.customHistoryId,
    params.historyMetadataDigest,
    params.historyMetadataURI,
    params.isIntermediary
  )
}

/**
 * Can't use a union type to handle the 2 Provenance events with one function.
 *
 * So this function exists to handle both with a superset of the
 * available parameters.
 */
function handleSRRProvenanceInternal(
  eventTimestampMillis: BigInt,
  tokenId: BigInt,
  from: Address,
  to: Address,
  customHistoryId: BigInt | null,
  historyMetadataDigest: string | null,
  historyMetadataURI: string | null,
  isIntermediary: boolean
): void {
  let srrId = tokenId.toString()
  let srr = SRR.load(srrId)
  if (!srr) {
    log.error('received event for unknown SRR: {}', [srrId])
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
      ByteArray.fromUTF8(tokenId.toString() + eventTimestampMillis.toString())
    )
    .toHexString()
  let provenance = SRRProvenance.load(provenanceId)
  if (!provenance) {
    provenance = new SRRProvenance(provenanceId)

    provenance.srr = srr.id
    provenance.from = from
    provenance.to = to

    if (historyMetadataDigest) {
      provenance.metadataDigest = Bytes.fromHexString(
        historyMetadataDigest
      ) as Bytes
    } else {
      provenance.metadataDigest = new Bytes(0)
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

export function handleSRRProvenanceFromMigration(
  event: SRRProvenanceFromMigrationEvent
): void {
  logInvocation('handleSRRProvenanceFromMigration', event)
  let params = event.params
  handleSRRProvenanceInternal(
    secondsToMillis(event.params.originTimestamp),
    params.tokenId,
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
    params.tokenId,
    params.from,
    params.to,
    params.customHistoryId,
    params.historyMetadataDigest,
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

  let customHistoryId = event.params.id.toString()
  let ch = CustomHistory.load(customHistoryId)

  if (!ch) {
    log.error('received event for unknown CustomHistory: {}', [customHistoryId])
    return
  }

  let id = crypto
    .keccak256(
      ByteArray.fromUTF8(ch.metadataDigest.toString() + now.toString())
    )
    .toHexString()

  let chMh = new CustomHistoryMetadataHistory(id)
  chMh.metadataDigest = ch.metadataDigest
  chMh.customHistory = customHistoryId
  chMh.createdAt = now
  chMh.createdAtStr = toUTCString(chMh.createdAt)

  ch.metadataDigest = event.params.metadataDigest
  ch.updatedAt = now
  ch.updatedAtStr = toUTCString(ch.updatedAt)

  chMh.save()
  ch.save()
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
    event.params.metadataDigest,
    currentChainId(),
    event.transaction.hash
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
    event.params.metadataDigest,
    event.params.originChain,
    event.params.originTxHash
  )
}

function handleCreateCustomHistoryInternal(
  eventTimestampMillis: BigInt,
  id: BigInt,
  name: string,
  customHistoryTypeId: BigInt,
  metadataDigest: Bytes,
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

export function handleSRRHistory(event: SRRHistoryEvent): void {
  logInvocation('handleSRRHistory', event)

  let tokenIds = event.params.tokenIds
  let customHistoryIds = event.params.customHistoryIds

  for (let tokenIdsIdx = 0; tokenIdsIdx < tokenIds.length; tokenIdsIdx++) {
    let tokenId = tokenIds[tokenIdsIdx].toString()
    for (
      let customHistoryIdsIdx = 0;
      customHistoryIdsIdx < customHistoryIds.length;
      customHistoryIdsIdx++
    ) {
      let customHistoryId = customHistoryIds[customHistoryIdsIdx].toString()
      let historyId = crypto
        .keccak256(ByteArray.fromUTF8(tokenId + customHistoryId))
        .toHexString()

      let history = new SRRHistory(historyId)
      history.srr = tokenId
      history.customHistory = customHistoryId
      history.createdAt = eventUTCMillis(event)
      history.createdAtStr = toUTCString(history.createdAt)
      history.save()
    }
  }
}

export function handleSRRCommitment(event: SRRCommitmentEvent): void {
  logInvocation('handleSRRCommitment', event)
  let params = event.params
  handleSRRCommitmentInternal(
    eventUTCMillis(event),
    params.commitment,
    params.tokenId,
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
    params.tokenId,
    params.customHistoryId
  )
}

function handleSRRCommitmentInternal(
  eventTimestampMillis: BigInt,
  commitment: Bytes,
  tokenId: BigInt,
  customHistoryId: BigInt | null
): void {
  let srrId = tokenId.toString()
  let srr = SRR.load(srrId)
  if (!srr) {
    log.error('received event for unknown SRR: {}', [srrId])
    return
  }

  log.info('SRRCommitment commitment = {}', [commitment.toHexString()])

  srr.transferCommitment = commitment
  srr.updatedAt = eventTimestampMillis
  srr.updatedAtStr = toUTCString(srr.updatedAt)
  srr.save()

  let srrCommit = SRRTransferCommit.load(srrId)
  if (!srrCommit) {
    srrCommit = new SRRTransferCommit(srrId)
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

export function handleSRRCommitmentFromMigration(
  event: SRRCommitmentFromMigrationEvent
): void {
  logInvocation('handleSRRCommitmentFromMigration', event)
  let params = event.params
  handleSRRCommitmentInternal(
    secondsToMillis(event.params.originTimestamp),
    params.commitment,
    params.tokenId,
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
    params.tokenId,
    params.customHistoryId
  )
}

export function handleSRRCommitmentCancelled(
  event: SRRCommitmentCancelledEvent
): void {
  logInvocation('handleSRRCommitmentCancelled', event)
  handleSRRCommitmentCancelledInternal(
    eventUTCMillis(event),
    event.params.tokenId
  )
}

export function handleSRRCommitmentCancelledFromMigration(
  event: SRRCommitmentCancelledFromMigrationEvent
): void {
  logInvocation('handleSRRCommitmentCancelledFromMigration', event)
  handleSRRCommitmentCancelledInternal(
    secondsToMillis(event.params.originTimestamp),
    event.params.tokenId
  )
}

function handleSRRCommitmentCancelledInternal(
  eventTimestampMillis: BigInt,
  tokenId: BigInt
): void {
  let srrId = tokenId.toString()
  let srr = SRR.load(srrId)
  if (!srr) {
    log.error('received event for unknown SRR: {}', [srrId])
    return
  }

  srr.transferCommitment = null
  srr.updatedAt = eventTimestampMillis
  srr.updatedAtStr = toUTCString(srr.updatedAt)
  srr.save()

  let srrCommit = SRRTransferCommit.load(srrId)
  if (!srrCommit) {
    log.error(
      `received event but don't have corresponding SRRTransferCommit: {}`,
      [srrId]
    )
    return
  }

  srrCommit.lastAction = 'cancel'
  srrCommit.commitment = null
  srrCommit.updatedAt = eventTimestampMillis
  srrCommit.updatedAtStr = toUTCString(srrCommit.updatedAt)
  srrCommit.save()
}

export function handleUpdateSRR(event: UpdateSRREvent): void {
  logInvocation('handleUpdateSRR', event)
  handleUpdateSRRInternal(
    eventUTCMillis(event),
    event.params.registryRecord.isPrimaryIssuer,
    event.params.registryRecord.artistAddress,
    event.params.tokenId
  )
}

export function handleUpdateSRRWithSender(
  event: UpdateSRRWithSenderEvent
): void {
  logInvocation('handleUpdateSRRWithSender', event)
  handleUpdateSRRInternal(
    eventUTCMillis(event),
    event.params.isPrimaryIssuer,
    event.params.artistAddress,
    event.params.tokenId
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
    event.params.tokenId
  )
}

function handleUpdateSRRInternal(
  eventTimestampMillis: BigInt,
  isPrimaryIssuer: boolean,
  artistAddress: Address,
  tokenId: BigInt
): void {
  let srrId = tokenId.toString()
  let srr = SRR.load(srrId)
  if (!srr) {
    log.error('received event for unknown SRR: {}', [srrId])
    return
  }

  const artist = getLicensedUserIdFromAddress(artistAddress)
  if (!artist) {
    log.error('received event for unknown SRR artist address: {}', [
      artistAddress.toHexString(),
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

export function handleUpdateSRRMetadataDigest(
  event: UpdateSRRMetadataDigestEvent
): void {
  logInvocation('handleUpdateSRRMetadataDigest', event)
  handleUpdateSRRMetadataDigestInternal(
    eventUTCMillis(event),
    event.params.tokenId,
    event.params.metadataDigest,
    event
  )
}

export function handleUpdateSRRMetadataDigestFromMigration(
  event: UpdateSRRMetadataDigestFromMigrationEvent
): void {
  logInvocation('handleUpdateSRRMetadataDigestFromMigration', event)
  handleUpdateSRRMetadataDigestInternal(
    secondsToMillis(event.params.originTimestamp),
    event.params.tokenId,
    event.params.metadataDigest,
    event
  )
}

function handleUpdateSRRMetadataDigestInternal(
  eventTimestampMillis: BigInt,
  tokenId: BigInt,
  metadataDigest: Bytes,
  event: ethereum.Event
): void {
  let srrId = tokenId.toString()
  let srr = SRR.load(srrId)
  if (!srr) {
    log.error('received event for unknown SRR: {}', [srrId])
    return
  }

  srr.updatedAt = eventTimestampMillis
  srr.updatedAtStr = toUTCString(srr.updatedAt)
  srr.metadataDigest = metadataDigest
  srr.save()

  saveSRRMetadataHistory(srr as SRR, eventTimestampMillis, event)
}

function saveSRRMetadataHistory(
  srr: SRR,
  eventTimestampMillis: BigInt,
  event: ethereum.Event
): void {
  let metadataHistoryId = crypto
    .keccak256(
      ByteArray.fromUTF8(
        event.transaction.hash.toHexString() +
          event.logIndex.toHexString() +
          (srr.metadataDigest as Bytes).toHexString()
      )
    )
    .toHexString()

  let srrMetadataHistory = new SRRMetadataHistory(metadataHistoryId) // metadataHistoryId)
  srrMetadataHistory.srr = srr.id
  srrMetadataHistory.createdAt = eventTimestampMillis
  srrMetadataHistory.createdAtStr = toUTCString(srrMetadataHistory.createdAt)
  srrMetadataHistory.metadataDigest = Bytes.fromHexString(
    (srr.metadataDigest as Bytes).toHexString()
  ) as Bytes
  srrMetadataHistory.save()
}

export function handleMigrateSRR(event: MigrateSRREvent): void {
  logInvocation('handleMigrateSRR', event)
  let srrId = event.params.tokenId.toString()
  let srr = SRR.load(srrId)
  if (srr) {
    srr.originChain = event.params.originChain
    srr.save()
  }
}

export function handleProvenanceDateMigrationFix(
  event: ProvenanceDateMigrationFixEvent
): void {
  logInvocation('handleProvenanceDateMigrationFix', event)
  let provenanceId = crypto
    .keccak256(ByteArray.fromUTF8(event.params.tokenId.toString() + '66000'))
    .toHexString()
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

export function handleLockExternalTransfer(
  event: LockExternalTransferEvent
): void {
  logInvocation('handleLockExternalTransfer', event)
  let srrId = event.params.tokenId.toString()
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
