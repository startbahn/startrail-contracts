# MetaTxForwarderV1

*Chris Hatch - &lt;chris.hatch@startbahn.jp&gt;*

> MetaTxForwarder - forward meta tx requests to destination contracts.



*A meta-tx forwarding contract using EIP2771 to forward the sender address.*

## Methods

### DOMAIN_NAME

```solidity
function DOMAIN_NAME() external view returns (string)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | string | undefined |

### DOMAIN_SEPARATOR_TYPEHASH

```solidity
function DOMAIN_SEPARATOR_TYPEHASH() external view returns (bytes32)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bytes32 | undefined |

### DOMAIN_VERSION

```solidity
function DOMAIN_VERSION() external view returns (string)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | string | undefined |

### GENERIC_PARAMS

```solidity
function GENERIC_PARAMS() external view returns (string)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | string | undefined |

### domainSeparator

```solidity
function domainSeparator() external view returns (bytes32)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bytes32 | undefined |

### encodeRequest

```solidity
function encodeRequest(IMetaTxRequest.ExecutionRequest _request) external view returns (bytes)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| _request | IMetaTxRequest.ExecutionRequest | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bytes | undefined |

### executeTransactionLUW

```solidity
function executeTransactionLUW(IMetaTxRequest.ExecutionRequest _request, bytes _signatures) external nonpayable returns (bool success)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| _request | IMetaTxRequest.ExecutionRequest | undefined |
| _signatures | bytes | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| success | bool | undefined |

### getNonce

```solidity
function getNonce(address _wallet, uint128 _channel) external view returns (uint128)
```



*Get next nonce given the wallet and channel.  The contract stores a 2D nonce per wallet:   wallet =&gt;      channel =&gt; nonce Transaction sender should first choose the value of channel. In most cases this can be 0. However if sending multiple streams of transactions in parallel then another channel will be chosen for the additional parallel streams of transactions. Nonce will simply be the next available nonce in the mapping from channel.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _wallet | address | Wallet to look up nonce for |
| _channel | uint128 | Channel of 2d nonce to look up next nonce |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint128 | Next nonce |

### initialize

```solidity
function initialize(address _nameRegistry) external nonpayable
```



*Setup the contract*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _nameRegistry | address | NameRegistry address. |

### nameRegistryAddress

```solidity
function nameRegistryAddress() external view returns (address)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined |

### packNonce

```solidity
function packNonce(uint128 _channel, uint128 _nonce) external pure returns (uint256 noncePacked)
```



*Packs channel and nonce with in channel into a single uint256. Clients send the 2D nonce packed into a single uint256. This function is a helper to pack the nonce. It can also of course be done client side. For example with ethers.BigNumber:  ```  nonce = ethers.BigNumber.from(channel).            shl(128).            add(ethers.BigNumber.from(nonce)) ```*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _channel | uint128 | Channel of 2D nonce |
| _nonce | uint128 | Nonce with in channel of 2D nonce |

#### Returns

| Name | Type | Description |
|---|---|---|
| noncePacked | uint256 | Packed uint256 nonce |

### registerRequestType

```solidity
function registerRequestType(string _typeName, string _typeSuffix, address _destinationContract, bytes4 _functionSignature) external nonpayable
```



*Add a new request type to the register. _typeSuffix defines the parameters that follow the GENERIC_PARAMS (defined above). The format should follow the EIP712 spec. Where the full type hash is:   name ‖ &quot;(&quot; ‖ member₁ ‖ &quot;,&quot; ‖ member₂ ‖ &quot;,&quot; ‖ … ‖ memberₙ &quot;)&quot; _typeSuffix format can be defined as:   memberₘ ‖ &quot;,&quot; ‖ … ‖ memberₙ*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _typeName | string | Request type name |
| _typeSuffix | string | Defines parameters specific to the request |
| _destinationContract | address | Single fixed destination of this request |
| _functionSignature | bytes4 | 4 byte Solidity function signature to call |

### requestTypes

```solidity
function requestTypes(bytes32) external view returns (address destination, bytes4 functionSignature)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| _0 | bytes32 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| destination | address | undefined |
| functionSignature | bytes4 | undefined |

### typeHashes

```solidity
function typeHashes(bytes32) external view returns (bool)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| _0 | bytes32 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | undefined |

### unregisterRequestType

```solidity
function unregisterRequestType(bytes32 _typeHash) external nonpayable
```



*Remove a new request type from the register.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _typeHash | bytes32 | Request type hash |



## Events

### ExecutionSuccess

```solidity
event ExecutionSuccess(bytes32 txHash)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| txHash  | bytes32 | undefined |

### Initialized

```solidity
event Initialized(uint8 version)
```



*Triggered when the contract has been initialized or reinitialized.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| version  | uint8 | undefined |

### RequestTypeRegistered

```solidity
event RequestTypeRegistered(bytes32 indexed typeHash, string typeStr)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| typeHash `indexed` | bytes32 | undefined |
| typeStr  | string | undefined |

### RequestTypeUnregistered

```solidity
event RequestTypeUnregistered(bytes32 indexed typeHash)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| typeHash `indexed` | bytes32 | undefined |



