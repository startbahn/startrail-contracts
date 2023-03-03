# OwnableFeature







*OwnableFeature that is an ERC173 compatible Ownable implementation. It adds an initializer function to set the owner.*

## Methods

### __OwnableFeature_initialize

```solidity
function __OwnableFeature_initialize(address initialOwner) external nonpayable
```



*Ownable initializer*

#### Parameters

| Name | Type | Description |
|---|---|---|
| initialOwner | address | undefined |

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

### OwnableFeatureAlreadyInitialized

```solidity
error OwnableFeatureAlreadyInitialized()
```







