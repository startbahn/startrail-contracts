// SPDX-License-Identifier: GPL-3.0-only
pragma solidity ^0.6.11;

import "./IReplayProtection.sol";

/**
 * @title Replay protection for wallet meta transactions using a 2-dimensional nonce.
 *
 * @dev A 2-dimensional nonce enables more flexible submission of transactions
 * because they don't need to be processed in order. By using a "channel"
 * which is the first dimension of the 2d nonce, senders can send multiple
 * separate streams / channels of transactions independent of each other.
 *
 * This implementation is based on the one presented in EIP-2585 and implemented
 * at: https://github.com/wighawag/eip-2585
 */
contract ReplayProtection is IReplayProtection {
  // Small gas saving by setting up this constant
  uint256 constant UINT_128_SHIFT = 2**128;
  
  /*
   * 2D nonce per wallet:
   *   wallet => 
   *     channel => nonce
   */
  mapping(address => mapping(uint128 => uint128)) nonces;

  /**
   * @dev Get next nonce given the wallet and channel.
   * 
   * The contract stores a 2D nonce per wallet:
   *   wallet => 
   *     channel => nonce
   *
   * Transaction sender should first choose the value of channel. In most
   * cases this can be 0. However if sending multiple streams of transactions
   * in parallel then another channel will be chosen for the additional
   * parallel streams of transactions.
   *
   * Nonce will simply be the next available nonce in the mapping from channel.

   * @param _wallet Wallet to look up nonce for
   * @param _channel Channel of 2d nonce to look up next nonce
   * @return Next nonce
   */
  function getNonce(
    address _wallet,
    uint128 _channel
  )
    external
    override
    view
    returns (uint128)
  {
    return nonces[_wallet][_channel];
  }

  /**
   * @dev Check provided nonce is correct for the given wallet.
   *
   * Channel and nonce are packed into a single uint256. Channel is packed
   * in the higher 128bits and the nonce with in the channel the lower 128bits.
   *
   * @param _wallet Wallet nonce is applicable to
   * @param _packedNonce Packed 2D nonce
   * @return success Success or failure
   */
  function checkAndUpdateNonce(
    address _wallet,
    uint256 _packedNonce
  )
    internal
    returns (bool)
  {
    uint128 channel = uint128(_packedNonce >> 128);
    uint128 nonce = uint128(_packedNonce % UINT_128_SHIFT);

    uint128 currentNonce = nonces[_wallet][channel];
    if (nonce == currentNonce) {
      nonces[_wallet][channel] = currentNonce + 1;
      return true;
    }

    return false;
  }

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
    override
    returns (uint256 noncePacked)
  {
    noncePacked = (uint256(_channel) << 128) + _nonce;
  }
}