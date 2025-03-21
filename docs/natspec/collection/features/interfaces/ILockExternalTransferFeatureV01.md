# ILockExternalTransferFeatureV01







*Flag enabling standard ERC721 transfer methods to be disabled for a given token.*

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




## Errors

### OnlyIssuerOrCollectionOwner

```solidity
error OnlyIssuerOrCollectionOwner()
```







