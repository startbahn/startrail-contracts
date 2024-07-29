import { TypedDataField } from '@ethersproject/abstract-signer'

type DestinationContract =
  | 'StartrailRegistry'
  | 'LicensedUserManager'
  | 'BulkIssue' // backward compatibility for deployment
  | 'BulkTransfer' // backward compatibility for deployment
  | 'Bulk'
  | 'CollectionProxyFeaturesAggregate' // meta contract - ABI from aggregating all Feature contracts
  | 'CollectionFactory'

interface MetaTxRequest {
  // EIP712 hash and types
  eip712TypeHash: string
  eip712Types: ReadonlyArray<TypedDataField>

  // Contract to send the transaction to
  destinationContract: DestinationContract

  // True if the destination contract address is provided in the request.
  // If false then a single address exists for destinationContract which
  //   is provided at the time the request is registered.
  destinationAddressProvided: boolean

  // Solidity 4 byte / 8 hex digit function selector (see https://docs.soliditylang.org/en/v0.8.17/abi-spec.html?highlight=function%20signature#function-selector)
  functionSelector: string

  // Function signature (eg. 'setOwner(address)'
  functionSignature: string

  // eip712 'encodeType' substring defining the properties specific to the
  // request. also appearing at the end of the full encodeType (thus 'suffix')
  suffixTypeString: string

  // true if the request includes a 'data' field containing calldata
  requiresDataField: boolean

  // true if the contract function associated with this request allows admin
  // to call (eg. modifier onlySRROwnerOrAdministrator)
  // NOTE: this information doesn't really belong here with the metatx info
  //       but is added here for convenience at this time. later this meta tx
  //       info can be moved to startrail repo and split into contract info
  //       metatx info
  adminCanCall: boolean
}

// All the Startrail MetaTx request types
enum MetaTxRequestType {
  // LicensedUserManager
  WalletAddOwner = 'WalletAddOwner',
  WalletRemoveOwner = 'WalletRemoveOwner',
  WalletSwapOwner = 'WalletSwapOwner',
  WalletChangeThreshold = 'WalletChangeThreshold',
  WalletSetEnglishName = 'WalletSetEnglishName',
  WalletSetOriginalName = 'WalletSetOriginalName',

