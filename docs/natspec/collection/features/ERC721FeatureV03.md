# ERC721FeatureV03









## Methods

### __ERC721Feature_initialize

```solidity
function __ERC721Feature_initialize(string name_, string symbol_) external nonpayable
```



*ERC721 initializer to set the name and symbol*

#### Parameters

| Name | Type | Description |
|---|---|---|
| name_ | string | undefined |
| symbol_ | string | undefined |

### approve

```solidity
function approve(address spender, uint256 tokenId) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| spender | address | undefined |
| tokenId | uint256 | undefined |

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
function safeTransferFrom(address from, address to, uint256 tokenId) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| from | address | undefined |
| to | address | undefined |
| tokenId | uint256 | undefined |

### safeTransferFrom

```solidity
function safeTransferFrom(address from, address to, uint256 tokenId, bytes data) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| from | address | undefined |
| to | address | undefined |
| tokenId | uint256 | undefined |
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

### transferFromWithProvenance

```solidity
function transferFromWithProvenance(address to, uint256 tokenId, string historyMetadataHash, uint256 customHistoryId, bool isIntermediary) external nonpayable
```



*Safely transfers ownership of a token and logs Provenance. The external transfer log is checked also.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| to | address | address to receive the ownership of the given token ID |
| tokenId | uint256 | uint256 ID of the token to be transferred |
| historyMetadataHash | string | string of the history metadata digest or cid |
| customHistoryId | uint256 | to map with custom history |
| isIntermediary | bool | bool flag of the intermediary default is false |



## Events

### Approval

```solidity
event Approval(address indexed owner, address indexed spender, uint256 indexed id)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| owner `indexed` | address | undefined |
| spender `indexed` | address | undefined |
| id `indexed` | uint256 | undefined |

### ApprovalForAll

```solidity
event ApprovalForAll(address indexed owner, address indexed operator, bool approved)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| owner `indexed` | address | undefined |
| operator `indexed` | address | undefined |
| approved  | bool | undefined |

### Provenance

```solidity
event Provenance(uint256 indexed tokenId, address indexed from, address indexed to, uint256 customHistoryId, string historyMetadataHash, string historyMetadataURI, bool isIntermediary)
```

Events



#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId `indexed` | uint256 | undefined |
| from `indexed` | address | undefined |
| to `indexed` | address | undefined |
| customHistoryId  | uint256 | undefined |
| historyMetadataHash  | string | undefined |
| historyMetadataURI  | string | undefined |
| isIntermediary  | bool | undefined |

### Transfer

```solidity
event Transfer(address indexed from, address indexed to, uint256 indexed id)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| from `indexed` | address | undefined |
| to `indexed` | address | undefined |
| id `indexed` | uint256 | undefined |



## Errors

### ERC721ExternalTransferLocked

```solidity
error ERC721ExternalTransferLocked()
```






### ERC721FeatureAlreadyInitialized

```solidity
error ERC721FeatureAlreadyInitialized()
```







