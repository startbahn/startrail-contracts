import { Address, Bytes, ethereum, log, BigInt } from '@graphprotocol/graph-ts'
import { Bulk, BulkSRR } from '../../generated/schema'
import { ZERO_ADDRESS, eventUTCMillis, toUTCString } from './utils'

export function updateBulkInternal(
  merkleRoot: Bytes,
  contractAddress: Address | null,
  tokenId: BigInt,
  leafHash: Bytes,
  event: ethereum.Event,
  eventName: string
): void {
  const merkleRootStr = merkleRoot.toHex()
  const batch = Bulk.load(merkleRootStr)
  if (!batch) {
    log.error('received a {} event for an unknown batch. MerkleRoot: {}', [
      eventName,
      merkleRootStr,
    ])
    return
  }
  const tokenIdStr = tokenId.toString()
  const srrHash = leafHash.toHex()
  log.info('adding BulkSRR for token {} and hash {}', [tokenIdStr, srrHash])

  const timestampMillis = eventUTCMillis(event)

  const bulkIssueSRR = new BulkSRR(srrHash)
  if (contractAddress && contractAddress.toHex() != ZERO_ADDRESS.toHex()) {
    bulkIssueSRR.contractAddress = contractAddress
  }
  bulkIssueSRR.bulk = merkleRootStr
  bulkIssueSRR.hash = leafHash
  bulkIssueSRR.tokenId = tokenIdStr
  bulkIssueSRR.createdAt = timestampMillis
  bulkIssueSRR.createdAtStr = toUTCString(bulkIssueSRR.createdAt)
  bulkIssueSRR.save()

  batch.updatedAt = timestampMillis
  batch.updatedAtStr = toUTCString(batch.updatedAt)
  batch.save()
}
