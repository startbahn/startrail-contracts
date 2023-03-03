# IERC721Feature









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




