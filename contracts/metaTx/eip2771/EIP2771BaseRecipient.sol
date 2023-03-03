// SPDX-License-Identifier:MIT
pragma solidity 0.8.13;

import "./IEIP2771Recipient.sol";


/**
 * @title A base contract to be inherited by any contract that wants to receive
 *        transactions relayed through the MetaTxForwarder.
 *
 * @dev A subclass must use "msgSender()" instead of "msg.sender".
 *
 * NOTE: This contract is originally from:
 *   https://github.com/opengsn/forwarder/blob/master/contracts/BaseRelayRecipient.sol
 *
 * NOTE: The above is referenced on the EIP-2711 spec:
 *   https://eips.ethereum.org/EIPS/eip-2771
 */
abstract contract EIP2771BaseRecipient is IEIP2771Recipient {
  // Forwarder singleton we accept calls from.
  //
  // Store the trusted forwarder address in a slot.
  //
  // This slot value is from keccak256('trustedForwarder').
  bytes32 internal constant 
    TRUSTED_FORWARDER_ADDRESS_SLOT = 0x222cb212229f0f9bcd249029717af6845ea3d3a84f22b54e5744ac25ef224c92;

  /*
   * require a function to be called through GSN only
   */
  modifier trustedForwarderOnly() {
    require(
      msg.sender == getTrustedForwarder(),
      "Function can only be called through the trusted Forwarder"
    );
    _;
  }

  function isTrustedForwarder(address forwarder)
    public
    override
    view
    returns (bool)
  {
    return forwarder == getTrustedForwarder();
  }

  /**
   * @dev return address of the trusted forwarder.
   */
  function getTrustedForwarder() public view returns (address trustedForwarder) {
    bytes32 slot = TRUSTED_FORWARDER_ADDRESS_SLOT;
    assembly {
      trustedForwarder := sload(slot)
    }
  }

  /**
   * @dev set address of the trusted forwarder.
   */
  function _setTrustedForwarder(address _trustedForwarder) internal {
    require(_trustedForwarder != address(0));
    bytes32 slot = TRUSTED_FORWARDER_ADDRESS_SLOT;
    assembly {
      sstore(slot, _trustedForwarder)
    }
  }

  /**
   * @dev return the sender of this call.
   * if the call came through our trusted forwarder, return the original sender.
   * otherwise, return `msg.sender`.
   * should be used in the contract anywhere instead of msg.sender
   */
  function msgSender()
    internal
    override
    view
    returns (address ret)
  {
    if (msg.data.length >= 24 && isTrustedForwarder(msg.sender)) {
      // At this point we know that the sender is a trusted forwarder,
      // so we trust that the last bytes of msg.data are the verified sender address.
      // extract sender address from the end of msg.data
      assembly {
        ret := shr(96, calldataload(sub(calldatasize(), 20)))
      }
    } else {
      return msg.sender;
    }
  }
}
