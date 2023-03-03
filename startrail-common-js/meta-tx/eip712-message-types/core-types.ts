import { TypedDataField } from '@ethersproject/abstract-signer'

//
// Domain separator type
//

const EIP712DomainTypes: ReadonlyArray<TypedDataField> = [
  { name: 'name', type: 'string' }, // Startrail
  { name: 'version', type: 'string' }, // 1
  { name: 'chainId', type: 'uint256' }, // 1: mainnet, 4: rinkeby, etc.
  { name: 'verifyingContract', type: 'address' }, // MetaTxForwarder
]

//
// Generic MetaTx properties - shared by all the Startrail EIP712 signatures
//

const GenericParamTypes: ReadonlyArray<TypedDataField> = [
  { name: 'from', type: 'address' },
  { name: 'nonce', type: 'uint256' },
]

export { EIP712DomainTypes, GenericParamTypes }
