# OwnerManager

*Stefan George - &lt;stefan@gnosis.pm&gt;Richard Meissner - &lt;richard@gnosis.pm&gt;*

> OwnerManager - Manages a set of owners and a threshold to perform actions.



*Adapted from GnosisSafe codebase OwnerManager.sol. Modified:  - support multiple wallets in the one contract (wallet param added to    events and functions)  - support wallet modifying it&#39;s own properties (eg. ownerlist, threshold)    using new onlyWallet modifier (replaces SelfAuthorized.sol check)  - use EIP2771 to receive calls from a Forwarder contract*

## Methods

### addOwner

```solidity
function addOwner(address _wallet, address _owner, uint8 _threshold) external nonpayable
```

Adds the owner `owner` to the Wallet and updates the threshold to `_threshold`.

*Allows to add a new owner to the Wallet and update the threshold at the same time.      This can only be done via a Wallet transaction.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _wallet | address | Wallet address. |
| _owner | address | New owner address. |
| _threshold | uint8 | New threshold. |

### changeThreshold

```solidity
function changeThreshold(address _wallet, uint8 _threshold) external nonpayable
```

Changes the threshold of the Wallet to `_threshold`.

*Allows to update the number of required confirmations by Wallet owners.      This can only be done via a Wallet transaction.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _wallet | address | Wallet address. |
| _threshold | uint8 | New threshold. |

### getOwners

```solidity
function getOwners(address _wallet) external view returns (address[])
```



*Returns array of owners.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _wallet | address | Wallet address. |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address[] | Array of Wallet owners. |

### getThreshold

```solidity
function getThreshold(address _wallet) external view returns (uint8)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| _wallet | address | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint8 | undefined |

### getTrustedForwarder

```solidity
function getTrustedForwarder() external view returns (address trustedForwarder)
```



*return address of the trusted forwarder.*


#### Returns

| Name | Type | Description |
|---|---|---|
| trustedForwarder | address | undefined |

### initialize

```solidity
function initialize(address _nameRegistryAddress, address _trustedForwarder) external nonpayable
```



*Initilize the contract*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _nameRegistryAddress | address | undefined |
| _trustedForwarder | address | undefined |

### isOwner

```solidity
function isOwner(address _wallet, address _owner) external view returns (bool)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| _wallet | address | undefined |
| _owner | address | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | undefined |

### isTrustedForwarder

```solidity
function isTrustedForwarder(address forwarder) external view returns (bool)
```



*return if the forwarder is trusted to forward relayed transactions to us. the forwarder is required to verify the sender&#39;s signature, and verify the call is not a replay.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| forwarder | address | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | undefined |

### nameRegistryAddress

```solidity
function nameRegistryAddress() external view returns (address)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined |

### removeOwner

```solidity
function removeOwner(address _wallet, address _prevOwner, address _owner, uint8 _threshold) external nonpayable
```

Removes the owner `owner` from the Wallet and updates the threshold to `_threshold`.

*Allows to remove an owner from the Wallet and update the threshold at the same time.      This can only be done via a Wallet transaction.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _wallet | address | Wallet address. |
| _prevOwner | address | Owner that pointed to the owner to be removed in the linked list |
| _owner | address | Owner address to be removed. |
| _threshold | uint8 | New threshold. |

### swapOwner

```solidity
function swapOwner(address _wallet, address _prevOwner, address _oldOwner, address _newOwner) external nonpayable
```

Replaces the owner `oldOwner` in the Wallet with `newOwner`.

*Allows to swap/replace an owner from the Wallet with another address.      This can only be done via a Wallet transaction.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _wallet | address | Wallet address. |
| _prevOwner | address | Owner that pointed to the owner to be replaced in the linked list |
| _oldOwner | address | Owner address to be replaced. |
| _newOwner | address | New owner address. |



## Events

### AddedOwner

```solidity
event AddedOwner(address indexed wallet, address owner)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| wallet `indexed` | address | undefined |
| owner  | address | undefined |

### ChangedThreshold

```solidity
event ChangedThreshold(address indexed wallet, uint8 threshold)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| wallet `indexed` | address | undefined |
| threshold  | uint8 | undefined |

### Initialized

```solidity
event Initialized(uint8 version)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| version  | uint8 | undefined |

### RemovedOwner

```solidity
event RemovedOwner(address indexed wallet, address owner)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| wallet `indexed` | address | undefined |
| owner  | address | undefined |



