# CollectionFactoryV01

*Chris Hatch - &lt;chris.hatch@startbahn.jp&gt;*

> Factory for creating Startrail NFT Collection proxies



*see `collection-factory-upgradability.test.ts` for upgrade related          tests that use the hardhat oz upgrades plugin      see `CollectionFactory.t.sol` for general behavior tests*

## Methods

### collectionRegistry

```solidity
function collectionRegistry() external view returns (address)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined |

### createCollectionContract

```solidity
function createCollectionContract(string name, string symbol, bytes32 salt) external nonpayable
```

Create a new Collection Proxy contract



#### Parameters

| Name | Type | Description |
|---|---|---|
| name | string | NFT collection name (eg. &#39;No More Apes&#39;) |
| symbol | string | NFT collection symbol (eg. &#39;NOAPE&#39;) |
| salt | bytes32 | Some bytes32 value to feed into create2. |

### featureRegistry

```solidity
function featureRegistry() external view returns (address)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined |

### initialize

```solidity
function initialize(address featureRegistry_, address collectionProxyImplementation) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| featureRegistry_ | address | undefined |
| collectionProxyImplementation | address | undefined |

### owner

```solidity
function owner() external view returns (address)
```



*Returns the address of the current owner.*


#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined |

### proxiableUUID

```solidity
function proxiableUUID() external view returns (bytes32)
```



*Implementation of the ERC1822 {proxiableUUID} function. This returns the storage slot used by the implementation. It is used to validate the implementation&#39;s compatibility when performing an upgrade. IMPORTANT: A proxy pointing at a proxiable contract should not be considered proxiable itself, because this risks bricking a proxy that upgrades to it, by delegating to itself until out of gas. Thus it is critical that this function revert if invoked through a proxy. This is guaranteed by the `notDelegated` modifier.*


#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bytes32 | undefined |

### renounceOwnership

```solidity
function renounceOwnership() external nonpayable
```



*Leaves the contract without owner. It will not be possible to call `onlyOwner` functions. Can only be called by the current owner. NOTE: Renouncing ownership will leave the contract without an owner, thereby disabling any functionality that is only available to the owner.*


### transferOwnership

```solidity
function transferOwnership(address newOwner) external nonpayable
```



*Transfers ownership of the contract to a new account (`newOwner`). Can only be called by the current owner.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| newOwner | address | undefined |

### upgradeTo

```solidity
function upgradeTo(address newImplementation) external nonpayable
```



*Upgrade the implementation of the proxy to `newImplementation`. Calls {_authorizeUpgrade}. Emits an {Upgraded} event.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| newImplementation | address | undefined |

### upgradeToAndCall

```solidity
function upgradeToAndCall(address newImplementation, bytes data) external payable
```



*Upgrade the implementation of the proxy to `newImplementation`, and subsequently execute the function call encoded in `data`. Calls {_authorizeUpgrade}. Emits an {Upgraded} event.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| newImplementation | address | undefined |
| data | bytes | undefined |



## Events

### AdminChanged

```solidity
event AdminChanged(address previousAdmin, address newAdmin)
```



*Emitted when the admin account has changed.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| previousAdmin  | address | undefined |
| newAdmin  | address | undefined |

### BeaconUpgraded

```solidity
event BeaconUpgraded(address indexed beacon)
```



*Emitted when the beacon is changed.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| beacon `indexed` | address | undefined |

### CollectionCreated

```solidity
event CollectionCreated(address indexed collectionAddress, address indexed ownerAddress, string name, string symbol, bytes32 salt)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| collectionAddress `indexed` | address | undefined |
| ownerAddress `indexed` | address | undefined |
| name  | string | undefined |
| symbol  | string | undefined |
| salt  | bytes32 | undefined |

### Initialized

```solidity
event Initialized(uint8 version)
```



*Triggered when the contract has been initialized or reinitialized.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| version  | uint8 | undefined |

### OwnershipTransferred

```solidity
event OwnershipTransferred(address indexed previousOwner, address indexed newOwner)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| previousOwner `indexed` | address | undefined |
| newOwner `indexed` | address | undefined |

### Upgraded

```solidity
event Upgraded(address indexed implementation)
```



*Emitted when the implementation is upgraded.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| implementation `indexed` | address | undefined |



## Errors

### CollectionProxyImplementationIsNotAContract

```solidity
error CollectionProxyImplementationIsNotAContract()
```






### Factory__FailedDeployment

```solidity
error Factory__FailedDeployment()
```






### FeatureRegistryIsNotAContract

```solidity
error FeatureRegistryIsNotAContract()
```






### NotLicensedUser

```solidity
error NotLicensedUser()
```






### NotTrustedForwarder

```solidity
error NotTrustedForwarder()
```







