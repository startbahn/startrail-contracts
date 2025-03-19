# SRRHistoryFeatureV01



> Feature implementing emission of history events for collection SRRs.



*Enables batch association of 1 or more SRRs with 1 or more custom history events.*

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



## Events

### History

```solidity
event History(uint256[] tokenIds, uint256[] customHistoryIds)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenIds  | uint256[] | undefined |
| customHistoryIds  | uint256[] | undefined |



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






### SRRNotExists

```solidity
error SRRNotExists()
```







