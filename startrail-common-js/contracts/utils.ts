import { memoize, omit } from 'lodash'

import { FunctionFragment, Interface } from '@ethersproject/abi'
import { id } from '@ethersproject/hash'

import BulkABI from './abi/Bulk.json'
import BulkTransferABI from './abi/BulkTransfer.json'
import CollectionProxyFeaturesAggregateABI from './abi/CollectionProxyFeaturesAggregate.json'
import CollectionFactoryABI from './abi/CollectionFactory.json'
import LicensedUserManagerABI from './abi/LicensedUserManager.json'
import MetaTxForwarderABI from './abi/MetaTxForwarder.json'
import NameRegistryABI from './abi/NameRegistry.json'
import StartrailProxyABI from './abi/StartrailProxy.json'
import StartrailRegistryABI from './abi/StartrailRegistry.json'

const contractABI = Object.freeze({
  Bulk: BulkABI,
  BulkTransfer: BulkTransferABI,
  CollectionProxyFeaturesAggregate: CollectionProxyFeaturesAggregateABI,
  CollectionFactory: CollectionFactoryABI,
  LicensedUserManager: LicensedUserManagerABI,
  MetaTxForwarder: MetaTxForwarderABI,
  NameRegistry: NameRegistryABI,
  StartrailRegistry: StartrailRegistryABI,
  StartrailProxy: StartrailProxyABI,
})

/**
 * Get ethers contract Interface for Startrail contract by name
 */
const getContractInterface = memoize(
  (contractName) => new Interface(contractABI[contractName])
)

/**
 * Get function selector for a function signature.
 * see https://docs.soliditylang.org/en/v0.8.17/abi-spec.html?highlight=function%20signature#function-selector
 */
const getFunctionSelector = (functionSignature: string): string =>
  id(functionSignature).slice(0, 10)

/**
 * Encode calldata for a call to a contract function.
 * @param contractName Contract name
 * @param fnName Contract function name
 * @param requestObject Function arguments
 */
const encodeContractFunctionCalldata = (
  contractName: string,
  fnName: string,
  requestObject: Record<string, any>
): string => {
  const contractInterface = getContractInterface(contractName)
  // console.log(JSON.stringify(contractInterface.fragments, null, 2))

  const fnFragment: FunctionFragment = contractInterface.getFunction(fnName)
  // console.log(JSON.stringify(fnFragment, null, 2))

  return contractInterface.encodeFunctionData(
    fnFragment,
    Object.values(
      omit(
        requestObject,
        // strip out 'destination' as it's not passed through to the destination
        // function. it is a special property used to indicate which destination
        // contract in cases where there could be more than 1 (eg. collections)
        [`destination`]
      )
    )
  )
}

export {
  encodeContractFunctionCalldata,
  getContractInterface,
  getFunctionSelector,
}
