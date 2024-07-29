// SPDX-License-Identifier: GPL-3.0-only

pragma solidity 0.8.21;

/**
 * @title Meta transaction ExecutionRequest structure.
 */
interface IMetaTxRequest {  
  
  struct ExecutionRequest {
    // MetaTxRequest type hash - see MetaTxRequestManager.sol
    bytes32 typeHash; 

    // EOA address if executeTransactionEOA called
    // Licensed User wallet (LUW) address if executeTransactionLUW called
    address from;
    
    // 2d nonce packed - see ReplayProtection.sol
    uint256 nonce;

    // EIP712 encodeStruct of the MetaTx specific arguments
    // This is used when encoding the full EIP712 message to
    // check the signatures.
    bytes suffixData;

    // (OPTIONAL) calldata is required if the MetaTx type has arguments of
    // type bytes, string or array. This is because the ABI encoding differs
    // from the EIP712 encodeData encoding rules when there are properties of
    // these types.
    //
    // We make it optional to save a little gas for those MetaTx request types
    // that don't contain argument with these types. Currently the majority of
    // requests do not.
    bytes callData;
  }

}