# ReplayProtection



> Replay protection for wallet meta transactions using a 2-dimensional nonce.



*A 2-dimensional nonce enables more flexible submission of transactions because they don&#39;t need to be processed in order. By using a &quot;channel&quot; which is the first dimension of the 2d nonce, senders can send multiple separate streams / channels of transactions independent of each other. This implementation is based on the one presented in EIP-2585 and implemented at: https://github.com/wighawag/eip-2585*

## Methods

### getNonce

```solidity
function getNonce(address _wallet, uint128 _channel) external view returns (uint128)
```



*Get next nonce given the wallet and channel.  The contract stores a 2D nonce per wallet:   wallet =&gt;      channel =&gt; nonce Transaction sender should first choose the value of channel. In most cases this can be 0. However if sending multiple streams of transactions in parallel then another channel will be chosen for the additional parallel streams of transactions. Nonce will simply be the next available nonce in the mapping from channel.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _wallet | address | Wallet to look up nonce for |
| _channel | uint128 | Channel of 2d nonce to look up next nonce |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint128 | Next nonce |

### packNonce

```solidity
function packNonce(uint128 _channel, uint128 _nonce) external pure returns (uint256 noncePacked)
```



*Packs channel and nonce with in channel into a single uint256. Clients send the 2D nonce packed into a single uint256. This function is a helper to pack the nonce. It can also of course be done client side. For example with ethers.BigNumber:  ```  nonce = ethers.BigNumber.from(channel).            shl(128).            add(ethers.BigNumber.from(nonce)) ```*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _channel | uint128 | Channel of 2D nonce |
| _nonce | uint128 | Nonce with in channel of 2D nonce |

#### Returns

| Name | Type | Description |
|---|---|---|
| noncePacked | uint256 | Packed uint256 nonce |




