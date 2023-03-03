# LockExternalTransferFeature



> Feature that enables standard ERC721 transfer methods to be disabled   for a given token.





## Methods

### getLockExternalTransfer

```solidity
function getLockExternalTransfer(uint256 tokenId) external view returns (bool)
```



*Get the flag setting for a given token id*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | NFT id |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | Flag value |

### setLockExternalTransfer

```solidity
function setLockExternalTransfer(uint256 tokenId, bool flag) external nonpayable
```



*Set the lock flag for the given tokenId*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | NFT id |
| flag | bool | bool of the flag to disable standard ERC721 transfer methods |



## Events

### LockExternalTransferSetLock

```solidity
event LockExternalTransferSetLock(uint256 indexed tokenId, bool flag)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId `indexed` | uint256 | undefined |
| flag  | bool | undefined |



## Errors

### NotOwner

```solidity
error NotOwner()
```






### NotTrustedForwarder

```solidity
error NotTrustedForwarder()
```






### TokenNotExists

```solidity
error TokenNotExists()
```







