import { log } from '@graphprotocol/graph-ts'

import { CollectionCreated as CollectionCreatedEvent } from '../generated/CollectionFactory/CollectionFactory'
import { Collection } from '../generated/schema'
import { eventUTCMillis, logInvocation, toUTCString } from './utils'

export function handleCollectionCreated(event: CollectionCreatedEvent): void {
  logInvocation('handleCollectionCreated', event)

  let timestampMillis = eventUTCMillis(event)
  let collectionAddress = event.params.collectionAddress.toHex()
  log.info('creating new Collection [{}]', [collectionAddress])

  let collection = new Collection(collectionAddress)

  collection.name = event.params.name
  collection.symbol = event.params.symbol
  collection.metadataCID = event.params.metadataCID

  collection.createdAt = timestampMillis
  collection.createdAtStr = toUTCString(collection.createdAt)
  collection.updatedAt = timestampMillis
  collection.updatedAtStr = toUTCString(collection.updatedAt)

  collection.save()
}
