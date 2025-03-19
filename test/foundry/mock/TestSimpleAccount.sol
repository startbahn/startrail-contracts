// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.28;

import { IERC1271 } from "@openzeppelin/contracts/interfaces/IERC1271.sol";
import { Initializable } from "@openzeppelin/contracts/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

/**
 * @author Tomohiro Nakamura - <tomo@startbahn.jp>
 * @dev An account which is simply owned by an Ethereum address.
 * Currently the owner address is thought to be an EOA but contract address should be able to be supported.
 */
contract TestSimpleAccount is Initializable {
  
  struct PackedUserOperation {
    address sender;
    uint256 nonce;
    bytes initCode;
    bytes callData;
    uint256 callGasLimit;
    uint256 verificationGasLimit;
    uint256 preVerificationGas;
    uint256 maxFeePerGas;
    uint256 maxPriorityFeePerGas;
    bytes paymasterAndData;
    bytes signature;
  }
  
  address public owner;
  
  event AccountInitialized(address indexed owner);
  
  constructor() {
    // @todo add EntryPoint
  }
  
  function initialize(address _owner) public initializer {
    owner = _owner;
    emit AccountInitialized(owner);
  }
  
  function validateUserOp(
    PackedUserOperation calldata userOp,
    bytes32 userOpHash,
    uint256 missingAccountFunds
  ) external returns (uint256 validationData) {
    // TODO: implement this function
  }
  
  function executeUserOp(
    PackedUserOperation calldata userOp,
    bytes32 userOpHash
  ) external {
    // TODO: implement this function
  }
  
  function isValidSignature(bytes32 hash, bytes memory signature) external view returns (bytes4 magicValue) {
    address recoveredAddress = ECDSA.recover(hash, signature);
    if (recoveredAddress == owner) {
      // bytes4(keccak256("isValidSignature(bytes32,bytes)")
      return 0x1626ba7e;
    } else {
      return 0xffffffff;
    }
  }
}
