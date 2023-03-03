# ERC721Feature









## Methods

### __ERC721Feature_initialize

```solidity
function __ERC721Feature_initialize(string name, string symbol) external nonpayable
```



*ERC721 initializer to set the name and symbol*

#### Parameters

| Name | Type | Description |
|---|---|---|
| name | string | undefined |
| symbol | string | undefined |

### approve

```solidity
function approve(address spender, uint256 id) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| spender | address | undefined |
| id | uint256 | undefined |

### balanceOf

```solidity
function balanceOf(address owner) external view returns (uint256)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| owner | address | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined |

### exists

```solidity
function exists(uint256 tokenId) external view returns (bool)
```



*See if token with given id exists Externalize this for other feature contracts to verify token existance.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | NFT id |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | true if token exists |

### getApproved

```solidity
function getApproved(uint256 tokenId) external view returns (address)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined |

### isApprovedForAll

```solidity
function isApprovedForAll(address owner, address operator) external view returns (bool)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| owner | address | undefined |
| operator | address | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | undefined |

### name

```solidity
function name() external view returns (string)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | string | undefined |

### ownerOf

```solidity
function ownerOf(uint256 id) external view returns (address owner)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| id | uint256 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| owner | address | undefined |

### safeTransferFrom

```solidity
function safeTransferFrom(address from, address to, uint256 id) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| from | address | undefined |
| to | address | undefined |
| id | uint256 | undefined |

### safeTransferFrom

```solidity
function safeTransferFrom(address from, address to, uint256 id, bytes data) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| from | address | undefined |
| to | address | undefined |
| id | uint256 | undefined |
| data | bytes | undefined |

### setApprovalForAll

```solidity
function setApprovalForAll(address operator, bool approved) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| operator | address | undefined |
| approved | bool | undefined |

### supportsInterface

```solidity
function supportsInterface(bytes4 interfaceId) external view returns (bool)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| interfaceId | bytes4 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | undefined |

### symbol

```solidity
function symbol() external view returns (string)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | string | undefined |

### tokenURI

```solidity
function tokenURI(uint256) external pure returns (string)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | string | undefined |

### transferFrom

```solidity
function transferFrom(address from, address to, uint256 id) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| from | address | undefined |
| to | address | undefined |
| id | uint256 | undefined |




## Errors

### ERC721FeatureAlreadyInitialized

```solidity
error ERC721FeatureAlreadyInitialized()
```







