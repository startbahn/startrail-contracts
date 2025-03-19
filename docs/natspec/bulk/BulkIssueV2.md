# BulkIssueV2









## Methods

### batches

```solidity
function batches(bytes32) external view returns (bool prepared, address issuer, uint8 processedCount)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| _0 | bytes32 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| prepared | bool | undefined |
| issuer | address | undefined |
| processedCount | uint8 | undefined |

### createSRRWithProof

```solidity
function createSRRWithProof(bytes32[] merkleProof, bytes32 merkleRoot, bytes32 srrHash, bool isPrimaryIssuer, address artistAddress, bytes32 metadataDigest) external nonpayable returns (uint256 tokenId)
```



*Creates SRR with merkle proof This method exists for backward compatibility. We plan to remove it in a future release.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| merkleProof | bytes32[] | bytes32 of merkle proof value |
| merkleRoot | bytes32 | bytes32 of merkle root value |
| srrHash | bytes32 | bytes32 of merkle tree leaf |
| isPrimaryIssuer | bool | boolean whether the user is a primary issuer |
| artistAddress | address | address of the artist contract |
| metadataDigest | bytes32 | bytes32 of metadata hash |

#### Returns

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | undefined |

### createSRRWithProof

```solidity
function createSRRWithProof(bytes32[] merkleProof, bytes32 merkleRoot, bytes32 srrHash, bool isPrimaryIssuer, address artistAddress, bytes32 metadataDigest, bool lockExternalTransfer) external nonpayable returns (uint256 tokenId)
```



*Creates SRR with merkle proof*

#### Parameters

| Name | Type | Description |
|---|---|---|
| merkleProof | bytes32[] | bytes32 of merkle proof value |
| merkleRoot | bytes32 | bytes32 of merkle root value |
| srrHash | bytes32 | bytes32 of merkle tree leaf |
| isPrimaryIssuer | bool | boolean whether the user is a primary issuer |
| artistAddress | address | address of the artist contract |
| metadataDigest | bytes32 | bytes32 of metadata hash |
| lockExternalTransfer | bool | bool of the flag to disable standard ERC721 transfer methods |

#### Returns

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | undefined |

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

### migrateBatch

```solidity
function migrateBatch(bytes32 merkleRoot, bytes32[] processedLeaves, address issuer, uint256 originTimestampCreated, uint256 originTimestampUpdated) external nonpayable
```



*Creates SRR with merkle proof*

#### Parameters

| Name | Type | Description |
|---|---|---|
| merkleRoot | bytes32 | bytes32 of merkle root value |
| processedLeaves | bytes32[] | bytes32 of all leafs issued so far |
| issuer | address | Batch issuer |
| originTimestampCreated | uint256 | undefined |
| originTimestampUpdated | uint256 | undefined |

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

### verifySRRHash

```solidity
function verifySRRHash(bytes32 srrHash, bool isPrimaryIssuer, address artistAddress, bytes32 metadataDigest) external pure returns (bool hashMatches)
```



*Verify the hash of the params when creating SRR This method exists for backward compatibility. We plan to remove it in a future release.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| srrHash | bytes32 | bytes32 of hash value of all other params |
| isPrimaryIssuer | bool | boolean whether the user is a primary issuer |
| artistAddress | address | address of the artist contract |
| metadataDigest | bytes32 | bytes32 of metadata hash |

#### Returns

| Name | Type | Description |
|---|---|---|
| hashMatches | bool | undefined |

### verifySRRHash

```solidity
function verifySRRHash(bytes32 srrHash, bool isPrimaryIssuer, address artistAddress, bytes32 metadataDigest, bool lockExternalTransfer) external pure returns (bool hashMatches)
```



*Verify the hash of the params when creating SRR This method exists for backward compatibility. We plan to remove it in a future release.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| srrHash | bytes32 | bytes32 of hash value of all other params |
| isPrimaryIssuer | bool | boolean whether the user is a primary issuer |
| artistAddress | address | address of the artist contract |
| metadataDigest | bytes32 | bytes32 of metadata hash |
| lockExternalTransfer | bool | bool of the transfer permission flag to marketplaces |

#### Returns

| Name | Type | Description |
|---|---|---|
| hashMatches | bool | undefined |



## Events

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
event CreateSRRWithProof(bytes32 indexed merkleRoot, uint256 indexed tokenId, bytes32 srrHash)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| merkleRoot `indexed` | bytes32 | undefined |
| tokenId `indexed` | uint256 | undefined |
| srrHash  | bytes32 | undefined |

### Initialized

```solidity
event Initialized(uint8 version)
```



*Triggered when the contract has been initialized or reinitialized.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| version  | uint8 | undefined |

### MigrateBatch

```solidity
event MigrateBatch(bytes32 indexed merkleRoot, bytes32[] processedLeaves, address issuer, uint256 originTimestampCreated, uint256 originTimestampUpdated)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| merkleRoot `indexed` | bytes32 | undefined |
| processedLeaves  | bytes32[] | undefined |
| issuer  | address | undefined |
| originTimestampCreated  | uint256 | undefined |
| originTimestampUpdated  | uint256 | undefined |



