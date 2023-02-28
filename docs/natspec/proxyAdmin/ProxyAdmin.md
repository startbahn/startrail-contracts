# ProxyAdmin



> ProxyAdmin



*This contract is the admin of a proxy, and is in charge of upgrading it as well as transferring it to another admin.*

## Methods

### changeProxyAdmin

```solidity
function changeProxyAdmin(contract AdminUpgradeabilityProxy proxy, address newAdmin) external nonpayable
```



*Changes the admin of a proxy.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| proxy | contract AdminUpgradeabilityProxy | Proxy to change admin. |
| newAdmin | address | Address to transfer proxy administration to. |

### getProxyAdmin

```solidity
function getProxyAdmin(contract AdminUpgradeabilityProxy proxy) external view returns (address)
```



*Returns the admin of a proxy. Only the admin can query it.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| proxy | contract AdminUpgradeabilityProxy | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | The address of the current admin of the proxy. |

### getProxyImplementation

```solidity
function getProxyImplementation(contract AdminUpgradeabilityProxy proxy) external view returns (address)
```



*Returns the current implementation of a proxy. This is needed because only the proxy admin can query it.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| proxy | contract AdminUpgradeabilityProxy | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | The address of the current implementation of the proxy. |

### isOwner

```solidity
function isOwner() external view returns (bool)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | true if `msg.sender` is the owner of the contract. |

### owner

```solidity
function owner() external view returns (address)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | the address of the owner. |

### renounceOwnership

```solidity
function renounceOwnership() external nonpayable
```

Renouncing to ownership will leave the contract without an owner. It will not be possible to call the functions with the `onlyOwner` modifier anymore.

*Allows the current owner to relinquish control of the contract.*


### transferOwnership

```solidity
function transferOwnership(address newOwner) external nonpayable
```



*Allows the current owner to transfer control of the contract to a newOwner.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| newOwner | address | The address to transfer ownership to. |

### upgrade

```solidity
function upgrade(contract AdminUpgradeabilityProxy proxy, address implementation) external nonpayable
```



*Upgrades a proxy to the newest implementation of a contract.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| proxy | contract AdminUpgradeabilityProxy | Proxy to be upgraded. |
| implementation | address | the address of the Implementation. |

### upgradeAndCall

```solidity
function upgradeAndCall(contract AdminUpgradeabilityProxy proxy, address implementation, bytes data) external payable
```



*Upgrades a proxy to the newest implementation of a contract and forwards a function call to it. This is useful to initialize the proxied contract.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| proxy | contract AdminUpgradeabilityProxy | Proxy to be upgraded. |
| implementation | address | Address of the Implementation. |
| data | bytes | Data to send as msg.data in the low level call. It should include the signature and the parameters of the function to be called, as described in https://solidity.readthedocs.io/en/v0.4.24/abi-spec.html#function-selector-and-argument-encoding. |



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



