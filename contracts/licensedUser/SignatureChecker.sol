// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.13;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";

// Imports signatureSplit:
import "../common/SignatureDecoder.sol";

/**
 * @title SignatureChecker - check a list of signatures are signed by a given set of owner addresses
 *
 * @dev Adapted checkSignatures from Gnosis safe. See comments on function below.
 */
contract SignatureChecker is SignatureDecoder {

  using SafeMath for uint256;

  // see OwnerManager.sol
  address private constant SENTINEL_OWNER = address(0x1);

  /**
   * @dev Checks whether the signatures provided are valid for the provided data.
   *
   * NOTE: adapted from GnosisSafe.checkSignatures. only supports 1 of the 4 signature types.
   *
   * @param _owners LicensedUser wallet owner mapping (see OwnerManager.sol for details)
   * @param _threshold LicensedUser wallet number of signers threshold.
   * @param _dataHash Hash of the data.
   * @param _signatures Signature data to be verified.
   */
  function checkSignatures(
    mapping(address => address) storage _owners,
    uint256 _threshold,
    bytes32 _dataHash,
    bytes memory _signatures
  ) internal view {
    // Check that a threshold is set
    require(_threshold > 0, "Threshold needs to be defined!");

    // Check that the provided signature data is not too short
    require(
      _signatures.length >= _threshold.mul(65),
      "Signatures data too short"
    );

    // There cannot be an owner with address 0.
    address lastOwner = address(0);
    address currentOwner;
    uint8 v;
    bytes32 r;
    bytes32 s;
    uint256 i;

    for (i = 0; i < _threshold; i++) {
      (v, r, s) = signatureSplit(_signatures, i);

      // Use ecrecover with the messageHash for EOA signatures
      // TODO: consider using ECDSA.recover which performs a number of checks ...
      currentOwner = ecrecover(_dataHash, v, r, s);
      require(
        // Signatures must be sent ordered by the address they were signed
        // with. ie. signature signed with address 0xaaa... before  signature
        // signed with 0xbbb... Thus currentOwner must be > lastOwner checked.
        currentOwner > lastOwner &&
          _owners[currentOwner] != address(0) && // Signer must be in the owners list
          currentOwner != SENTINEL_OWNER,
        "Signer in signatures is not an owner of this wallet"
      );

      lastOwner = currentOwner;
    }
  }
}
