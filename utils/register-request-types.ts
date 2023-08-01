import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { Operation } from '../startrail-common-js/contracts/types'
import { metaTxRequests } from '../startrail-common-js/meta-tx/meta-tx-request-registry'
import {
  MetaTxRequest,
  MetaTxRequestType,
} from '../startrail-common-js/meta-tx/types'

import pMap from 'p-map'

import { ZERO_ADDRESS } from '../test/helpers/utils'
import { getProxyAddressByContractName } from './deployment/deploy-json'
import { getAdministratorInstance, getContract } from './hardhat-helpers'

/**
 * Register all MetaTxRequestTypes with the MetaTxForwarder.
 *
 * Optionally only register types related to a single destination contract by
 * setting options.destinationFilter.
 *
 * @param hre Hardhat runtime
 * @param requestTypes List of types to register
 */
const registerRequestTypes = async (
  hre: HardhatRuntimeEnvironment,
  requestTypes: ReadonlyArray<MetaTxRequestType>
): Promise<void> => {
  console.log(`\n=====    registerRequestTypes invoked    ======\n`)
  console.log(`types: [${requestTypes}]\n`)
  const mtfContract = await getContract(hre, 'MetaTxForwarder')
  await registerRequestTypesCallByAdmin(hre, mtfContract, requestTypes)
}

// For deployed environments - must send from Admin contract
const registerRequestTypesCallByAdmin = async (
  hre,
  mtfContract,
  requestTypes,
  gasLimit = 1_500_000
) => {
  const requestCalldataList : string[] = await Promise.all(
    requestTypes.map((requestTypeKey) =>
      mtfContract.populateTransaction
        .registerRequestType(
          ...buildRegisterRequestTypeInputProps(
            requestTypeKey,
            getDestinationAddress(hre, requestTypeKey)
          )
        )
        .then((tx) => tx.data)
    )
  )
  const adminContract = await getAdministratorInstance(hre)

  if (requestCalldataList.length > 1) {
    const multiSendEncoded = adminContract.encodeMultiSendSingleDestination(
      Operation.CALL,
      mtfContract.address,
      requestCalldataList
    )
    console.log(
      `\nSending MultiSend transaction to register [${requestCalldataList.length}] request types`
    )
    await adminContract.execTransaction({
      to: undefined, // explicit undefined to workaround typescript error - ideally we should change the execTransaction interface making `to` optional
      data: multiSendEncoded,
      multiSend: true,
      waitConfirmed: true,
      gasLimit,
    })
  } else {
    await adminContract.execTransaction({
      data: requestCalldataList[0],
      to: mtfContract.address,
      waitConfirmed: true,
      gasLimit,
    })
  }
}

const registerRequestTypesGenesisSet = (hre) => {
  const genesisSet: ReadonlyArray<MetaTxRequestType> = [
    MetaTxRequestType.WalletAddOwner,
    MetaTxRequestType.WalletRemoveOwner,
    MetaTxRequestType.WalletChangeThreshold,
    MetaTxRequestType.WalletSwapOwner,
    MetaTxRequestType.WalletSetEnglishName,
    MetaTxRequestType.WalletSetOriginalName,
    MetaTxRequestType.StartrailRegistryUpdateSRR,
    MetaTxRequestType.StartrailRegistryUpdateSRRMetadata,
    MetaTxRequestType.StartrailRegistryApproveSRRByCommitment,
    MetaTxRequestType.StartrailRegistryApproveSRRByCommitmentWithCustomHistoryId,
    MetaTxRequestType.StartrailRegistryCancelSRRCommitment,
    MetaTxRequestType.BulkIssueSendBatch,
  ]
  return registerRequestTypes(hre, genesisSet)
}

/**
 * Build the property list for passing to the contract function
 * registerRequestType in MetaTxRequestManager.sol.
 * @param {string} requestTypeKey Key into metaTxRequests
 * @param {string} destinationContractAddr Destination address for the request
 */
const buildRegisterRequestTypeInputProps = (
  requestTypeKey,
  destinationContractAddr
) => [
  // string calldata _typeName
  requestTypeKey,
  // string calldata _typeSuffix
  metaTxRequests[requestTypeKey].suffixTypeString,
  // address _destinationContract
  destinationContractAddr,
  // bytes4 _functionSignature
  metaTxRequests[requestTypeKey].functionSelector,
]

/**
 * Get the deployment address of the destination contract for the given
 * MetaTxRequest.
 * @param hre Key into metaTxRequests
 * @param requestTypeKey Key into metaTxRequests
 * @return deployed destination contract address
 */
const getDestinationAddress = (hre, requestTypeKey): string => {
  const metaTxRequest: MetaTxRequest = metaTxRequests[requestTypeKey]
  return metaTxRequest.destinationAddressProvided
    ? // address will be provided in each request so the registered address is just the zero address
      ZERO_ADDRESS
    : // all other cases use the specific single proxy address for the contract
      getProxyAddressByContractName(hre, metaTxRequest.destinationContract)
}

// For deployed environments - must send from Admin contract
const unregisterRequestTypeCallByAdmin = async (hre, requestType) => {
  console.log(`\n=====    unregisterRequestTypeCallByAdmin invoked    ======\n`)
  console.log(`type: [${requestType}]\n`)

  const mtfContract = await getContract(hre, 'MetaTxForwarder')
  const requestCalldata = await mtfContract.populateTransaction
    .unregisterRequestType(requestType)
    .then((tx) => tx.data)

  const adminContract = await getAdministratorInstance(hre)
  await adminContract.execTransaction({
    data: requestCalldata,
    to: mtfContract.address,
    waitConfirmed: true,
  })
}

const unregisterRequestTypesCallByAdmin = async (
  hre,
  requestTypeHashes: string[]
) => {
  await pMap(
    requestTypeHashes,
    async (typeHash) => {
      await unregisterRequestTypeCallByAdmin(hre, typeHash)
    },
    {
      stopOnError: true,
      concurrency: 1,
    }
  )
}

export {
  buildRegisterRequestTypeInputProps,
  getDestinationAddress,
  registerRequestTypes,
  registerRequestTypesGenesisSet,
  unregisterRequestTypeCallByAdmin,
  unregisterRequestTypesCallByAdmin,
}
