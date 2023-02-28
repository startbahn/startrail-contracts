# UpgradeableProxiable



> UpgradeableProxiable



*This contract implements upgradability for a Proxy contract. It is intended that the bytecode for this contract is stored with the Logic Contract that the proxy delegatecalls too. ie. The bytecode for this contract does not need to be stored in the proxy itself. Based on OpenZeppelin&#39;s BaseUpgradeabilityProxy with changes to remove the Proxy base. see also EIP1822 which defines a pattern like this.*


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



