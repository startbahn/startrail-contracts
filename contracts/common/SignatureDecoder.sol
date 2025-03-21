// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.28;

/**
 * @title SignatureDecoder - Decodes signatures that are encoded as bytes
 * @author Ricardo Guilherme Schmidt (Status Research & Development GmbH)
 * @author Richard Meissner - <richard@gnosis.pm>
 * @dev From Gnosis safe. Changes made:
 *  - removed unused recoveryKey function (used in StateChannelModule in Gnosis safe)
 */
contract SignatureDecoder {
  /**
   * @dev divides bytes signature into `uint8 v, bytes32 r, bytes32 s`.
   * @notice Make sure to peform a bounds check for @param pos, to avoid out of bounds access on @param signatures
   * @param pos which signature to read. A prior bounds check of this parameter should be performed, to avoid out of bounds access
   * @param signatures concatenated rsv signatures
   */
  function signatureSplit(
    bytes memory signatures,
    uint256 pos
  )
    internal
    pure
    returns (
      uint8 v,
      bytes32 r,
      bytes32 s
    )
  {
    // The signature format is a compact form of:
    //   {bytes32 r}{bytes32 s}{uint8 v}
    // Compact means, uint8 is not padded to 32 bytes.
    // solium-disable-next-line security/no-inline-assembly
    assembly {
      let signaturePos := mul(0x41, pos)
      r := mload(add(signatures, add(signaturePos, 0x20)))
      s := mload(add(signatures, add(signaturePos, 0x40)))
      // Here we are loading the last 32 bytes, including 31 bytes
      // of 's'. There is no 'mload8' to do this.
      //
      // 'byte' is not working due to the Solidity parser, so lets
      // use the second best option, 'and'
      v := and(mload(add(signatures, add(signaturePos, 0x41))), 0xff)
    }
  }
}
