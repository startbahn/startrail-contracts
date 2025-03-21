// SPDX-License-Identifier:MIT

pragma solidity 0.8.28;

/**
 * @title A contract must implement this interface in order to support relayed
 *        transaction from MetaTxForwarder.
 *
 * @dev It is better to inherit the EIP2771BaseRecipient as the implementation.
 *
 * NOTE: This contract is originally from:
 *   https://github.com/opengsn/forwarder/blob/master/contracts/interfaces/IRelayRecipient.sol
 *
 * One modification to the original:
 *   - removed versionRecipient as it is not in the EIP2771 spec. and as yet
 *     we don't have a use case for this
 */
abstract contract IEIP2771Recipient {
  /**
   * @dev return if the forwarder is trusted to forward relayed transactions to us.
   * the forwarder is required to verify the sender's signature, and verify
   * the call is not a replay.
   */
  function isTrustedForwarder(address forwarder)
    public
    virtual
    view
    returns (bool);

  /**
   * @dev return the sender of this call.
   * if the call came through our trusted forwarder, then the real sender is appended as the last 20 bytes
   * of the msg.data.
   * otherwise, return `msg.sender`
   * should be used in the contract anywhere instead of msg.sender
   */
  function msgSender() internal virtual view returns (address);
}
