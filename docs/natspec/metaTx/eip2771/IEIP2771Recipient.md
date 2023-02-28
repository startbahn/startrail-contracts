# IEIP2771Recipient



> A contract must implement this interface in order to support relayed        transaction from MetaTxForwarder.



*It is better to inherit the EIP2771BaseRecipient as the implementation. NOTE: This contract is originally from:   https://github.com/opengsn/forwarder/blob/master/contracts/interfaces/IRelayRecipient.sol One modification to the original:   - removed versionRecipient as it is not in the EIP2771 spec. and as yet     we don&#39;t have a use case for this*

## Methods

### isTrustedForwarder

```solidity
function isTrustedForwarder(address forwarder) external view returns (bool)
```



*return if the forwarder is trusted to forward relayed transactions to us. the forwarder is required to verify the sender&#39;s signature, and verify the call is not a replay.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| forwarder | address | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | undefined |




