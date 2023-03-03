# CollectionFactory

*Chris Hatch - &lt;chris.hatch@startbahn.jp&gt;*

> Factory for creating Startrail NFT Collection proxies





## Methods

### _collectionRegistry

```solidity
function _collectionRegistry() external view returns (contract CollectionRegistry)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | contract CollectionRegistry | undefined |

### _featureRegistry

```solidity
function _featureRegistry() external view returns (address)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined |

### createCollectionContract

```solidity
function createCollectionContract(string name, string symbol, bytes32 salt, address owner) external nonpayable
```

Create a new Collection Proxy contract NOTE: this is onlyOwner but a new version will replace this for meta tx       relays from LicensedUsers.



#### Parameters

| Name | Type | Description |
|---|---|---|
| name | string | NFT collection name (eg. &#39;No More Apes&#39;) |
| symbol | string | NFT collection symbol (eg. &#39;NOAPE&#39;) |
| salt | bytes32 | Some bytes32 value to feed into create2. |
| owner | address | Owner of the new collection contract. |

### owner

```solidity
function owner() external view returns (address)
```

get the ERC173 contract owner




#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | conrtact owner |

### transferOwnership

```solidity
function transferOwnership(address account) external nonpayable
```

transfer contract ownership to new account



#### Parameters

| Name | Type | Description |
|---|---|---|
| account | address | address of new owner |



## Events

### CollectionCreated

```solidity
event CollectionCreated(addressindexed )
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| _0 `indexed` | address | undefined |

### OwnershipTransferred

```solidity
event OwnershipTransferred(address indexed previousOwner, address indexed newOwner)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| previousOwner `indexed` | address | undefined |
| newOwner `indexed` | address | undefined |



## Errors

### DiamondIsNotAContract

```solidity
error DiamondIsNotAContract()
```







