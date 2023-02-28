// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.6.11;

import "../metaTx/replayProtection/ReplayProtection.sol";

/**
 * TEST ONLY concrete implementation that allows internal function to be 
 * called from tests.
 */
contract IsReplayProtection is ReplayProtection {
  function checkAndUpdateNoncePublic(
    address _wallet,
    uint256 _nonce
  )
    public
    returns (bool)
  {
     return checkAndUpdateNonce(_wallet, _nonce);
  }
}