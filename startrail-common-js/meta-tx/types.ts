import { TypedDataField } from '@ethersproject/abstract-signer'

type DestinationContract =
  | 'StartrailRegistry'
  | 'LicensedUserManager'
  | 'BulkIssue'
  | 'BulkTransfer'
  | 'Bulk'

interface MetaTxRequest {
  // EIP712 hash and types
  eip712TypeHash: string
  eip712Types: ReadonlyArray<TypedDataField>
  // Contract to send the transaction to
  destinationContract: DestinationContract
  // Solidity 4 byte / 8 hex digit function signature
  contractFunctionSigHash: string
  // Function name or signature (eg. 'setOwner' or 'setOwner(address)')
  functionNameOrSig: string
  // eip712 'encodeType' substring defining the properties specific to the
  // request. also appearing at the end of the full encodeType (thus 'suffix')
  suffixTypeString: string
  // true if the request includes a 'data' field containing calldata
  requiresDataField: boolean
  // true if the contracvt function associated with this request allows admin
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
  StartrailRegistryCreateSRR = 'StartrailRegistryCreateSRR',
  StartrailRegistryCreateSRRWithLockExternalTransfer = 'StartrailRegistryCreateSRRWithLockExternalTransfer',
  StartrailRegistryCreateSRRFromLicensedUser = 'StartrailRegistryCreateSRRFromLicensedUser',
  StartrailRegistryUpdateSRR = 'StartrailRegistryUpdateSRR',
  StartrailRegistryUpdateSRRMetadata = 'StartrailRegistryUpdateSRRMetadata',
  StartrailRegistryApproveSRRByCommitment = 'StartrailRegistryApproveSRRByCommitment',
  StartrailRegistryApproveSRRByCommitmentWithCustomHistoryId = 'StartrailRegistryApproveSRRByCommitmentWithCustomHistoryId',
  StartrailRegistryCancelSRRCommitment = 'StartrailRegistryCancelSRRCommitment',
  StartrailRegistryAddHistory = 'StartrailRegistryAddHistory',
  StartrailRegistrySetLockExternalTransfer = 'StartrailRegistrySetLockExternalTransfer',
  StartrailRegistryTransferFromWithProvenance = 'StartrailRegistryTransferFromWithProvenance',

  // BulkIssue
  BulkIssueSendBatch = 'BulkIssueSendBatch',
  // BulkTransfer
  BulkTransferSendBatch = 'BulkTransferSendBatch',
  // Generalized Bulk
  BulkSendBatch = 'BulkSendBatch',
}

export { DestinationContract, MetaTxRequest, MetaTxRequestType }
