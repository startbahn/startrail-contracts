# BulkTransferV1









## Methods

### approveSRRByCommitmentWithProof

```solidity
function approveSRRByCommitmentWithProof(bytes32[] merkleProof, bytes32 merkleRoot, bytes32 srrApproveHash, uint256 tokenId, bytes32 commitment, string historyMetadataDigest, uint256 customHistoryId) external nonpayable
```



*ApproveSRRByCommitment with merkle proof*

#### Parameters

| Name | Type | Description |
|---|---|---|
| merkleProof | bytes32[] | bytes32 of merkle proof value |
| merkleRoot | bytes32 | bytes32 of merkle root value |
| srrApproveHash | bytes32 | bytes32 of merkle tree leaf |
| tokenId | uint256 | uint256 of StartrailRegistryRecordID |
| commitment | bytes32 | bytes32 of the commitment hash |
| historyMetadataDigest | string | string of metadata hash |
| customHistoryId | uint256 | uint256 customHistoryId |

### batches

```solidity
function batches(bytes32) external view returns (bool prepared, address sender, uint8 processedCount)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| _0 | bytes32 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| prepared | bool | undefined |
| sender | address | undefined |
| processedCount | uint8 | undefined |

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

### verifyApproveSRRByCommitmentHash

```solidity
function verifyApproveSRRByCommitmentHash(bytes32 srrApproveHash, uint256 tokenId, bytes32 commitment, string historyMetadataDigest, uint256 customHistoryId) external pure returns (bool hashMatches)
```



*Verify the hash of the params for approveSRRByCommitment*

#### Parameters

| Name | Type | Description |
|---|---|---|
| srrApproveHash | bytes32 | bytes32 of hash value of all other params |
| tokenId | uint256 | uint256 of StartrailRegistryRecordID |
| commitment | bytes32 | bytes32 of the commitment hash |
| historyMetadataDigest | string | string of metadata hash |
| customHistoryId | uint256 | uint256 customHistoryId |

#### Returns

| Name | Type | Description |
|---|---|---|
| hashMatches | bool | undefined |



## Events

### ApproveSRRByCommitmentWithProof

```solidity
event ApproveSRRByCommitmentWithProof(bytes32 indexed merkleRoot, uint256 indexed tokenId, bytes32 srrApproveHash)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| merkleRoot `indexed` | bytes32 | undefined |
| tokenId `indexed` | uint256 | undefined |
| srrApproveHash  | bytes32 | undefined |

### BatchPrepared

```solidity
event BatchPrepared(bytes32 indexed merkleRoot, address indexed sender)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| merkleRoot `indexed` | bytes32 | undefined |
| sender `indexed` | address | undefined |

### Initialized

```solidity
event Initialized(uint8 version)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| version  | uint8 | undefined |



