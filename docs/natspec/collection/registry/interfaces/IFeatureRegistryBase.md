# IFeatureRegistryBase









## Methods

### getSupportedInterface

```solidity
function getSupportedInterface(bytes4 interfaceId) external view returns (bool)
```

Get the support status of a given ERC165 interface. NOTE: intentionally does not use the standard `supportsInterface(bytes4)`   as this function is provided as a shared lookup for CollectionProxy   contracts which will themselves provide that standard interface and   proxy calls to this getter function.



#### Parameters

| Name | Type | Description |
|---|---|---|
| interfaceId | bytes4 | 4 bytes interface id of the supported interface |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | true if the interface is supported |

### setSupportedInterface

```solidity
function setSupportedInterface(bytes4 interfaceId, bool status) external nonpayable
```

Update the mapping of supported ERC165 interfaces.



#### Parameters

| Name | Type | Description |
|---|---|---|
| interfaceId | bytes4 | 4 bytes interface id of the supported interface |
| status | bool | true if interface supported, false if not (false will be   used if an interface was removed or no longer supported) |




