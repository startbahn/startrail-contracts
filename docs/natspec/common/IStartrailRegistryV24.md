# IStartrailRegistryV24









## Methods

### addCustomHistoryType

```solidity
function addCustomHistoryType(string historyTypeName) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| historyTypeName | string | undefined |

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
function approveSRRByCommitment(uint256 tokenId, bytes32 commitment, string historyMetadataHash) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | undefined |
| commitment | bytes32 | undefined |
| historyMetadataHash | string | undefined |

### approveSRRByCommitment

```solidity
function approveSRRByCommitment(uint256 tokenId, bytes32 commitment, string historyMetadataHash, uint256 customHistoryId) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | undefined |
| commitment | bytes32 | undefined |
| historyMetadataHash | string | undefined |
| customHistoryId | uint256 | undefined |

### approveSRRByCommitmentFromBulk

```solidity
function approveSRRByCommitmentFromBulk(address luwAddress, uint256 tokenId, bytes32 commitment, string historyMetadataHash, uint256 customHistoryId) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| luwAddress | address | undefined |
| tokenId | uint256 | undefined |
| commitment | bytes32 | undefined |
| historyMetadataHash | string | undefined |
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

### createSRRFromBulk

```solidity
function createSRRFromBulk(bool isPrimaryIssuer, address artistAddress, string metadataCID, address issuerAddress, bool lockExternalTransfer, address royaltyReceiver, uint16 royaltyBasisPoints) external nonpayable returns (uint256)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| isPrimaryIssuer | bool | undefined |
| artistAddress | address | undefined |
| metadataCID | string | undefined |
| issuerAddress | address | undefined |
| lockExternalTransfer | bool | undefined |
| royaltyReceiver | address | undefined |
| royaltyBasisPoints | uint16 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined |

### createSRRFromBulk

```solidity
function createSRRFromBulk(bool isPrimaryIssuer, address artistAddress, bytes32 metadataDigest, string metadataCID, address issuerAddress, bool lockExternalTransfer, address royaltyReceiver, uint16 royaltyBasisPoints) external nonpayable returns (uint256)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| isPrimaryIssuer | bool | undefined |
| artistAddress | address | undefined |
| metadataDigest | bytes32 | undefined |
| metadataCID | string | undefined |
| issuerAddress | address | undefined |
| lockExternalTransfer | bool | undefined |
| royaltyReceiver | address | undefined |
| royaltyBasisPoints | uint16 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined |

### createSRRFromLicensedUser

```solidity
function createSRRFromLicensedUser(bool isPrimaryIssuer, address artistAddress, string metadataCID, bool lockExternalTransfer, address to, address royaltyReceiver, uint16 royaltyBasisPoints) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| isPrimaryIssuer | bool | undefined |
| artistAddress | address | undefined |
| metadataCID | string | undefined |
| lockExternalTransfer | bool | undefined |
| to | address | undefined |
| royaltyReceiver | address | undefined |
| royaltyBasisPoints | uint16 | undefined |

### createSRRFromLicensedUser

```solidity
function createSRRFromLicensedUser(bool isPrimaryIssuer, address artistAddress, bytes32 metadataDigest, string metadataCID, bool lockExternalTransfer, address to, address royaltyReceiver, uint16 royaltyBasisPoints) external nonpayable
```

Functions



#### Parameters

| Name | Type | Description |
|---|---|---|
| isPrimaryIssuer | bool | undefined |
| artistAddress | address | undefined |
| metadataDigest | bytes32 | undefined |
| metadataCID | string | undefined |
| lockExternalTransfer | bool | undefined |
| to | address | undefined |
| royaltyReceiver | address | undefined |
| royaltyBasisPoints | uint16 | undefined |

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
function getSRR(uint256 tokenId) external view returns (struct IStartrailRegistryV24.SRR registryRecord, bytes32 metadataDigest, string metadataCID)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| registryRecord | IStartrailRegistryV24.SRR | undefined |
| metadataDigest | bytes32 | undefined |
| metadataCID | string | undefined |

### getSRRCommitment

