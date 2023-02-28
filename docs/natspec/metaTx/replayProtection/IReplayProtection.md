# IReplayProtection



> Replay protection for wallet meta transactions using a 2-dimensional nonce.



*A 2-dimensional nonce enables more flexible submission of transactions because they don&#39;t need to be processed in order. By using the &quot;channel&quot; which is the first dimension of the nonce, senders can send multiple  separate streams / channels of transactions independent of each other. This implementation is based on the one presented in EIP-2585 and implemented at: https://github.com/wighawag/eip-2585*

## Methods

### getNonce

```solidity
function getNonce(address _signer, uint128 _channel) external view returns (uint128)
```



*Get next nonce given the signer address and channel (1st dimension of nonce)*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _signer | address | Signer of the meta-tx |
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




