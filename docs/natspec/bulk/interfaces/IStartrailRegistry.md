# IStartrailRegistry









## Methods

### approveSRRByCommitmentFromBulk

```solidity
function approveSRRByCommitmentFromBulk(address signer, uint256 tokenId, bytes32 commitment, string historyMetadataHash, uint256 customHistoryId) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| signer | address | undefined |
| tokenId | uint256 | undefined |
| commitment | bytes32 | undefined |
| historyMetadataHash | string | undefined |
| customHistoryId | uint256 | undefined |

### createSRRFromBulk

```solidity
function createSRRFromBulk(bool isPrimaryIssuer, address artistAddress, string metadataCID, address issuerAddress, bool lockExternalTransfer, address to, address royaltyReceiver, uint16 royaltyBasisPoints) external nonpayable returns (uint256)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| isPrimaryIssuer | bool | undefined |
| artistAddress | address | undefined |
| metadataCID | string | undefined |
| issuerAddress | address | undefined |
| lockExternalTransfer | bool | undefined |
| to | address | undefined |
| royaltyReceiver | address | undefined |
| royaltyBasisPoints | uint16 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined |

### transferFromWithProvenanceFromBulk

```solidity
function transferFromWithProvenanceFromBulk(address signer, address to, uint256 tokenId, string metadataCID, uint256 customHistoryId, bool isIntermediary) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| signer | address | undefined |
| to | address | undefined |
| tokenId | uint256 | undefined |
| metadataCID | string | undefined |
| customHistoryId | uint256 | undefined |
| isIntermediary | bool | undefined |




