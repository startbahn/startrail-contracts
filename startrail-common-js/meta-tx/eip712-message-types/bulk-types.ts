import { TypedDataField } from '@ethersproject/abstract-signer'

import { buildTypeList } from './helpers'

//
// BulkIssue and BulkTransfer message types
// backward compatibility for deployment
//

const BulkIssueSendBatchTypes: ReadonlyArray<TypedDataField> = buildTypeList({
  merkleRoot: 'bytes32',
})

interface BulkIssueSendBatchRecord {
  merkleRoot: Buffer | string
}

const BulkTransferSendBatchTypes: ReadonlyArray<TypedDataField> = buildTypeList(
  {
    merkleRoot: 'bytes32',
  }
)

interface BulkTransferSendBatchRecord {
  merkleRoot: Buffer | string
}

//
// GeneralizedBulk and BulkTransfer message types (see Bulk.sol)
//

const BulkSendBatchTypes: ReadonlyArray<TypedDataField> = buildTypeList({
  merkleRoot: 'bytes32',
})

interface BulkSendBatchRecord {
  merkleRoot: Buffer | string
}

export {
  BulkIssueSendBatchRecord,
  BulkIssueSendBatchTypes,
  BulkSendBatchRecord,
  BulkSendBatchTypes,
  BulkTransferSendBatchRecord,
  BulkTransferSendBatchTypes,
}
