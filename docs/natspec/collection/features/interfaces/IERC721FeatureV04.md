# IERC721FeatureV04









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

### transferFromWithProvenance

```solidity
function transferFromWithProvenance(address to, uint256 tokenId, string historyMetadataHash, uint256 customHistoryId, bool isIntermediary) external nonpayable
```



*Safely transfers ownership of a token and logs Provenance. The external transfer log is checked also. It validates that the sender is authorized to transfer the token (either the collection owner or token owner).*

#### Parameters

| Name | Type | Description |
|---|---|---|
| to | address | address to receive the ownership of the given token ID |
| tokenId | uint256 | uint256 ID of the token to be transferred |
| historyMetadataHash | string | string of the history metadata digest or cid |
| customHistoryId | uint256 | to map with custom history |
| isIntermediary | bool | bool flag of the intermediary default is false |



## Events

### Provenance

```solidity
event Provenance(uint256 indexed tokenId, address indexed from, address indexed to, uint256 customHistoryId, string historyMetadataHash, string historyMetadataURI, bool isIntermediary)
```





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



