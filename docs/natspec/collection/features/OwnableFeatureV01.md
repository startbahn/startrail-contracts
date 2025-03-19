# OwnableFeatureV01







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
| _0 | address | contract owner |

### transferOwnership

```solidity
function transferOwnership(address newOwner) external nonpayable
```

transfer contract ownership to new account



#### Parameters

| Name | Type | Description |
|---|---|---|
| newOwner | address | undefined |



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

### NotCollectionOwner

```solidity
error NotCollectionOwner()
```






### NotTrustedForwarder

```solidity
error NotTrustedForwarder()
```






### OwnableFeatureAlreadyInitialized

```solidity
error OwnableFeatureAlreadyInitialized()
```






### Ownable__NotOwner

```solidity
error Ownable__NotOwner()
```






### Ownable__NotTransitiveOwner

```solidity
error Ownable__NotTransitiveOwner()
```






### ZeroAddress

```solidity
error ZeroAddress()
```