  // StartrailRegistry
  /**
   * Deprecated StartrailRegistryCreateSRR type. Backward compatibility for deployment
   */
  StartrailRegistryCreateSRRWithLockExternalTransfer = 'StartrailRegistryCreateSRRWithLockExternalTransfer',
  /**
   * Deprecated StartrailRegistryCreateSRR type. Backward compatibility for deployment
   */
  StartrailRegistryCreateSRRFromLicensedUser = 'StartrailRegistryCreateSRRFromLicensedUser',
  /**
   * Deprecated StartrailRegistryCreateSRR type. Backward compatibility for deployment
   */
  StartrailRegistryCreateSRRFromLicensedUserWithCid = 'StartrailRegistryCreateSRRFromLicensedUserWithCid',
  /**
   * Deprecated StartrailRegistryCreateSRR type. Backward compatibility for deployment
   */
  StartrailRegistryCreateSRRFromLicensedUserWithRoyalty = 'StartrailRegistryCreateSRRFromLicensedUserWithRoyalty',
  /**
   * Latest StartrailRegistryCreateSRR type
   */
  StartrailRegistryCreateSRRFromLicensedUserWithIPFSAndRoyalty = 'StartrailRegistryCreateSRRFromLicensedUserWithIPFSAndRoyalty',
  /**
   * Latest StartrailRegistryUpdateSRR type
   */
  StartrailRegistryUpdateSRR = 'StartrailRegistryUpdateSRR',
  /**
   * Deprecated StartrailRegistryUpdateSRRMetadata type. Backward compatibility for deployment
   */
  StartrailRegistryUpdateSRRMetadata = 'StartrailRegistryUpdateSRRMetadata',
  /**
   * Latest StartrailRegistryUpdateSRRMetadata type
   */
  StartrailRegistryUpdateSRRMetadataWithCid = 'StartrailRegistryUpdateSRRMetadataWithCid',
  /**
   * Latest StartrailRegistryUpdateSRRRoyalty type
   */
  StartrailRegistryUpdateSRRRoyalty = 'StartrailRegistryUpdateSRRRoyalty',
  /**
   * Deprecated StartrailRegistryApproveSRRByCommitment type. Backward compatibility for deployment
   */
  StartrailRegistryApproveSRRByCommitment = 'StartrailRegistryApproveSRRByCommitment',
  /**
   * Latest StartrailRegistryApproveSRRByCommitment type
   */
  StartrailRegistryApproveSRRByCommitmentV2 = 'StartrailRegistryApproveSRRByCommitmentV2',
  /**
   * Deprecated StartrailRegistryApproveSRRByCommitmentWithCustomHistoryId type. Backward compatibility for deployment
   */
  StartrailRegistryApproveSRRByCommitmentWithCustomHistoryId = 'StartrailRegistryApproveSRRByCommitmentWithCustomHistoryId',
  /**
   * Latest StartrailRegistryApproveSRRByCommitmentWithCustomHistoryId type
   */
  StartrailRegistryApproveSRRByCommitmentWithCustomHistoryIdV2 = 'StartrailRegistryApproveSRRByCommitmentWithCustomHistoryIdV2',
  /**
   * Latest StartrailRegistryApproveSRRByCommitmentWithCustomHistoryId type
   */
  StartrailRegistryCancelSRRCommitment = 'StartrailRegistryCancelSRRCommitment',
  /**
   * Latest StartrailRegistryApproveSRRByCommitmentWithCustomHistoryId type
   */
  StartrailRegistryAddHistory = 'StartrailRegistryAddHistory',
  /**
   * Latest StartrailRegistrySetLockExternalTransfer type
   */
  StartrailRegistrySetLockExternalTransfer = 'StartrailRegistrySetLockExternalTransfer',
  /**
   * Deprecated StartrailRegistryTransferFromWithProvenance type. Backward compatibility for deployment
   */
  StartrailRegistryTransferFromWithProvenance = 'StartrailRegistryTransferFromWithProvenance',
  /**
   * Latest StartrailRegistryTransferFromWithProvenance type
   */
  StartrailRegistryTransferFromWithProvenanceV2 = 'StartrailRegistryTransferFromWithProvenanceV2',

  // BulkIssue and BulkTransfer
  // backward compatibility for deployment
  /**
   * Deprecated BulkIssueSendBatch type. Backward compatibility for deployment
   */
  BulkIssueSendBatch = 'BulkIssueSendBatch',
  /**
   * Deprecated BulkIssueSendBatch type. Backward compatibility for deployment
   */
  BulkTransferSendBatch = 'BulkTransferSendBatch',
  // Generalized Bulk
  /**
   * Latest BulkSendBatch type
   */
  BulkSendBatch = 'BulkSendBatch',

  // CollectionFactory
  CollectionFactoryCreateCollection = 'CollectionFactoryCreateCollection',

  // Collections
  CollectionCreateSRR = 'CollectionCreateSRR',
  CollectionUpdateSRR = 'CollectionUpdateSRR',
  CollectionUpdateSRRMetadataWithCid = 'CollectionUpdateSRRMetadataWithCid',
  CollectionUpdateSRRRoyalty = 'CollectionUpdateSRRRoyalty',
  CollectionApproveSRRByCommitmentV2 = 'CollectionApproveSRRByCommitmentV2',
  CollectionApproveSRRByCommitmentWithCustomHistoryIdV2 = 'CollectionApproveSRRByCommitmentWithCustomHistoryIdV2',
  CollectionCancelSRRCommitment = 'CollectionCancelSRRCommitment',
  CollectionAddHistory = 'CollectionAddHistory',
  CollectionSetLockExternalTransfer = 'CollectionSetLockExternalTransfer',
  CollectionTransferFromWithProvenanceV2 = 'CollectionTransferFromWithProvenanceV2',
  CollectionTransferOwnership = 'CollectionTransferOwnership',
}

export { DestinationContract, MetaTxRequest, MetaTxRequestType }
