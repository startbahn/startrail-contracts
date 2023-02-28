# IStartrailRegistryV2









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

### createSRR

```solidity
function createSRR(bool isPrimaryIssuer, address artistAddress, bytes32 metadataDigest) external nonpayable returns (uint256)
```

Functions



#### Parameters

| Name | Type | Description |
|---|---|---|
| isPrimaryIssuer | bool | undefined |
| artistAddress | address | undefined |
| metadataDigest | bytes32 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined |

### createSRRFromBulk

```solidity
function createSRRFromBulk(bool isPrimaryIssuer, address artistAddress, bytes32 metadataDigest, address issuerAddress) external nonpayable returns (uint256)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| isPrimaryIssuer | bool | undefined |
| artistAddress | address | undefined |
| metadataDigest | bytes32 | undefined |
| issuerAddress | address | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined |

### createSRRFromLicensedUser

```solidity
function createSRRFromLicensedUser(bool isPrimaryIssuer, address artistAddress, bytes32 metadataDigest) external nonpayable returns (uint256)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| isPrimaryIssuer | bool | undefined |
| artistAddress | address | undefined |
| metadataDigest | bytes32 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined |

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
function getSRR(uint256 tokenId) external view returns (struct IStartrailRegistryV2.SRR registryRecord, bytes32 metadataDigest)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| registryRecord | IStartrailRegistryV2.SRR | undefined |
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

### transferSRRByReveal

```solidity
function transferSRRByReveal(address to, bytes32 reveal, uint256 tokenId) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| to | address | undefined |
| reveal | bytes32 | undefined |
| tokenId | uint256 | undefined |

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
event CreateSRR(uint256 indexed tokenId, IStartrailRegistryV2.SRR registryRecord, bytes32 metadataDigest)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId `indexed` | uint256 | undefined |
| registryRecord  | IStartrailRegistryV2.SRR | undefined |
| metadataDigest  | bytes32 | undefined |

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
event UpdateSRR(uint256 indexed tokenId, IStartrailRegistryV2.SRR registryRecord)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId `indexed` | uint256 | undefined |
| registryRecord  | IStartrailRegistryV2.SRR | undefined |

### UpdateSRRMetadataDigest

```solidity
event UpdateSRRMetadataDigest(uint256 indexed tokenId, bytes32 metadataDigest)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId `indexed` | uint256 | undefined |
| metadataDigest  | bytes32 | undefined |



