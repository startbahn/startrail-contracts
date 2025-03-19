# BulkV2









## Methods

### approveSRRByCommitmentWithProof

```solidity
function approveSRRByCommitmentWithProof(bytes32[] merkleProof, bytes32 merkleRoot, bytes32 leafHash, uint256 tokenId, bytes32 commitment, string historyMetadataHash, uint256 customHistoryId) external nonpayable
```



*ApproveSRRByCommitment with merkle proof*

#### Parameters

| Name | Type | Description |
|---|---|---|
| merkleProof | bytes32[] | bytes32 of merkle proof value |
| merkleRoot | bytes32 | bytes32 of merkle root value |
| leafHash | bytes32 | bytes32 of merkle tree leaf |
| tokenId | uint256 | uint256 of StartrailRegistryRecordID |
| commitment | bytes32 | bytes32 of the commitment hash |
| historyMetadataHash | string | string of metadata hash |
| customHistoryId | uint256 | uint256 customHistoryId |

### batches

```solidity
function batches(bytes32) external view returns (bool prepared, address signer, uint8 processedCount)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| _0 | bytes32 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| prepared | bool | undefined |
| signer | address | undefined |
| processedCount | uint8 | undefined |

### createSRRWithProofMulti

```solidity
function createSRRWithProofMulti(bytes32[][] merkleProofs, bytes32 merkleRoot, bytes32[] srrHashes, bool[] isPrimaryIssuers, address[] artistAddresses, bytes32[] metadataDigests, bool[] lockExternalTransfers) external nonpayable returns (uint256[] tokenIds)
```

backward compatibility

*Creates multiple SRRs with merkle proofs*

#### Parameters

| Name | Type | Description |
|---|---|---|
| merkleProofs | bytes32[][] | list of bytes32 of merkle proof value |
| merkleRoot | bytes32 | bytes32 of merkle root value |
| srrHashes | bytes32[] | list of bytes32 of merkle tree leaf |
| isPrimaryIssuers | bool[] | list of primary issuer flags |
| artistAddresses | address[] | list of address of artist |
| metadataDigests | bytes32[] | list of metadata hashes |
| lockExternalTransfers | bool[] | list of lock transfer flags |

#### Returns

| Name | Type | Description |
|---|---|---|
| tokenIds | uint256[] | undefined |

### createSRRWithProofMulti

```solidity
function createSRRWithProofMulti(bytes32[][] merkleProofs, bytes32 merkleRoot, bytes32[] srrHashes, bool[] isPrimaryIssuers, address[] artistAddresses, bytes32[] metadataDigests, string[] metadataCIDs, bool[] lockExternalTransfers) external nonpayable returns (uint256[] tokenIds)
```



*Creates multiple SRRs with merkle proofs*

#### Parameters

| Name | Type | Description |
|---|---|---|
| merkleProofs | bytes32[][] | list of bytes32 of merkle proof value |
| merkleRoot | bytes32 | bytes32 of merkle root value |
| srrHashes | bytes32[] | list of bytes32 of merkle tree leaf |
| isPrimaryIssuers | bool[] | list of primary issuer flags |
| artistAddresses | address[] | list of address of artist |
| metadataDigests | bytes32[] | list of metadata hashes |
| metadataCIDs | string[] | list of ipfs cid |
| lockExternalTransfers | bool[] | list of lock transfer flags |

#### Returns

| Name | Type | Description |
|---|---|---|
| tokenIds | uint256[] | undefined |

### getTrustedForwarder

```solidity
function getTrustedForwarder() external view returns (address trustedForwarder)
```



*return address of the trusted forwarder.*


#### Returns

| Name | Type | Description |
|---|---|---|
| trustedForwarder | address | undefined |

### initialize

```solidity
function initialize(address _nameRegistry, address _trustedForwarder) external nonpayable
```



*Initializes the BulkIssue contract*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _nameRegistry | address | undefined |
| _trustedForwarder | address | undefined |

### isTrustedForwarder

```solidity
function isTrustedForwarder(address forwarder) external view returns (bool)
```



*return if the forwarder is trusted to forward relayed transactions to us. the forwarder is required to verify the sender&#39;s signature, and verify the call is not a replay.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| forwarder | address | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | undefined |

### nameRegistryAddress

```solidity
function nameRegistryAddress() external view returns (address)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined |

### prepareBatchFromLicensedUser

```solidity
function prepareBatchFromLicensedUser(bytes32 merkleRoot) external nonpayable
```



*Reserves a batch request before excuting*

#### Parameters

| Name | Type | Description |
|---|---|---|
| merkleRoot | bytes32 | bytes32 of merkle root |

### setTrustedForwarder

