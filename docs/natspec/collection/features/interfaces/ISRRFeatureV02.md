# ISRRFeatureV02







*Functions for minting SRR tokens on collections.*

## Methods

### createSRR

```solidity
function createSRR(bool isPrimaryIssuer, address artistAddress, string metadataCID, bool lockExternalTransfer, address to, address royaltyReceiver, uint16 royaltyBasisPoints) external nonpayable
```



*Creates an SRR for an artwork*

#### Parameters

| Name | Type | Description |
|---|---|---|
| isPrimaryIssuer | bool | true if issued by primary issuer |
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

### updateSRR

```solidity
function updateSRR(uint256 tokenId, bool isPrimaryIssuer, address artistAddress) external nonpayable
```



*Update SRR details*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | SRR id |
| isPrimaryIssuer | bool | true if issued by primary issuer |
| artistAddress | address | artist contract |



## Events

### UpdateSRR

```solidity
event UpdateSRR(uint256 indexed tokenId, bool isPrimaryIssuer, address artistAddress, address sender)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId `indexed` | uint256 | undefined |
| isPrimaryIssuer  | bool | undefined |
| artistAddress  | address | undefined |
| sender  | address | undefined |



## Errors

### ZeroAddress

```solidity
error ZeroAddress()
```







