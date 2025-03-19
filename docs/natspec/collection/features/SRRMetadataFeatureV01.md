# SRRMetadataFeatureV01



> Feature that enables srr&#39;s metadata can be updated   for a given token.





## Methods

### getSRRMetadata

```solidity
function getSRRMetadata(uint256 tokenId) external view returns (string metadataCID)
```



*Get the SRR Metadata*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | token id |

#### Returns

| Name | Type | Description |
|---|---|---|
| metadataCID | string | string of ipfs cid |

### tokenURI

```solidity
function tokenURI(uint256 tokenId) external view returns (string)
```



*Get token uri*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | uint256 of StartrailRegistryRecordID |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | string | token uri |

### updateSRRMetadata

```solidity
function updateSRRMetadata(uint256 tokenId, string metadataCID) external nonpayable
```



*Update the SRR Metadata*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | uint256 of StartrailRegistryRecordID |
| metadataCID | string | string of ipfs cid |



## Events

### UpdateSRRMetadataDigest

```solidity
event UpdateSRRMetadataDigest(uint256 indexed tokenId, string metadataCID)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId `indexed` | uint256 | undefined |
| metadataCID  | string | undefined |



## Errors

### OnlyIssuerOrArtistOrCollectionOwner

```solidity
error OnlyIssuerOrArtistOrCollectionOwner()
```






### SRRMetadataNotEmpty

```solidity
error SRRMetadataNotEmpty()
```






### SRRNotExists

```solidity
error SRRNotExists()
```







