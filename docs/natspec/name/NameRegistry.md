# NameRegistry









## Methods

### administrator

```solidity
function administrator() external view returns (address)
```



*Gets the Startrail administrator address*


#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | address |

### get

```solidity
function get(uint8 key) external view returns (address)
```



*Gets the address associated with the key name*

#### Parameters

| Name | Type | Description |
|---|---|---|
| key | uint8 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | address |

### initialize

```solidity
function initialize(address _administrator) external nonpayable
```



*Initializes the contract setting the administrator*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _administrator | address | undefined |

### set

```solidity
function set(uint8 key, address value) external nonpayable
```



*Sets the name as an address you want to conbine with*

#### Parameters

| Name | Type | Description |
|---|---|---|
| key | uint8 | string of the name |
| value | address | address you want to register |



## Events

### Initialized

```solidity
event Initialized(uint8 version)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| version  | uint8 | undefined |



