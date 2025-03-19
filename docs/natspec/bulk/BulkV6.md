# BulkV6









## Methods

### approveSRRByCommitmentWithProof

```solidity
function approveSRRByCommitmentWithProof(bytes32[] merkleProof, bytes32 merkleRoot, bytes32 leafHash, uint256 tokenId, bytes32 commitment, string historyMetadataHash, uint256 customHistoryId, address contractAddress) external nonpayable
```



*ApproveSRRByCommitment with merkle proof including collection contract address*

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
| contractAddress | address | Collection address or zero address if for StartrailRegistry |

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
function createSRRWithProofMulti(bytes32[][] merkleProofs, bytes32 merkleRoot, bytes32[] leafHashes, bool[] isPrimaryIssuers, address[] artistAddresses, string[] metadataCIDs, bool[] lockExternalTransfers, address[] royaltyReceivers, uint16[] royaltyBasisPoints, address[] contractAddresses) external nonpayable returns (uint256[] tokenIds)
```



*Creates multiple SRRs with or without Collection with merkle proofs (deprecated form)*

#### Parameters

| Name | Type | Description |
|---|---|---|
| merkleProofs | bytes32[][] | list of bytes32 of merkle proof value |
| merkleRoot | bytes32 | bytes32 of merkle root value |
| leafHashes | bytes32[] | list of bytes32 of merkle tree leaf |
| isPrimaryIssuers | bool[] | list of primary issuer flags |
| artistAddresses | address[] | list of address of artist |
| metadataCIDs | string[] | list of ipfs cid |
| lockExternalTransfers | bool[] | list of lock transfer flags |
| royaltyReceivers | address[] | list of royalty receiver |
| royaltyBasisPoints | uint16[] | list of royalty basis points |
| contractAddresses | address[] | list of collection addresses or zero address if for StartrailRegistry |

#### Returns

| Name | Type | Description |
|---|---|---|
| tokenIds | uint256[] | undefined |

### createSRRWithProofMulti

```solidity
function createSRRWithProofMulti(bytes32[][] merkleProofs, bytes32 merkleRoot, bytes32[] leafHashes, bool[] isPrimaryIssuers, address[] artistAddresses, string[] metadataCIDs, bool[] lockExternalTransfers, address[] tos, address[] royaltyReceivers, uint16[] royaltyBasisPoints, address[] contractAddresses) external nonpayable returns (uint256[] tokenIds)
```



*Creates multiple SRRs with or without Collection with merkle proofs*

#### Parameters

| Name | Type | Description |
|---|---|---|
| merkleProofs | bytes32[][] | list of bytes32 of merkle proof value |
| merkleRoot | bytes32 | bytes32 of merkle root value |
| leafHashes | bytes32[] | list of bytes32 of merkle tree leaf |
| isPrimaryIssuers | bool[] | list of primary issuer flags |
| artistAddresses | address[] | list of address of artist |
| metadataCIDs | string[] | list of ipfs cid |
| lockExternalTransfers | bool[] | list of lock transfer flags |
| tos | address[] | list of the address that the token will be transferred to after the creation |
| royaltyReceivers | address[] | list of royalty receiver |
| royaltyBasisPoints | uint16[] | list of royalty basis points |
| contractAddresses | address[] | list of collection addresses or zero address if for StartrailRegistry |

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



*set address of the trusted forwarder.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| forwarder | address | undefined |

### transferFromWithProvenanceWithProof

```solidity
function transferFromWithProvenanceWithProof(bytes32[] merkleProof, bytes32 merkleRoot, bytes32 leafHash, address to, uint256 tokenId, string historyMetadataHash, uint256 customHistoryId, bool isIntermediary, address contractAddress) external nonpayable
```



*TransferFromWithProvenance with merkle proof*

#### Parameters

| Name | Type | Description |
|---|---|---|
| merkleProof | bytes32[] | bytes32 of merkle proof value |
| merkleRoot | bytes32 | bytes32 of merkle root value |
| leafHash | bytes32 | bytes32 of merkle tree leaf |
| to | address | address to receive the ownership of the given token ID |
| tokenId | uint256 | uint256 of StartrailRegistryRecordID |
| historyMetadataHash | string | string of metadata hash |
| customHistoryId | uint256 | uint256 customHistoryId |
| isIntermediary | bool | bool isIntermediary |
| contractAddress | address | Collection address or zero address if for StartrailRegistry |



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



