# ERC2981RoyaltyFeatureV01



> A standardized way to retrieve royalty payment information for NFTs  to enable universal support for royalty payments  across all NFT marketplaces and ecosystem participants.





## Methods

### getSRRRoyalty

```solidity
function getSRRRoyalty(uint256 tokenId) external view returns (address receiver, uint16 basisPoints)
```



*Get the SRR Royalty*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | token id |

#### Returns

| Name | Type | Description |
|---|---|---|
| receiver | address | royalty receiver |
| basisPoints | uint16 | royalty basis points |

### royaltyInfo

```solidity
function royaltyInfo(uint256 tokenId, uint256 salePrice) external view returns (address, uint256)
```

Called with the sale price to determine how much royalty  is owed and to whom.  The default receiver address 0x75194F40c5337d218A6798B02BbB34500a653A16 is what we use for OpenSea.  For all environments like QA, STG and production.  As we set the default royalty to 0, this shouldn’t matter if there is no receiver



#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | - the NFT asset queried for royalty information |
| salePrice | uint256 | - the sale price of the NFT asset specified by _tokenId |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | receiver - address of who should be sent the royalty payment |
| _1 | uint256 | royaltyAmount - the royalty payment amount for _salePrice |

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

### updateSRRRoyalty

```solidity
function updateSRRRoyalty(uint256 tokenId, address royaltyReceiver, uint16 royaltyBasisPoints) external nonpayable
```



*Updates the SRR Royalty Only apply to srrs created with royalty info*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | uint256 of StartrailRegistryRecordID |
| royaltyReceiver | address | royalty receiver |
| royaltyBasisPoints | uint16 | royalty basis points |

### updateSRRRoyaltyReceiverMulti

```solidity
function updateSRRRoyaltyReceiverMulti(uint256[] tokenIds, address royaltyReceiver) external nonpayable
```



*Updates the SRR Royalty Receiver from multi token ids Only apply to srrs created with royalty info*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenIds | uint256[] | token ids |
| royaltyReceiver | address | royalty receiver |



## Events

### RoyaltiesSet

```solidity
event RoyaltiesSet(uint256 indexed tokenId, LibERC2981RoyaltyTypes.RoyaltyInfo royalty)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId `indexed` | uint256 | undefined |
| royalty  | LibERC2981RoyaltyTypes.RoyaltyInfo | undefined |



## Errors

### NotAdministrator

```solidity
error NotAdministrator()
```






### RoyaltyFeeNotToExceedSalePrice

```solidity
error RoyaltyFeeNotToExceedSalePrice()
```






### RoyaltyNotExists

```solidity
error RoyaltyNotExists()
```






### RoyaltyReceiverNotAddressZero

```solidity
error RoyaltyReceiverNotAddressZero()
```






### SRRNotExists

```solidity
error SRRNotExists()
```







