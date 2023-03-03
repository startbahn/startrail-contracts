# StartrailCollectionFeatureRegistry

*Chris Hatch - &lt;chris.hatch@startbahn.jp&gt;*

> Feature registry for Startrail collection proxy contracts



*Each Collection proxy will use this single registry to lookup and delegate to function implementations for ERC721, metadata, etc.*

## Methods

### diamondCut

```solidity
function diamondCut(IDiamondWritable.FacetCut[] facetCuts, address target, bytes data) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| facetCuts | IDiamondWritable.FacetCut[] | undefined |
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

### getEIP2771TrustedForwarder

```solidity
function getEIP2771TrustedForwarder() external view returns (address)
```



*Get the EIP2771 trusted forwarder address*


#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | Return the trusted forwarder |

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

### owner

```solidity
function owner() external view returns (address)
```

get the ERC173 contract owner




#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | conrtact owner |

### setEIP2771TrustedForwarder

```solidity
function setEIP2771TrustedForwarder(address forwarder) external nonpayable
```

Temporary function to enable a workaround in the meta-tx-forwarder.test.ts. TODO: Once we have implemented createSRR and createCollection with meta-tx&#39;s we can remove this and the trusted forwarder can be immutable.



#### Parameters

| Name | Type | Description |
|---|---|---|
| forwarder | address | undefined |

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
event DiamondCut(IDiamondWritable.FacetCut[] facetCuts, address target, bytes data)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| facetCuts  | IDiamondWritable.FacetCut[] | undefined |
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



