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

### owner

```solidity
function owner() external view returns (address)
```

get the ERC173 contract owner




#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | conrtact owner |

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

### OwnershipTransferred

```solidity
event OwnershipTransferred(address indexed previousOwner, address indexed newOwner)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| previousOwner `indexed` | address | undefined |
| newOwner `indexed` | address | undefined |