```solidity
function setTrustedForwarder(address forwarder) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| forwarder | address | undefined |

### transferFromWithProvenanceWithProof

```solidity
function transferFromWithProvenanceWithProof(bytes32[] merkleProof, bytes32 merkleRoot, bytes32 leafHash, address to, uint256 tokenId, string historyMetadataHash, uint256 customHistoryId, bool isIntermediary) external nonpayable
```



*TransferFromWithProvenance with merkle proof*

#### Parameters

| Name | Type | Description |
|---|---|---|
| merkleProof | bytes32[] | bytes32 of merkle proof value |
| merkleRoot | bytes32 | bytes32 of merkle root value |
| leafHash | bytes32 | bytes32 of merkle tree leaf |
| to | address | undefined |
| tokenId | uint256 | uint256 of StartrailRegistryRecordID |
| historyMetadataHash | string | string of metadata hash |
| customHistoryId | uint256 | uint256 customHistoryId |
| isIntermediary | bool | bool isIntermediary |

### verifyApproveSRRByCommitmentHash

```solidity
function verifyApproveSRRByCommitmentHash(bytes32 leafHash, uint256 tokenId, bytes32 commitment, string historyMetadataHash, uint256 customHistoryId) external pure returns (bool hashMatches)
```



*Verify the hash of the params for approveSRRByCommitment*

#### Parameters

| Name | Type | Description |
|---|---|---|
| leafHash | bytes32 | bytes32 of hash value of all other params |
| tokenId | uint256 | uint256 of StartrailRegistryRecordID |
| commitment | bytes32 | bytes32 of the commitment hash |
| historyMetadataHash | string | string of metadata hash |
| customHistoryId | uint256 | uint256 customHistoryId |

#### Returns

| Name | Type | Description |
|---|---|---|
| hashMatches | bool | undefined |

### verifySRRHash

```solidity
function verifySRRHash(bytes32 srrHash, bool isPrimaryIssuer, address artistAddress, bytes32 metadataDigest, string metadataCID, bool lockExternalTransfer) external pure returns (bool hashMatches)
```



*Verify the hash of the params when creating SRR This method exists for backward compatibility. We plan to remove it in a future release.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| srrHash | bytes32 | bytes32 of hash value of all other params |
| isPrimaryIssuer | bool | boolean whether the user is a primary issuer |
| artistAddress | address | address of the artist contract |
| metadataDigest | bytes32 | bytes32 of metadata hash |
| metadataCID | string | string of ipfs cid |
| lockExternalTransfer | bool | bool of the transfer permission flag to marketplaces |

#### Returns

| Name | Type | Description |
|---|---|---|
| hashMatches | bool | undefined |

### verifyTransferFromWithProvenanceHash

```solidity
function verifyTransferFromWithProvenanceHash(bytes32 leafHash, address to, uint256 tokenId, string historyMetadataHash, uint256 customHistoryId, bool isIntermediary) external pure returns (bool hashMatches)
```



*Verify the hash of the params for transferFromWithProvenance*

#### Parameters

| Name | Type | Description |
|---|---|---|
| leafHash | bytes32 | bytes32 of hash value of all other params |
| to | address | address to receive the ownership of the given token ID |
| tokenId | uint256 | uint256 of StartrailRegistryRecordID |
| historyMetadataHash | string | string of metadata hash |
| customHistoryId | uint256 | uint256 customHistoryId |
| isIntermediary | bool | bool isIntermediary |

#### Returns

| Name | Type | Description |
|---|---|---|
| hashMatches | bool | undefined |



## Events

### ApproveSRRByCommitmentWithProof

```solidity
event ApproveSRRByCommitmentWithProof(bytes32 indexed merkleRoot, uint256 indexed tokenId, bytes32 leafHash)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| merkleRoot `indexed` | bytes32 | undefined |
| tokenId `indexed` | uint256 | undefined |
| leafHash  | bytes32 | undefined |

### BatchPrepared

```solidity
event BatchPrepared(bytes32 indexed merkleRoot, address indexed sender)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| merkleRoot `indexed` | bytes32 | undefined |
| sender `indexed` | address | undefined |

### CreateSRRWithProof

```solidity
event CreateSRRWithProof(bytes32 indexed merkleRoot, uint256 indexed tokenId, bytes32 leafHash)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| merkleRoot `indexed` | bytes32 | undefined |
| tokenId `indexed` | uint256 | undefined |
| leafHash  | bytes32 | undefined |

### Initialized

```solidity
event Initialized(uint8 version)
```



*Triggered when the contract has been initialized or reinitialized.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| version  | uint8 | undefined |

### TransferFromWithProvenanceWithProof

```solidity
event TransferFromWithProvenanceWithProof(bytes32 indexed merkleRoot, uint256 indexed tokenId, bytes32 leafHash)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| merkleRoot `indexed` | bytes32 | undefined |
| tokenId `indexed` | uint256 | undefined |
| leafHash  | bytes32 | undefined |



