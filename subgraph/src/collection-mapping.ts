import { log } from '@graphprotocol/graph-ts'

import { CreateSRR as CreateSRREvent } from '../generated/Collection/CollectionProxyFeaturesAggregate'
import { SRR } from '../generated/schema'
import { eventUTCMillis, logInvocation, toUTCString } from './utils'

export function handleCreateSRR(event: CreateSRREvent): void {
  logInvocation('handleCreateSRR', event)

  let timestampMillis = eventUTCMillis(event)
  let collectionAddress = event.address.toHex()

  let srrId = event.params.tokenId.toString()
  log.info('creating new SRR [{}]', [srrId])

  let srr = new SRR(srrId)
  srr.collection = collectionAddress
  srr.tokenId = srrId

  // TODO: share SRR related code with srr-mapping.ts
  //       but for now just hooking up the skeleton ...
  srr.metadataDigest = event.params.metadataCID
  srr.lockExternalTransfer = event.params.lockExternalTransfer
  srr.artistAddress = event.params.registryRecord.artistAddress

  srr.createdAt = timestampMillis
  srr.createdAtStr = toUTCString(srr.createdAt)
  srr.updatedAt = timestampMillis
  srr.updatedAtStr = toUTCString(srr.updatedAt)

  srr.save()
}
