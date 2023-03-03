import { TypedDataUtils } from 'eth-sig-util'
import { ethers } from 'ethers'
import _ from 'lodash'

import { TypedDataField } from '@ethersproject/abstract-signer'

import { getFunctionSelector as getFunctionSelector } from '../contracts/utils'
import MessageTypesRegistry, { GenericParamTypes } from './eip712-message-types'
import { DestinationContract, MetaTxRequest, MetaTxRequestType } from './types'

/**
 * Startrail MetaTx request type details registry.
 */

/**
 * Generate the EIP712 type hash given a name and types list.
 *
 * EIP712 TypeHash is defined in the spec as:
 *
 *   keccak256(encodeType(typeOf(s)))
 *
 * An example of a typehash defined in Solidity is:
 *
 *   bytes32 constant MAIL_TYPEHASH = keccak256(
 *      "Mail(address from,address to,string contents)"
 *   );
 *
 * An example of using this function, given the inputs:
 *
 *      name="StartrailRegistryCreateSRR"
 *      types=[
 *        { name: 'isPrimaryIssuer', type: 'bool' },
 *        { name: 'artistAddress', type: 'address' },
 *        ...
 *      ]
 *
 * this function will return the hash produced by:
 *
 *      keccak256("StartrailRegistryCreateSRR(
 *        bool isPrimaryIssuer,
 *        address artistAddress,
 *        ...
 *      )")
 *
 * @param name EIP712 message name which is a MetaTxRequestType key
 * @param types EIP712 message property types list
 * @return typeHash Keccak256 hash string
 */
const buildTypeHash = (
  name: MetaTxRequestType,
  types: ReadonlyArray<TypedDataField>
): string =>
  ethers.utils.hexlify(
    TypedDataUtils.hashType(name as string, {
      [name]: types,
    })
  )

/**
 * Build the suffix string which is a substring of the full EIP712 'encodeType'
 *
 * It defines property names and types specific to the meta tx request. Thus the
 * generic params are first sliced off the types list.
 */
const buildSuffixTypeString = (types: ReadonlyArray<TypedDataField>): string =>
  types
    .slice(GenericParamTypes.length)
    .map((typeDef) => `${typeDef.type} ${typeDef.name}`)
    .join(',')

/**
 * Build a MetaTxRequest record for a single request type.
 * @param metaTxRequestType
 * @param contractName
 * @param functionSignature
 */
const buildMetaTxRequest = ({
  metaTxRequestType,
  contractName,
  functionSignature,
  adminCanCall = true,
  destinationAddressProvided = false,
}: {
  metaTxRequestType: MetaTxRequestType
  contractName: DestinationContract
  functionSignature: string
  adminCanCall?: boolean
  destinationAddressProvided?: boolean
}): MetaTxRequest => {
  const types = MessageTypesRegistry[metaTxRequestType + 'Types']
  return {
    eip712TypeHash: buildTypeHash(metaTxRequestType, types),
    eip712Types: types,
    destinationContract: contractName,
    destinationAddressProvided,
    functionSelector: getFunctionSelector(functionSignature),
    functionSignature: functionSignature,
    suffixTypeString: buildSuffixTypeString(types),
    requiresDataField: types.some((t) => t.name === 'data'),
    adminCanCall,
  }
}

const buildMetaTxRequestEntriesFromKeyToFnSigRecord = (
  // Contract type of the destination of the meta tx
  contractName: DestinationContract,

  // MetaTx key to function signature mapping
  metaTxKeyToFunctionSignature: Readonly<Record<string, string>>,

  // Usually the key prefix is the contract name.
  // One exception is LicensedUserManager meta-txs have 'Wallet' prefix.
  // This keyPrefixOverride enables us to handle each case.
  keyPrefixOverride: DestinationContract | string = contractName
) =>
  Object.entries(metaTxKeyToFunctionSignature).reduce(
    (metaTxTypes, [typeKey, typeFunctionSignature]) => {
      const metaTxKey = `${keyPrefixOverride}${typeKey}`

      // Destination contract address is provided in the request properties.
      // Currently only for Collection contract destinations. This allows
      // meta-tx's to be sent to different collection proxies.
      const destinationAddressProvided =
        contractName === 'CollectionProxyFeaturesAggregate'

      metaTxTypes[metaTxKey] = buildMetaTxRequest({
        metaTxRequestType: MetaTxRequestType[metaTxKey],
        contractName,
        functionSignature: typeFunctionSignature,
        destinationAddressProvided,
      })

      return metaTxTypes
    },
    {}
  )

