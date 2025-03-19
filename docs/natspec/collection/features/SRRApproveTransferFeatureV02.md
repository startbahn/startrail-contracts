# SRRApproveTransferFeatureV02



> Feature implementing approve and transfer by commitment.



*Enables token ownership transfers by a commitment scheme (see https://en.wikipedia.org/wiki/Commitment_scheme). The owner generates a secret reveal and hashes it with keccak256 to create the commitment hash. They then sign and execute an approveSRRByCommitment(). Later the reveal hash is given to a buyer / new owner or intermiediatary who can execute transferByReveal to transfer ownership.*

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

### Provenance

```solidity
event Provenance(uint256 indexed tokenId, address indexed from, address indexed to, uint256 customHistoryId, string historyMetadataHash, string historyMetadataURI, bool isIntermediary)
```

Events



#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId `indexed` | uint256 | undefined |
| from `indexed` | address | undefined |
| to `indexed` | address | undefined |
| customHistoryId  | uint256 | undefined |
| historyMetadataHash  | string | undefined |
| historyMetadataURI  | string | undefined |
| isIntermediary  | bool | undefined |

### SRRCommitment

```solidity
event SRRCommitment(uint256 indexed tokenId, bytes32 indexed commitment, uint256 indexed customHistoryId)
```

Events



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

### Transfer

```solidity
event Transfer(address indexed from, address indexed to, uint256 indexed id)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| from `indexed` | address | undefined |
| to `indexed` | address | undefined |
| id `indexed` | uint256 | undefined |



## Errors

### CustomHistoryDoesNotExist

```solidity
error CustomHistoryDoesNotExist()
```






### IncorrectRevealHash

```solidity
error IncorrectRevealHash()
```






### NotSRROwner

```solidity
error NotSRROwner()
```






### SRRNotExists

```solidity
error SRRNotExists()
```







