import ethers, { Signature } from 'ethers'
import {
  BytesLike,
  defaultAbiCoder,
  id as keccak256Str,
  keccak256,
  SigningKey,
  solidityKeccak256,
  splitSignature,
} from 'ethers/lib/utils'

const META_TX_TYPE_HASH = keccak256Str(
  "MetaTransaction(uint256 nonce,address from,bytes functionSignature)"
);

const toTypedMessageHash = async (
  startrailRegistry: ethers.Contract,
  fromAddress: string,
  metaTxCalldata: BytesLike,
  nonceOverride?: string
): Promise<string> => {
  const messageHash = keccak256(
    defaultAbiCoder.encode(
      ["bytes32", "uint256", "address", "bytes32"],
      [
        META_TX_TYPE_HASH,
        nonceOverride || (await startrailRegistry.getNonce(fromAddress)),
        fromAddress,
        keccak256(metaTxCalldata),
      ]
    )
  );
  return solidityKeccak256(
    ["string", "bytes32", "bytes32"],
    ["\x19\x01", await startrailRegistry.getDomainSeperator(), messageHash]
  );
};

const signMetaTx = async (
  startrailRegistry: ethers.Contract,
  fromWallet: ethers.Wallet,
  callData: BytesLike,
  nonceOverride?: string
): Promise<Signature> => {
  const msgHash = await toTypedMessageHash(
    startrailRegistry,
    fromWallet.address,
    callData,
    nonceOverride
  );
  const signingKey = new SigningKey(fromWallet.privateKey);
  const signatureFlattened = await signingKey.signDigest(msgHash);
  return splitSignature(signatureFlattened);
};

export { META_TX_TYPE_HASH, signMetaTx, toTypedMessageHash };
