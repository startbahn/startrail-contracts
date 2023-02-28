# IStartrailRegistryV12









## Methods

### addCustomHistoryType

```solidity
function addCustomHistoryType(string historyTypeName) external nonpayable returns (uint256 id)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| historyTypeName | string | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| id | uint256 | undefined |

### addHistory

```solidity
function addHistory(uint256[] tokenIds, uint256[] customHistoryIds) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenIds | uint256[] | undefined |
| customHistoryIds | uint256[] | undefined |

### approveSRRByCommitment

```solidity
function approveSRRByCommitment(uint256 tokenId, bytes32 commitment, string historyMetadataDigest) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | undefined |
| commitment | bytes32 | undefined |
| historyMetadataDigest | string | undefined |

### approveSRRByCommitment

```solidity
function approveSRRByCommitment(uint256 tokenId, bytes32 commitment, string historyMetadataDigest, uint256 customHistoryId) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | undefined |
| commitment | bytes32 | undefined |
| historyMetadataDigest | string | undefined |
| customHistoryId | uint256 | undefined |

### approveSRRByCommitmentFromBulk

```solidity
function approveSRRByCommitmentFromBulk(uint256 tokenId, bytes32 commitment, string historyMetadataDigest, uint256 customHistoryId) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | undefined |
| commitment | bytes32 | undefined |
| historyMetadataDigest | string | undefined |
| customHistoryId | uint256 | undefined |

### cancelSRRCommitment

```solidity
function cancelSRRCommitment(uint256 tokenId) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | undefined |

### contractURI

```solidity
function contractURI() external view returns (string)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | string | undefined |

### createSRR

```solidity
function createSRR(bool isPrimaryIssuer, address artistAddress, bytes32 metadataDigest, bool lockExternalTransfer) external nonpayable
```

Functions



#### Parameters

| Name | Type | Description |
|---|---|---|
| isPrimaryIssuer | bool | undefined |
| artistAddress | address | undefined |
| metadataDigest | bytes32 | undefined |
| lockExternalTransfer | bool | undefined |

### createSRR

```solidity
function createSRR(bool isPrimaryIssuer, address artistAddress, bytes32 metadataDigest, bool lockExternalTransfer, address to) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| isPrimaryIssuer | bool | undefined |
| artistAddress | address | undefined |
| metadataDigest | bytes32 | undefined |
| lockExternalTransfer | bool | undefined |
| to | address | undefined |

### createSRRFromBulk

```solidity
function createSRRFromBulk(bool isPrimaryIssuer, address artistAddress, bytes32 metadataDigest, address issuerAddress, bool lockExternalTransfer) external nonpayable returns (uint256)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| isPrimaryIssuer | bool | undefined |
| artistAddress | address | undefined |
| metadataDigest | bytes32 | undefined |
| issuerAddress | address | undefined |
| lockExternalTransfer | bool | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined |

### createSRRFromLicensedUser

```solidity
function createSRRFromLicensedUser(bool isPrimaryIssuer, address artistAddress, bytes32 metadataDigest, bool lockExternalTransfer) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| isPrimaryIssuer | bool | undefined |
| artistAddress | address | undefined |
| metadataDigest | bytes32 | undefined |
| lockExternalTransfer | bool | undefined |

### createSRRFromLicensedUser

```solidity
function createSRRFromLicensedUser(bool isPrimaryIssuer, address artistAddress, bytes32 metadataDigest, bool lockExternalTransfer, address to) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| isPrimaryIssuer | bool | undefined |
| artistAddress | address | undefined |
| metadataDigest | bytes32 | undefined |
| lockExternalTransfer | bool | undefined |
| to | address | undefined |

### getCustomHistoryNameById

```solidity
function getCustomHistoryNameById(uint256 id) external view returns (string)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| id | uint256 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | string | undefined |

### getSRR

```solidity
function getSRR(uint256 tokenId) external view returns (struct IStartrailRegistryV12.SRR registryRecord, bytes32 metadataDigest)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| registryRecord | IStartrailRegistryV12.SRR | undefined |
| metadataDigest | bytes32 | undefined |

### getSRRCommitment

```solidity
function getSRRCommitment(uint256 tokenId) external view returns (bytes32 commitment, string historyMetadataDigest, uint256 customHistoryId)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| commitment | bytes32 | undefined |
| historyMetadataDigest | string | undefined |
| customHistoryId | uint256 | undefined |

### getSRROwner

```solidity
function getSRROwner(uint256 tokenId) external view returns (address)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined |

### getTokenId

```solidity
function getTokenId(bytes32 metadataDigest, address artistAddress) external pure returns (uint256)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| metadataDigest | bytes32 | undefined |
| artistAddress | address | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined |

### lockExternalTransfer

```solidity
function lockExternalTransfer(uint256 tokenId) external view returns (bool)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | undefined |

### owner

```solidity
function owner() external view returns (address)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined |

### setContractURI

```solidity
function setContractURI(string _contractURI) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| _contractURI | string | undefined |

### setLockExternalTransfer

```solidity
function setLockExternalTransfer(uint256 tokenId, bool flag) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | undefined |
| flag | bool | undefined |

### setNameRegistryAddress

```solidity
function setNameRegistryAddress(address nameRegistry) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| nameRegistry | address | undefined |

### setTokenURIParts

```solidity
function setTokenURIParts(string URIPrefix, string URIPostfix) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| URIPrefix | string | undefined |
| URIPostfix | string | undefined |