```solidity
function getSRRCommitment(uint256 tokenId) external view returns (bytes32 commitment, string historyMetadataHash, uint256 customHistoryId)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| commitment | bytes32 | undefined |
| historyMetadataHash | string | undefined |
| customHistoryId | uint256 | undefined |

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
function transferFromWithProvenance(address to, uint256 tokenId, string historyMetadataHash, uint256 customHistoryId, bool isIntermediary) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| to | address | undefined |
| tokenId | uint256 | undefined |
| historyMetadataHash | string | undefined |
| customHistoryId | uint256 | undefined |
| isIntermediary | bool | undefined |

### transferFromWithProvenanceFromBulk

```solidity
function transferFromWithProvenanceFromBulk(address luwAddress, address to, uint256 tokenId, string historyMetadataHash, uint256 customHistoryId, bool isIntermediary) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| luwAddress | address | undefined |
| to | address | undefined |
| tokenId | uint256 | undefined |
| historyMetadataHash | string | undefined |
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

### updateCustomHistory

```solidity
function updateCustomHistory(uint256 customHistoryId, string name, bytes32 metadataDigest) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| customHistoryId | uint256 | undefined |
| name | string | undefined |
| metadataDigest | bytes32 | undefined |

### updateCustomHistory

```solidity
function updateCustomHistory(uint256 customHistoryId, string name, string metadataCID) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| customHistoryId | uint256 | undefined |
| name | string | undefined |
| metadataCID | string | undefined |

### updateSRR

```solidity
function updateSRR(uint256 tokenId, bool isPrimaryIssuer, address artistAddress) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | undefined |
| isPrimaryIssuer | bool | undefined |
| artistAddress | address | undefined |

### updateSRRMetadata

```solidity
function updateSRRMetadata(uint256 tokenId, string metadataCID) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | undefined |
| metadataCID | string | undefined |

### updateSRRRoyalty

```solidity
function updateSRRRoyalty(uint256 tokenId, address royaltyReceiver, uint16 royaltyBasisPoints) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | undefined |
| royaltyReceiver | address | undefined |
| royaltyBasisPoints | uint16 | undefined |

### updateSRRRoyaltyReceiverMulti

```solidity
function updateSRRRoyaltyReceiverMulti(uint256[] tokenIds, address royaltyReceiver) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenIds | uint256[] | undefined |
| royaltyReceiver | address | undefined |

### writeCustomHistory

```solidity
function writeCustomHistory(string name, uint256 historyTypeId, bytes32 metadataDigest) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| name | string | undefined |
| historyTypeId | uint256 | undefined |
| metadataDigest | bytes32 | undefined |

### writeCustomHistory

```solidity
function writeCustomHistory(string name, uint256 historyTypeId, string metadataCID) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| name | string | undefined |
| historyTypeId | uint256 | undefined |
| metadataCID | string | undefined |



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
event CreateSRR(uint256 indexed tokenId, IStartrailRegistryV24.SRR registryRecord, bytes32 metadataDigest, bool lockExternalTransfer)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId `indexed` | uint256 | undefined |
| registryRecord  | IStartrailRegistryV24.SRR | undefined |
| metadataDigest  | bytes32 | undefined |
| lockExternalTransfer  | bool | undefined |

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
event Provenance(uint256 indexed tokenId, address indexed from, address indexed to, uint256 customHistoryId, string historyMetadataHash, string historyMetadataURI)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId `indexed` | uint256 | undefined |
| from `indexed` | address | undefined |
| to `indexed` | address | undefined |
| customHistoryId  | uint256 | undefined |
| historyMetadataHash  | string | undefined |
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

### RoyaltiesSet

```solidity
event RoyaltiesSet(uint256 indexed tokenId, IStartrailRegistryV24.RoyaltyInfo royalty)
```

Royalty events



#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId `indexed` | uint256 | undefined |
| royalty  | IStartrailRegistryV24.RoyaltyInfo | undefined |

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

### UpdateCustomHistory

```solidity
event UpdateCustomHistory(uint256 indexed id, string name, bytes32 metadataDigest)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| id `indexed` | uint256 | undefined |
| name  | string | undefined |
| metadataDigest  | bytes32 | undefined |

### UpdateSRR

```solidity
event UpdateSRR(uint256 indexed tokenId, IStartrailRegistryV24.SRR registryRecord)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId `indexed` | uint256 | undefined |
| registryRecord  | IStartrailRegistryV24.SRR | undefined |

### UpdateSRRMetadataCID

```solidity
event UpdateSRRMetadataCID(uint256 indexed tokenId, string metadataCID)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId `indexed` | uint256 | undefined |
| metadataCID  | string | undefined |

### UpdateSRRMetadataDigest

```solidity
event UpdateSRRMetadataDigest(uint256 indexed tokenId, string metadataCID)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId `indexed` | uint256 | undefined |
| metadataCID  | string | undefined |



