# ISRRApproveTransferFeatureV04







*Events and Functions for the approve and transfer by commit reveal scheme.*

## Methods

### approveSRRByCommitment

```solidity
function approveSRRByCommitment(uint256 tokenId, bytes32 commitment, string historyMetadataHash) external nonpayable
```



*Register an approval to transfer ownership by commitment scheme*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | SRR id |
| commitment | bytes32 | commitment hash |
| historyMetadataHash | string | history metadata digest or cid |

### approveSRRByCommitment

```solidity
function approveSRRByCommitment(uint256 tokenId, bytes32 commitment, string historyMetadataHash, uint256 customHistoryId) external nonpayable
```



*Register an approval to transfer ownership by commitment scheme*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | SRR id |
| commitment | bytes32 | commitment hash |
| historyMetadataHash | string | history metadata digest or cid |
| customHistoryId | uint256 | custom history to link the transfer too |

### cancelSRRCommitment

```solidity
function cancelSRRCommitment(uint256 tokenId) external nonpayable
```



*Cancels an approval by commitment*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | SRR id |

### getSRRCommitment

```solidity
function getSRRCommitment(uint256 tokenId) external view returns (bytes32 commitment, string historyMetadataHash, uint256 customHistoryId)
```



*Gets details of an approval by commitment*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | SRR id |

#### Returns

| Name | Type | Description |
|---|---|---|
| commitment | bytes32 | hash of reveal |
| historyMetadataHash | string | hash of metadata for transfer details |
| customHistoryId | uint256 | (optional) custom history to association |

### transferSRRByReveal

```solidity
function transferSRRByReveal(address to, bytes32 reveal, uint256 tokenId, bool isIntermediary) external nonpayable
```



*Transfers ownership by reveal hash*

#### Parameters

| Name | Type | Description |
|---|---|---|
| to | address | new owner |
| reveal | bytes32 | hash of this value must equal the commitment in the approval step |
| tokenId | uint256 | SRR id |
| isIntermediary | bool | true if party performing the transfer is an intermediatary |



## Events

### SRRCommitment

```solidity
event SRRCommitment(uint256 indexed tokenId, bytes32 indexed commitment, uint256 indexed customHistoryId)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId `indexed` | uint256 | undefined |
| commitment `indexed` | bytes32 | undefined |
| customHistoryId `indexed` | uint256 | undefined |

### SRRCommitmentCancelled

```solidity
event SRRCommitmentCancelled(uint256 indexed tokenId)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId `indexed` | uint256 | undefined |



