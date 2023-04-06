import { TypedDataField } from '@ethersproject/abstract-signer'

import { buildTypeList } from './helpers'

//
// CollectionFactory message types (see CollectionFactory.sol)
//

const CollectionFactoryCreateCollectionTypes: ReadonlyArray<TypedDataField> = buildTypeList(
  {
    name: 'string',
    symbol: 'string',
    salt: 'bytes32',
  }
)

interface CollectionFactoryCreateCollectionRecord {
  name: string
  symbol: string
  salt: Buffer | string
}

export {
  CollectionFactoryCreateCollectionTypes,
  CollectionFactoryCreateCollectionRecord,
}
