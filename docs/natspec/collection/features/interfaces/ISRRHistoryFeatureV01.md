# ISRRHistoryFeatureV01







*Functions and errors for add history.*

## Methods

### addHistory

```solidity
function addHistory(uint256[] tokenIds, uint256[] customHistoryIds) external nonpayable
```



*Associating custom histories with SRRs*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenIds | uint256[] | Array of SRR token IDs |
| customHistoryIds | uint256[] | Array of customHistoryIds |




## Errors

### AddHistoryNotPermitted

```solidity
error AddHistoryNotPermitted()
```






### CustomHistoryDoesNotExist

```solidity
error CustomHistoryDoesNotExist()
```






### MaxCombinedTokensAndHistoriesExceeded

```solidity
error MaxCombinedTokensAndHistoriesExceeded()
```