### tokenURI

```solidity
function tokenURI(string metadataDigests) external view returns (string)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| metadataDigests | string | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | string | undefined |

### transferFromWithProvenance

```solidity
function transferFromWithProvenance(address to, uint256 tokenId, string historyMetadataDigest, uint256 customHistoryId, bool isIntermediary) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| to | address | undefined |
| tokenId | uint256 | undefined |
| historyMetadataDigest | string | undefined |
| customHistoryId | uint256 | undefined |
| isIntermediary | bool | undefined |

### transferFromWithProvenanceFromBulk

```solidity
function transferFromWithProvenanceFromBulk(address to, uint256 tokenId, string historyMetadataDigest, uint256 customHistoryId, bool isIntermediary) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| to | address | undefined |
| tokenId | uint256 | undefined |
| historyMetadataDigest | string | undefined |
| customHistoryId | uint256 | undefined |
| isIntermediary | bool | undefined |

### transferOwnership

```solidity
function transferOwnership(address newOwner) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| newOwner | address | undefined |

### transferSRRByReveal

```solidity
function transferSRRByReveal(address to, bytes32 reveal, uint256 tokenId, bool isIntermediary) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| to | address | undefined |
| reveal | bytes32 | undefined |
| tokenId | uint256 | undefined |
| isIntermediary | bool | undefined |

### updateSRRFromLicensedUser

```solidity
function updateSRRFromLicensedUser(uint256 tokenId, bool isPrimaryIssuer, address artistAddress) external nonpayable returns (uint256)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | undefined |
| isPrimaryIssuer | bool | undefined |
| artistAddress | address | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined |

### updateSRRMetadata

```solidity
function updateSRRMetadata(uint256 tokenId, bytes32 metadataDigest) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | undefined |
| metadataDigest | bytes32 | undefined |

### writeCustomHistory

```solidity
function writeCustomHistory(string name, uint256 historyTypeId, bytes32 metadataDigest) external nonpayable returns (uint256 id)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| name | string | undefined |
| historyTypeId | uint256 | undefined |
| metadataDigest | bytes32 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| id | uint256 | undefined |



## Events

### CreateCustomHistory

```solidity
event CreateCustomHistory(uint256 indexed id, string name, uint256 customHistoryTypeId, bytes32 metadataDigest)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| id `indexed` | uint256 | undefined |
| name  | string | undefined |
| customHistoryTypeId  | uint256 | undefined |
| metadataDigest  | bytes32 | undefined |

### CreateCustomHistoryType

```solidity
event CreateCustomHistoryType(uint256 indexed id, string historyType)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| id `indexed` | uint256 | undefined |
| historyType  | string | undefined |

### CreateSRR

```solidity
event CreateSRR(uint256 indexed tokenId, IStartrailRegistryV12.SRR registryRecord, bytes32 metadataDigest)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId `indexed` | uint256 | undefined |
| registryRecord  | IStartrailRegistryV12.SRR | undefined |
| metadataDigest  | bytes32 | undefined |

### History

```solidity
event History(uint256[] tokenIds, uint256[] customHistoryIds)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenIds  | uint256[] | undefined |
| customHistoryIds  | uint256[] | undefined |

### LockExternalTransfer

```solidity
event LockExternalTransfer(uint256 indexed tokenId, bool flag)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId `indexed` | uint256 | undefined |
| flag  | bool | undefined |

### OwnershipTransferred

```solidity
event OwnershipTransferred(address indexed previousOwner, address indexed newOwner)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| previousOwner `indexed` | address | undefined |
| newOwner `indexed` | address | undefined |

### Provenance

```solidity
event Provenance(uint256 indexed tokenId, address indexed from, address indexed to, uint256 customHistoryId, string historyMetadataDigest, string historyMetadataURI)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId `indexed` | uint256 | undefined |
| from `indexed` | address | undefined |
| to `indexed` | address | undefined |
| customHistoryId  | uint256 | undefined |
| historyMetadataDigest  | string | undefined |
| historyMetadataURI  | string | undefined |

### ProvenanceDateMigrationFix

```solidity
event ProvenanceDateMigrationFix(uint256 indexed tokenId, uint256 originTimestamp)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId `indexed` | uint256 | undefined |
| originTimestamp  | uint256 | undefined |

### SRRCommitment

```solidity
event SRRCommitment(uint256 indexed tokenId, address owner, bytes32 commitment, uint256 customHistoryId)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId `indexed` | uint256 | undefined |
| owner  | address | undefined |
| commitment  | bytes32 | undefined |
| customHistoryId  | uint256 | undefined |

### SRRCommitmentCancelled

```solidity
event SRRCommitmentCancelled(uint256 indexed tokenId)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId `indexed` | uint256 | undefined |

### UpdateSRR

```solidity
event UpdateSRR(uint256 indexed tokenId, IStartrailRegistryV12.SRR registryRecord)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId `indexed` | uint256 | undefined |
| registryRecord  | IStartrailRegistryV12.SRR | undefined |

### UpdateSRRMetadataDigest

```solidity
event UpdateSRRMetadataDigest(uint256 indexed tokenId, bytes32 metadataDigest)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId `indexed` | uint256 | undefined |
| metadataDigest  | bytes32 | undefined |



