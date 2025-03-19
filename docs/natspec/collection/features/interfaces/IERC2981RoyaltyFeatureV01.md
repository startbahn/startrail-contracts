# IERC2981RoyaltyFeatureV01







*Functions for the srr royalty info.  Events are defined in LibERC2981RoyaltyEvents.sol.  Errors are defined in LibERC2981RoyaltyStorage.sol.  Types are defined in LibERC2981RoyaltyTypes.sol.*

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




