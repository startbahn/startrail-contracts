# MetaTxRequestManager

*Chris Hatch - &lt;chris.hatch@startbahn.jp&gt;*

> MetaTxRequestManager - a register of Startrail MetaTx request types



*This contract maintains a register of all Startrail meta transaction request types. Each request is registered with an EIP712 typeHash. The type hash and corresponding type string are emitted with event RequestTypeRegistered at registration time. All request types share a common set of parameters defined by GENERIC_PARAMS. The function encodeRequest is provided to build a an EIP712 signature encoding for a given request type and inputs.*

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

### nameRegistryAddress

```solidity
function nameRegistryAddress() external view returns (address)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined |

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



