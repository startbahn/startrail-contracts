# CollectionRegistry

*Chris Hatch - &lt;chris.hatch@startbahn.jp&gt;*

> Registry of Startrail NFT Collection contracts





## Methods

### addCollection

```solidity
function addCollection(address collectionAddress) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| collectionAddress | address | undefined |

### collectionFactory

```solidity
function collectionFactory() external view returns (address)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined |

### registry

```solidity
function registry(address) external view returns (bool)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | undefined |




## Errors

### OnlyCollectionFactory

```solidity
error OnlyCollectionFactory()
```







