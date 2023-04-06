# SRRFeature



> Feature that enables standard ERC721 transfer methods to be disabled   for a given token.





## Methods

### createSRR

```solidity
function createSRR(bool isPrimaryIssuer, address artistAddress, string metadataCID, bool lockExternalTransfer, address to, address royaltyReceiver, uint16 royaltyPercentage) external nonpayable
```



*Creates an SRR for an artwork*

#### Parameters

| Name | Type | Description |
|---|---|---|
| isPrimaryIssuer | bool | issuer contract |
| artistAddress | address | artist contract |
| metadataCID | string | metadata IPFS cid |
| lockExternalTransfer | bool | transfer lock flag (see LockExternalTransferFeatuer.sol) |
| to | address | the address this token will be transferred to after the creation |
| royaltyReceiver | address | royalty receiver |
| royaltyBasisPoints | uint16 | royalty basis points |

### getSRR

```solidity
function getSRR(uint256 tokenId) external view returns (bool isPrimaryIssuer, address artist, address issuer)
```



*Gets core SRR details*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | SRR id |

#### Returns

| Name | Type | Description |
|---|---|---|
| isPrimaryIssuer | bool | isPrimaryIssuer |
| artist | address | artist |
| issuer | address | issuer |




## Errors

### MetadataEmpty

```solidity
error MetadataEmpty()
```






### NotOwner

```solidity
error NotOwner()
```






### NotTrustedForwarder

```solidity
error NotTrustedForwarder()
```






### TokenAlreadyExists

```solidity
error TokenAlreadyExists()
```







