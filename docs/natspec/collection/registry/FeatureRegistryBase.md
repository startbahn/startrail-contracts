# FeatureRegistryBase

*Chris Hatch - &lt;chris.hatch@startbahn.jp&gt;*

> Feature contract registry - enables plugable logic for NFT collection contracts.



*A registry of &#39;Feature&#39; contract addresses and corresponding lists of 4byte function selectors for each. This contract is shared by multiple proxy contracts that use it to lookup the implementation address of incoming function calls. In this way it it is like a Beacon that supports multiple implementation contracts. This contract uses the solidstate Diamond implementation to manage the registry data but this is not a Diamond as the proxy is disabled and only the store and lookups for the contract implementations are in place. It also adds internal storage for ERC165 interface registration but does not expose ERC165 itself as it should be exposed from the CollectionProxy&#39;s which will query the internal storage in the registry here to get the correct supportsInterface() responses.*

## Methods

### diamondCut

```solidity
function diamondCut(IDiamondWritableInternal.FacetCut[] facetCuts, address target, bytes data) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| facetCuts | IDiamondWritableInternal.FacetCut[] | undefined |
| target | address | undefined |
| data | bytes | undefined |

### facetAddress

```solidity
function facetAddress(bytes4 selector) external view returns (address facet)
```

get the address of the facet associated with given selector



#### Parameters

| Name | Type | Description |
|---|---|---|
| selector | bytes4 | function selector to query |

#### Returns

| Name | Type | Description |
|---|---|---|
| facet | address | facet address (zero address if not found) |

### facetAddresses

```solidity
function facetAddresses() external view returns (address[] addresses)
```

get addresses of all facets used by diamond




#### Returns

| Name | Type | Description |
|---|---|---|
| addresses | address[] | array of facet addresses |

### facetFunctionSelectors

```solidity
function facetFunctionSelectors(address facet) external view returns (bytes4[] selectors)
```

get all selectors for given facet address



#### Parameters

| Name | Type | Description |
|---|---|---|
| facet | address | address of facet to query |

#### Returns

| Name | Type | Description |
|---|---|---|
| selectors | bytes4[] | array of function selectors |

### facets

```solidity
function facets() external view returns (struct IDiamondReadable.Facet[] diamondFacets)
```

get all facets and their selectors




#### Returns

| Name | Type | Description |
|---|---|---|
| diamondFacets | IDiamondReadable.Facet[] | array of structured facet data |

### getSupportedInterface

```solidity
function getSupportedInterface(bytes4 interfaceId) external view returns (bool)
```

Get the support status of a given ERC165 interface. NOTE: intentionally does not use the standard `supportsInterface(bytes4)`   as this function is provided as a shared lookup for CollectionProxy   contracts which will themselves provide that standard interface and   proxy calls to this getter function.



#### Parameters

| Name | Type | Description |
|---|---|---|
| interfaceId | bytes4 | 4 bytes interface id of thes supported interface |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | true if the interface is supported |

### owner

```solidity
function owner() external view returns (address)
```

get the ERC173 contract owner




#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | contract owner |

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

### DiamondCut

```solidity
event DiamondCut(IDiamondWritableInternal.FacetCut[] facetCuts, address target, bytes data)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| facetCuts  | IDiamondWritableInternal.FacetCut[] | undefined |
| target  | address | undefined |
| data  | bytes | undefined |

### FeatureContractCreated

```solidity
event FeatureContractCreated(address indexed featureAddress, string name)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| featureAddress `indexed` | address | undefined |
| name  | string | undefined |

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

### DiamondWritable__InvalidInitializationParameters

```solidity
error DiamondWritable__InvalidInitializationParameters()
```






### DiamondWritable__RemoveTargetNotZeroAddress

```solidity
error DiamondWritable__RemoveTargetNotZeroAddress()
```






### DiamondWritable__ReplaceTargetIsIdentical

```solidity
error DiamondWritable__ReplaceTargetIsIdentical()
```






### DiamondWritable__SelectorAlreadyAdded

```solidity
error DiamondWritable__SelectorAlreadyAdded()
```






### DiamondWritable__SelectorIsImmutable

```solidity
error DiamondWritable__SelectorIsImmutable()
```






### DiamondWritable__SelectorNotFound

```solidity
error DiamondWritable__SelectorNotFound()
```






### DiamondWritable__SelectorNotSpecified

```solidity
error DiamondWritable__SelectorNotSpecified()
```






### DiamondWritable__TargetHasNoCode

```solidity
error DiamondWritable__TargetHasNoCode()
```






### Ownable__NotOwner

```solidity
error Ownable__NotOwner()
```






### Ownable__NotTransitiveOwner

```solidity
error Ownable__NotTransitiveOwner()
```







