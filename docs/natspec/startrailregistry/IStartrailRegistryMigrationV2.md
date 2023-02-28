# IStartrailRegistryMigrationV2



> IStartrailRegistryMigrationV2 - events from the migration



*Events required to migrate tokens to the new chain. The functions      were removed for this V2 version.*


## Events

### CreateCustomHistoryFromMigration

```solidity
event CreateCustomHistoryFromMigration(uint256 indexed id, string name, uint256 customHistoryTypeId, bytes32 metadataDigest, string originChain, uint256 originTimestamp, bytes32 originTxHash)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| id `indexed` | uint256 | undefined |
| name  | string | undefined |
| customHistoryTypeId  | uint256 | undefined |
| metadataDigest  | bytes32 | undefined |
| originChain  | string | undefined |
| originTimestamp  | uint256 | undefined |
| originTxHash  | bytes32 | undefined |

### CreateSRRFromMigration

```solidity
event CreateSRRFromMigration(uint256 indexed tokenId, IStartrailRegistryV1.SRR registryRecord, bytes32 metadataDigest, uint256 originTimestamp, bytes32 originTxHash)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId `indexed` | uint256 | undefined |
| registryRecord  | IStartrailRegistryV1.SRR | undefined |
| metadataDigest  | bytes32 | undefined |
| originTimestamp  | uint256 | undefined |
| originTxHash  | bytes32 | undefined |

### MigrateSRR

```solidity
event MigrateSRR(uint256 indexed tokenId, string originChain)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId `indexed` | uint256 | undefined |
| originChain  | string | undefined |

### ProvenanceFromMigration

```solidity
event ProvenanceFromMigration(uint256 indexed tokenId, address indexed from, address indexed to, uint256 timestamp, uint256 customHistoryId, string historyMetadataDigest, string historyMetadataURI, uint256 originTimestamp, bytes32 originTxHash)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId `indexed` | uint256 | undefined |
| from `indexed` | address | undefined |
| to `indexed` | address | undefined |
| timestamp  | uint256 | undefined |
| customHistoryId  | uint256 | undefined |
| historyMetadataDigest  | string | undefined |
| historyMetadataURI  | string | undefined |
| originTimestamp  | uint256 | undefined |
| originTxHash  | bytes32 | undefined |

### SRRCommitmentCancelledFromMigration

```solidity
event SRRCommitmentCancelledFromMigration(uint256 tokenId, uint256 originTimestamp, bytes32 originTxHash)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId  | uint256 | undefined |
| originTimestamp  | uint256 | undefined |
| originTxHash  | bytes32 | undefined |

### SRRCommitmentFromMigration

```solidity
event SRRCommitmentFromMigration(address owner, bytes32 commitment, uint256 tokenId, uint256 customHistoryId, uint256 originTimestamp, bytes32 originTxHash)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| owner  | address | undefined |
| commitment  | bytes32 | undefined |
| tokenId  | uint256 | undefined |
| customHistoryId  | uint256 | undefined |
| originTimestamp  | uint256 | undefined |
| originTxHash  | bytes32 | undefined |

### TransferFromMigration

```solidity
event TransferFromMigration(address indexed from, address indexed to, uint256 indexed tokenId, uint256 originTimestamp, bytes32 originTxHash)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| from `indexed` | address | undefined |
| to `indexed` | address | undefined |
| tokenId `indexed` | uint256 | undefined |
| originTimestamp  | uint256 | undefined |
| originTxHash  | bytes32 | undefined |

### UpdateSRRFromMigration

```solidity
event UpdateSRRFromMigration(uint256 indexed tokenId, IStartrailRegistryV1.SRR registryRecord, uint256 originTimestamp, bytes32 originTxHash)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId `indexed` | uint256 | undefined |
| registryRecord  | IStartrailRegistryV1.SRR | undefined |
| originTimestamp  | uint256 | undefined |
| originTxHash  | bytes32 | undefined |

### UpdateSRRMetadataDigestFromMigration

```solidity
event UpdateSRRMetadataDigestFromMigration(uint256 indexed tokenId, bytes32 metadataDigest, uint256 originTimestamp, bytes32 originTxHash)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId `indexed` | uint256 | undefined |
| metadataDigest  | bytes32 | undefined |
| originTimestamp  | uint256 | undefined |
| originTxHash  | bytes32 | undefined |