const STARTRAIL_REGISTRY_TYPE_KEY_TO_FUNCTION_SIGNATURE = Object.freeze({
  CreateSRRWithLockExternalTransfer:
    'createSRRFromLicensedUser(bool,address,bytes32,bool)',
  CreateSRRFromLicensedUser:
    'createSRRFromLicensedUser(bool,address,bytes32,bool,address)',
  CreateSRRFromLicensedUserWithCid:
    'createSRRFromLicensedUser(bool,address,bytes32,string,bool,address)',
  CreateSRRFromLicensedUserWithRoyalty:
    'createSRRFromLicensedUser(bool,address,bytes32,string,bool,address,address,uint16)',
  UpdateSRR: 'updateSRR(uint256,bool,address)',
  UpdateSRRMetadata: 'updateSRRMetadata(uint256,bytes32)',
  UpdateSRRMetadataWithCid: 'updateSRRMetadata(uint256,string)',
  UpdateSRRRoyalty: 'updateSRRRoyalty(uint256,address,uint16)',
  ApproveSRRByCommitment: 'approveSRRByCommitment(uint256,bytes32,string)',
  ApproveSRRByCommitmentV2: 'approveSRRByCommitment(uint256,bytes32,string)',
  ApproveSRRByCommitmentWithCustomHistoryId:
    'approveSRRByCommitment(uint256,bytes32,string,uint256)',
  ApproveSRRByCommitmentWithCustomHistoryIdV2:
    'approveSRRByCommitment(uint256,bytes32,string,uint256)',
  CancelSRRCommitment: 'cancelSRRCommitment(uint256)',
  AddHistory: 'addHistory(uint256[],uint256[])',
  SetLockExternalTransfer: 'setLockExternalTransfer(uint256,bool)',
  TransferFromWithProvenance:
    'transferFromWithProvenance(address,uint256,string,uint256,bool)',
  TransferFromWithProvenanceV2:
    'transferFromWithProvenance(address,uint256,string,uint256,bool)',
})

/**
 * The full list of Startrail MetaTxRequest's.
 */
const metaTxRequests: Record<MetaTxRequestType, MetaTxRequest> = {
  //
  // LicensedUserManager
  //
  ...buildMetaTxRequestEntriesFromKeyToFnSigRecord(
    `LicensedUserManager`,
    {
      AddOwner: 'addOwner(address,address,uint8)',
      RemoveOwner: 'removeOwner(address,address,address,uint8)',
      ChangeThreshold: 'changeThreshold(address,uint8)',
      SwapOwner: 'swapOwner(address,address,address,address)',
      SetEnglishName: 'setEnglishName(address,string)',
      SetOriginalName: 'setOriginalName(address,string)',
    },
    `Wallet`
  ),

  //
  // StartrailRegistry
  //
  ...buildMetaTxRequestEntriesFromKeyToFnSigRecord(
    `StartrailRegistry`,
    STARTRAIL_REGISTRY_TYPE_KEY_TO_FUNCTION_SIGNATURE
  ),

  //
  // BulkIssue
  //
  BulkIssueSendBatch: buildMetaTxRequest({
    metaTxRequestType: MetaTxRequestType.BulkIssueSendBatch,
    contractName: 'BulkIssue',
    functionSignature: 'prepareBatchFromLicensedUser(bytes32)',
    adminCanCall: false,
  }),

  //
  // BulkTransfer
  //
  BulkTransferSendBatch: buildMetaTxRequest({
    metaTxRequestType: MetaTxRequestType.BulkTransferSendBatch,
    contractName: 'BulkTransfer',
    functionSignature: 'prepareBatchFromLicensedUser(bytes32)',
    adminCanCall: false,
  }),

  //
  // Generalized Bulk
  //
  BulkSendBatch: buildMetaTxRequest({
    metaTxRequestType: MetaTxRequestType.BulkSendBatch,
    contractName: 'Bulk',
    functionSignature: 'prepareBatchFromLicensedUser(bytes32)',
    adminCanCall: false,
  }),

  //
  // CollectionFactory
  //
  CollectionFactoryCreateCollection: buildMetaTxRequest({
    metaTxRequestType: MetaTxRequestType.CollectionFactoryCreateCollection,
    contractName: 'CollectionFactory',
    functionSignature: 'createCollectionContract(string,string,string,bytes32)',
    adminCanCall: false,
  }),

  //
  // Collections (proxies)
  //
  ...buildMetaTxRequestEntriesFromKeyToFnSigRecord(
    `CollectionProxyFeaturesAggregate`,
    // Create meta-tx's from the StartrailRegistry defined meta-tx's as most
    // are also executable with collection contracts. Some are not and they
    // are omitted on the next line.
    _.omitBy(STARTRAIL_REGISTRY_TYPE_KEY_TO_FUNCTION_SIGNATURE, (val) =>
      // For now in Collections we implement just one `createSRR` defined
      // below and not the legacy forms.
      // See also outstanding STARTRAIL-1946 that may change this.
      val.startsWith(`createSRRFrom`)
    ),
    `Collection`
  ),

  CollectionCreateSRR: buildMetaTxRequest({
    metaTxRequestType: MetaTxRequestType.CollectionCreateSRR,
    contractName: 'CollectionProxyFeaturesAggregate',
    functionSignature:
      'createSRR(bool,address,string,bool,address,address,uint16)',
    adminCanCall: false,
    destinationAddressProvided: true,
  }),

  //
  // Collection (FOR STUB ONLY - TO BE REMOVED)
  //

  CreateCollection: buildMetaTxRequest({
    metaTxRequestType: MetaTxRequestType.CreateCollection,
    contractName: 'CollectionProxyFeaturesAggregate',
    functionSignature: 'createCollection()',
    destinationAddressProvided: true,
  }),
} as Record<MetaTxRequestType, MetaTxRequest>

export { MetaTxRequestType, metaTxRequests, buildSuffixTypeString }
