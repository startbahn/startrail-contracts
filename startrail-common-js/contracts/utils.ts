import { memoize } from 'lodash'

import { FunctionFragment, Interface } from '@ethersproject/abi'

import BulkABI from './abi/Bulk.json'
import BulkIssueABI from './abi/BulkIssue.json'
import BulkTransferABI from './abi/BulkTransfer.json'
import LicensedUserManagerABI from './abi/LicensedUserManager.json'
import MetaTxForwarderABI from './abi/MetaTxForwarder.json'
import NameRegistryABI from './abi/NameRegistry.json'
import StartrailProxyABI from './abi/StartrailProxy.json'
import StartrailRegistryABI from './abi/StartrailRegistry.json'

const contractABI = Object.freeze({
  BulkIssue: BulkIssueABI,
  Bulk: BulkABI,
  BulkTransfer: BulkTransferABI,
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
 * Get function signature hash for a Startrail contract function.
 */
const getFunctionSignatureHash = (
  contractName: string,
  functionNameOrDefinition: string
): string =>
  getContractInterface(contractName).getSighash(functionNameOrDefinition)

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
    Object.values(requestObject)
  )
}

export {
  encodeContractFunctionCalldata,
  getContractInterface,
  getFunctionSignatureHash,
}
