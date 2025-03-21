# ERC721UpgradeSafe



> ERC721 Non-Fungible Token Standard basic implementation



*see https://eips.ethereum.org/EIPS/eip-721*

## Methods

### _tokenOwner

```solidity
function _tokenOwner(uint256) external view returns (address)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined |

### approve

```solidity
function approve(address to, uint256 tokenId) external nonpayable
```



*Approves another address to transfer the given token ID The zero address indicates there is no approved address. There can only be one approved address per token at a given time. Can only be called by the token owner or an approved operator.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| to | address | address to be approved for the given token ID |
| tokenId | uint256 | uint256 ID of the token to be approved |

### balanceOf

```solidity
function balanceOf(address owner) external view returns (uint256)
```



*Gets the balance of the specified address.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| owner | address | address to query the balance of |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | uint256 representing the amount owned by the passed address |

### baseURI

```solidity
function baseURI() external view returns (string)
```



*Returns the base URI set via {_setBaseURI}. This will be automatically added as a prefix in {tokenURI} to each token&#39;s URI, or to the token ID if no specific URI is set for that token ID.*


#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | string | undefined |

### getApproved

```solidity
function getApproved(uint256 tokenId) external view returns (address)
```



*Gets the approved address for a token ID, or zero if no address set Reverts if the token ID does not exist.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | uint256 ID of the token to query the approval of |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | address currently approved for the given token ID |

### isApprovedForAll

```solidity
function isApprovedForAll(address owner, address operator) external view returns (bool)
```



*Tells whether an operator is approved by a given owner.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| owner | address | owner address which you want to query the approval of |
| operator | address | operator address which you want to query the approval of |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | bool whether the given operator is approved by the given owner |

### name

```solidity
function name() external view returns (string)
```



*Gets the token name.*


#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | string | string representing the token name |

### ownerOf

```solidity
function ownerOf(uint256 tokenId) external view returns (address)
```



*Gets the owner of the specified token ID.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | uint256 ID of the token to query the owner of |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | address currently marked as the owner of the given token ID |

### safeTransferFrom

```solidity
function safeTransferFrom(address from, address to, uint256 tokenId) external nonpayable
```



*Safely transfers the ownership of a given token ID to another address If the target address is a contract, it must implement {IERC721Receiver-onERC721Received}, which is called upon a safe transfer, and return the magic value `bytes4(keccak256(&quot;onERC721Received(address,address,uint256,bytes)&quot;))`; otherwise, the transfer is reverted. Requires the msg.sender to be the owner, approved, or operator*

#### Parameters

| Name | Type | Description |
|---|---|---|
| from | address | current owner of the token |
| to | address | address to receive the ownership of the given token ID |
| tokenId | uint256 | uint256 ID of the token to be transferred |

### safeTransferFrom

```solidity
function safeTransferFrom(address from, address to, uint256 tokenId, bytes _data) external nonpayable
```



*Safely transfers the ownership of a given token ID to another address If the target address is a contract, it must implement {IERC721Receiver-onERC721Received}, which is called upon a safe transfer, and return the magic value `bytes4(keccak256(&quot;onERC721Received(address,address,uint256,bytes)&quot;))`; otherwise, the transfer is reverted. Requires the _msgSender() to be the owner, approved, or operator*

#### Parameters

| Name | Type | Description |
|---|---|---|
| from | address | current owner of the token |
| to | address | address to receive the ownership of the given token ID |
| tokenId | uint256 | uint256 ID of the token to be transferred |
| _data | bytes | bytes data to send along with a safe transfer check |

### setApprovalForAll

```solidity
function setApprovalForAll(address operator, bool approved) external nonpayable
```



*Sets or unsets the approval of a given operator An operator is allowed to transfer all tokens of the sender on their behalf.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| operator | address | operator address to set the approval |
| approved | bool | representing the status of the approval to be set |

### supportsInterface

```solidity
function supportsInterface(bytes4 interfaceId) external view returns (bool)
```



*See {IERC165-supportsInterface}.*

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



*Gets the token symbol.*


#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | string | string representing the token symbol |

### tokenURI

```solidity
function tokenURI(uint256 tokenId) external view returns (string)
```



*Returns the URI for a given token ID. May return an empty string. If a base URI is set (via {_setBaseURI}), it is added as a prefix to the token&#39;s own URI (via {_setTokenURI}). If there is a base URI but no token URI, the token&#39;s ID will be used as its URI when appending it to the base URI. This pattern for autogenerated token URIs can lead to large gas savings. .Examples |=== |`_setBaseURI()` |`_setTokenURI()` |`tokenURI()` | &quot;&quot; | &quot;&quot; | &quot;&quot; | &quot;&quot; | &quot;token.uri/123&quot; | &quot;token.uri/123&quot; | &quot;token.uri/&quot; | &quot;123&quot; | &quot;token.uri/123&quot; | &quot;token.uri/&quot; | &quot;&quot; | &quot;token.uri/&lt;tokenId&gt;&quot; |=== Requirements: - `tokenId` must exist.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | string | undefined |

### transferFrom

```solidity
function transferFrom(address from, address to, uint256 tokenId) external nonpayable
```



*Transfers the ownership of a given token ID to another address. Usage of this method is discouraged, use {safeTransferFrom} whenever possible. Requires the msg.sender to be the owner, approved, or operator.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| from | address | current owner of the token |
| to | address | address to receive the ownership of the given token ID |
| tokenId | uint256 | uint256 ID of the token to be transferred |



## Events

### Approval

```solidity
event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId)
```



*Emitted when `owner` enables `approved` to manage the `tokenId` token.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| owner `indexed` | address | undefined |
| approved `indexed` | address | undefined |
| tokenId `indexed` | uint256 | undefined |

### ApprovalForAll

```solidity
event ApprovalForAll(address indexed owner, address indexed operator, bool approved)
```



*Emitted when `owner` enables or disables (`approved`) `operator` to manage all of its assets.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| owner `indexed` | address | undefined |
| operator `indexed` | address | undefined |
| approved  | bool | undefined |

### Initialized

```solidity
event Initialized(uint8 version)
```



*Triggered when the contract has been initialized or reinitialized.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| version  | uint8 | undefined |

### Transfer

```solidity
event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)
```



*Emitted when `tokenId` token is transferred from `from` to `to`.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| from `indexed` | address | undefined |
| to `indexed` | address | undefined |
| tokenId `indexed` | uint256 | undefined |



