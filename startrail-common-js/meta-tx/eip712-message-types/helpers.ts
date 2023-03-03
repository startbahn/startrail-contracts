import { TypedDataField } from '@ethersproject/abstract-signer'

import { GenericParamTypes } from './core-types'

/**
 * Check if a type is a Dynamic Array type.
 *
 * This includes any dynamic length array including string and bytes.
 *
 * see https://docs.soliditylang.org/en/v0.8.5/internals/layout_in_storage.html?highlight=bytes%20string#mappings-and-dynamic-arrays
 */
const isDynamicArrayType = (type: string): boolean =>
  type === 'string' || type === 'bytes' || type.indexOf('[]') !== -1

/**
 * Build a list of TypedDataField's given a mapping of field nammes to types.
 */
const buildTypeList = (
  fields: Record<string, string>
): ReadonlyArray<TypedDataField> => {
  const typeList: Array<TypedDataField> = [...GenericParamTypes]

  // calldata in 'data' required if one or more dynamic array types
  // see STARTRAIL-737
  if (Object.values(fields).some(isDynamicArrayType)) {
    typeList.push({ name: 'data', type: 'bytes' })
  }

  for (const name in fields) {
    typeList.push({ name, type: fields[name] })
  }

  return typeList
}

export { buildTypeList, isDynamicArrayType }
