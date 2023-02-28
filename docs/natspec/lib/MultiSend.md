# MultiSend

*Nick Dodson - &lt;nick.dodson@consensys.net&gt;Gonçalo Sá - &lt;goncalo.sa@consensys.net&gt;Stefan George - &lt;stefan@gnosis.io&gt;Richard Meissner - &lt;richard@gnosis.io&gt; NOTE: This version modifies the original from gnosis/safe-contracts        to revert immediately with error reason string if one of the        child transactions reverted. Original License: see SPDX-Licensed-Identifier above*

> Multi Send - Allows to batch multiple transactions into one.





## Methods

### multiSend

```solidity
function multiSend(bytes transactions) external nonpayable
```



*Sends multiple transactions and reverts all if one fails.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| transactions | bytes | Encoded transactions. Each transaction is encoded as a packed bytes of                     operation as a uint8 with 0 for a call or 1 for a delegatecall (=&gt; 1 byte),                     to as a address (=&gt; 20 bytes),                     value as a uint256 (=&gt; 32 bytes),                     data length as a uint256 (=&gt; 32 bytes),                     data as bytes.                     see abi.encodePacked for more information on packed encoding |




