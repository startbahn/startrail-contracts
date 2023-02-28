// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.6.11;

/**
 * @title Replay protection for wallet meta transactions using a 2-dimensional nonce.
 *
 * @dev A 2-dimensional nonce enables more flexible submission of transactions
 * because they don't need to be processed in order. By using the "channel"
 * which is the first dimension of the nonce, senders can send multiple 
 * separate streams / channels of transactions independent of each other.
 *
 * This implementation is based on the one presented in EIP-2585 and implemented
 * at: https://github.com/wighawag/eip-2585
 */
interface IReplayProtection {
  /**
   * @dev Get next nonce given the signer address and channel (1st dimension of nonce)
   * @param _signer Signer of the meta-tx
   * @param _channel Channel of 2d nonce to look up next nonce
   * @return Next nonce
   */
  function getNonce(
    address _signer,
    uint128 _channel
  ) external view returns (uint128);

  /**
   * @dev Packs channel and nonce with in channel into a single uint256.
   *
   * Clients send the 2D nonce packed into a single uint256.
   *
   * This function is a helper to pack the nonce.
   *
   * It can also of course be done client side. For example with ethers.BigNumber:
   * 
   * ```
   *  nonce = ethers.BigNumber.from(channel).
   *            shl(128).
   *            add(ethers.BigNumber.from(nonce))
   * ```
   *
   * @param _channel Channel of 2D nonce
   * @param _nonce Nonce with in channel of 2D nonce
   * @return noncePacked Packed uint256 nonce
   */
  function packNonce(
    uint128 _channel,
    uint128 _nonce
  )
    external
    pure
    returns (uint256 noncePacked);
}
