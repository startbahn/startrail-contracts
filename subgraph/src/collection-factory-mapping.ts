import { Address, BigInt, Bytes, log } from '@graphprotocol/graph-ts'

import { CollectionCreated as CollectionCreatedEvent } from '../generated/CollectionFactory/CollectionFactory'
import { Collection } from '../generated/schema'
import { Collection as CollectionTemplate } from '../generated/templates'
import { eventUTCMillis, logInvocation, toUTCString } from './lib/utils'

export function handleCollectionCreated(event: CollectionCreatedEvent): void {
  logInvocation('handleCollectionCreated', event)
  let params = event.params
  handleCollectionCreatedInternal(
    eventUTCMillis(event),
    params.collectionAddress,
    params.name,
    params.symbol,
    params.salt,
    params.ownerAddress
  )
}

function handleCollectionCreatedInternal(
  eventTimestampMillis: BigInt,
  collectionAddress: Address,
  name: string,
  symbol: string,
  salt: Bytes,
  ownerAddress: Address
): void {
  let collectionAddressStr = collectionAddress.toHex()
  log.info('creating new Collection [{}]', [collectionAddressStr])

  let collection = new Collection(collectionAddressStr)

  collection.name = name
  collection.symbol = symbol
  collection.ownerAddress = ownerAddress
  collection.salt = salt

  collection.createdAt = eventTimestampMillis
  collection.createdAtStr = toUTCString(collection.createdAt)
  collection.updatedAt = eventTimestampMillis
  collection.updatedAtStr = toUTCString(collection.updatedAt)

  collection.save()

  CollectionTemplate.create(collectionAddress)
}
