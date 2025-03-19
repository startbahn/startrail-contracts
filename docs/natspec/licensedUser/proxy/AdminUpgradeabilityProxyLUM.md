# AdminUpgradeabilityProxyLUM



> AdminUpgradeabilityProxyLUM



*A modified version of AdminUpgradeabilityProxy.sol that moves the    admin address out of the constructor in order to enable create2 creation   without admin as input. Admin is instead set in the initializeAdmin    function that can be called once only.*

## Methods

### admin

```solidity
function admin() external nonpayable returns (address)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | The address of the proxy admin. |

### changeAdmin

```solidity
function changeAdmin(address newAdmin) external nonpayable
```



*Changes the admin of the proxy. Only the current admin can call this function.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| newAdmin | address | Address to transfer proxy administration to. |

### implementation

```solidity
function implementation() external nonpayable returns (address)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | The address of the implementation. |

### initializeAdmin

```solidity
function initializeAdmin(address _proxyAdmin) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| _proxyAdmin | address | Address of the proxy administrator. |

### upgradeTo

```solidity
function upgradeTo(address newImplementation) external nonpayable
```



*Upgrade the backing implementation of the proxy. Only the admin can call this function.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| newImplementation | address | Address of the new implementation. |

### upgradeToAndCall

```solidity
function upgradeToAndCall(address newImplementation, bytes data) external payable
```



*Upgrade the backing implementation of the proxy and call a function on the new implementation. This is useful to initialize the proxied contract.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| newImplementation | address | Address of the new implementation. |
| data | bytes | Data to send as msg.data in the low level call. It should include the signature and the parameters of the function to be called, as described in https://solidity.readthedocs.io/en/v0.4.24/abi-spec.html#function-selector-and-argument-encoding. |



## Events

### AdminChanged

```solidity
event AdminChanged(address previousAdmin, address newAdmin)
```



*Emitted when the administration has been transferred.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| previousAdmin  | address | Address of the previous admin. |
| newAdmin  | address | Address of the new admin. |

### Upgraded

```solidity
event Upgraded(address indexed implementation)
```



*Emitted when the implementation is upgraded.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| implementation `indexed` | address | Address of the new implementation. |



