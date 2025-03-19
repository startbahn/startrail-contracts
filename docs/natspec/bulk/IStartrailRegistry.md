# IStartrailRegistry









## Methods

### approveSRRByCommitmentFromBulk

```solidity
function approveSRRByCommitmentFromBulk(uint256 tokenId, bytes32 commitment, string historyMetadataHash, uint256 customHistoryId) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | undefined |
| commitment | bytes32 | undefined |
| historyMetadataHash | string | undefined |
| customHistoryId | uint256 | undefined |

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

### transferFromWithProvenanceFromBulk

```solidity
function transferFromWithProvenanceFromBulk(address to, uint256 tokenId, string metadataCID, uint256 customHistoryId, bool isIntermediary) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| to | address | undefined |
| tokenId | uint256 | undefined |
| metadataCID | string | undefined |
| customHistoryId | uint256 | undefined |
| isIntermediary | bool | undefined |




