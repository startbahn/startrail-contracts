# EIP2771BaseRecipient



> A base contract to be inherited by any contract that wants to receive        transactions relayed through the MetaTxForwarder.



*A subclass must use &quot;msgSender()&quot; instead of &quot;msg.sender&quot;. NOTE: This contract is originally from:   https://github.com/opengsn/forwarder/blob/master/contracts/BaseRelayRecipient.sol NOTE: The above is referenced on the EIP-2711 spec:   https://eips.ethereum.org/EIPS/eip-2771*

## Methods

### getTrustedForwarder

```solidity
function getTrustedForwarder() external view returns (address trustedForwarder)
```



*return address of the trusted forwarder.*


#### Returns

| Name | Type | Description |
|---|---|---|
| trustedForwarder | address | undefined |

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




