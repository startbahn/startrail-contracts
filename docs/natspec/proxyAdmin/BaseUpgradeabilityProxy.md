# BaseUpgradeabilityProxy



> BaseUpgradeabilityProxy



*This contract implements a proxy that allows to change the implementation address to which it will delegate. Such a change is called an implementation upgrade.*


## Events

### Upgraded

```solidity
event Upgraded(address indexed implementation)
```



*Emitted when the implementation is upgraded.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| implementation `indexed` | address | Address of the new implementation. |



