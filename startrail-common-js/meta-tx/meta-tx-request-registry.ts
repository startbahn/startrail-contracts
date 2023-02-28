import { TypedDataUtils } from 'eth-sig-util'
import { ethers } from 'ethers'

import { TypedDataField } from '@ethersproject/abstract-signer'

import { getFunctionSignatureHash } from '../contracts/utils'
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
 * @param functionName
 */
const buildMetaTxRequest = (
  metaTxRequestType: MetaTxRequestType,
  contractName: DestinationContract,
  functionName: string,
  adminCanCall = true
): MetaTxRequest => {
  const types = MessageTypesRegistry[metaTxRequestType + 'Types']
  const contractFunctionSigHash = getFunctionSignatureHash(
    contractName,
    functionName
  )
  return {
    eip712TypeHash: buildTypeHash(metaTxRequestType, types),
    eip712Types: types,
    destinationContract: contractName,
    contractFunctionSigHash,
    functionNameOrSig: functionName,
    suffixTypeString: buildSuffixTypeString(types),
    requiresDataField: types.some((t) => t.name === 'data'),
    adminCanCall,
  }
}

/**
 * The full list of Startrail MetaTxRequest's.
 */
const metaTxRequests: Record<MetaTxRequestType, MetaTxRequest> = {
  //
  // LicensedUserManager
  //
  WalletAddOwner: buildMetaTxRequest(
    MetaTxRequestType.WalletAddOwner,
    'LicensedUserManager',
    'addOwner'
  ),
  WalletRemoveOwner: buildMetaTxRequest(
    MetaTxRequestType.WalletRemoveOwner,
    'LicensedUserManager',
    'removeOwner'
  ),
  WalletChangeThreshold: buildMetaTxRequest(
    MetaTxRequestType.WalletChangeThreshold,
    'LicensedUserManager',
    'changeThreshold'
  ),
  WalletSwapOwner: buildMetaTxRequest(
    MetaTxRequestType.WalletSwapOwner,
    'LicensedUserManager',
    'swapOwner'
  ),
  WalletSetEnglishName: buildMetaTxRequest(
    MetaTxRequestType.WalletSetEnglishName,
    'LicensedUserManager',
    'setEnglishName'
  ),
  WalletSetOriginalName: buildMetaTxRequest(
    MetaTxRequestType.WalletSetOriginalName,
    'LicensedUserManager',
    'setOriginalName'
  ),

  //
  // StartrailRegistry
  //
  StartrailRegistryCreateSRR: buildMetaTxRequest(
    MetaTxRequestType.StartrailRegistryCreateSRR,
    'StartrailRegistry',
    'createSRRFromLicensedUser(bool,address,bytes32)'
  ),
  StartrailRegistryCreateSRRWithLockExternalTransfer: buildMetaTxRequest(
    MetaTxRequestType.StartrailRegistryCreateSRRWithLockExternalTransfer,
    'StartrailRegistry',
    'createSRRFromLicensedUser(bool,address,bytes32,bool)'
  ),
  StartrailRegistryCreateSRRFromLicensedUser: buildMetaTxRequest(
    MetaTxRequestType.StartrailRegistryCreateSRRFromLicensedUser,
    'StartrailRegistry',
    'createSRRFromLicensedUser(bool,address,bytes32,bool,address)'
  ),
  StartrailRegistryUpdateSRR: buildMetaTxRequest(
    MetaTxRequestType.StartrailRegistryUpdateSRR,
    'StartrailRegistry',
    'updateSRR'
  ),
  StartrailRegistryUpdateSRRMetadata: buildMetaTxRequest(
    MetaTxRequestType.StartrailRegistryUpdateSRRMetadata,
    'StartrailRegistry',
    'updateSRRMetadata(uint256,bytes32)'
  ),
  StartrailRegistryApproveSRRByCommitment: buildMetaTxRequest(
    MetaTxRequestType.StartrailRegistryApproveSRRByCommitment,
    'StartrailRegistry',
    'approveSRRByCommitment(uint256,bytes32,string)'
  ),
  StartrailRegistryApproveSRRByCommitmentWithCustomHistoryId: buildMetaTxRequest(
    MetaTxRequestType.StartrailRegistryApproveSRRByCommitmentWithCustomHistoryId,
    'StartrailRegistry',
    'approveSRRByCommitment(uint256,bytes32,string,uint256)'
  ),
  StartrailRegistryCancelSRRCommitment: buildMetaTxRequest(
    MetaTxRequestType.StartrailRegistryCancelSRRCommitment,
    'StartrailRegistry',
    'cancelSRRCommitment(uint256)'
  ),
  StartrailRegistryAddHistory: buildMetaTxRequest(
    MetaTxRequestType.StartrailRegistryAddHistory,
    'StartrailRegistry',
    'addHistory(uint256[],uint256[])'
  ),
  StartrailRegistrySetLockExternalTransfer: buildMetaTxRequest(
    MetaTxRequestType.StartrailRegistrySetLockExternalTransfer,
    'StartrailRegistry',
    'setLockExternalTransfer(uint256,bool)'
  ),
  StartrailRegistryTransferFromWithProvenance: buildMetaTxRequest(
    MetaTxRequestType.StartrailRegistryTransferFromWithProvenance,
    'StartrailRegistry',
    'transferFromWithProvenance(address,uint256,string,uint256,bool)'
  ),
  //
  // BulkIssue
  //
  BulkIssueSendBatch: buildMetaTxRequest(
    MetaTxRequestType.BulkIssueSendBatch,
    'BulkIssue',
    'prepareBatchFromLicensedUser',
    false
  ),

  //
  // BulkTransfer
  //
  BulkTransferSendBatch: buildMetaTxRequest(
    MetaTxRequestType.BulkTransferSendBatch,
    'BulkTransfer',
    'prepareBatchFromLicensedUser',
    false
  ),

  //
  // Generalized Bulk
  //
  BulkSendBatch: buildMetaTxRequest(
    MetaTxRequestType.BulkSendBatch,
    'Bulk',
    'prepareBatchFromLicensedUser',
    false
  ),
}

export { MetaTxRequestType, metaTxRequests, buildSuffixTypeString }
