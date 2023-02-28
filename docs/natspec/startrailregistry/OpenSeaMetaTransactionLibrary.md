# OpenSeaMetaTransactionLibrary





Library to support Meta Transactions from OpenSea. see https://docs.opensea.io/docs/polygon-basic-integration#meta-transactions NOTE: we leave &#39;functionSignature&#39; in to ensure compatibility with OpenSea   (especially as it&#39;s part of the typehash) but it should be &quot;calldata&quot;.



## Methods

### getChainId

```solidity
function getChainId() external pure returns (uint256)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined |

### msgSenderFromEIP2771MsgData

```solidity
function msgSenderFromEIP2771MsgData(bytes msgData) external view returns (address payable sender)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| msgData | bytes | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| sender | address payable | undefined |



## Events

### MetaTransactionExecuted

```solidity
event MetaTransactionExecuted(address userAddress, address payable relayerAddress, bytes functionSignature)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| userAddress  | address | undefined |
| relayerAddress  | address payable | undefined |
| functionSignature  | bytes | undefined |



