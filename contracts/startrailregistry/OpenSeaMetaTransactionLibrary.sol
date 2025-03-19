// SPDX-License-Identifier: GPL-3.0-only

pragma solidity 0.8.28;

/**
 * Library to support Meta Transactions from OpenSea.
 * see https://docs.opensea.io/docs/polygon-basic-integration#meta-transactions
 *
 * NOTE: we leave 'functionSignature' in to ensure compatibility with OpenSea
 *   (especially as it's part of the typehash) but it should be "calldata".
 */
library OpenSeaMetaTransactionLibrary {

    // External data to be passed in from the stateful contract
    struct OpenSeaMetaTransactionStorage {
        mapping(address => uint256) nonces;
        bytes32 domainSeperator;
    }

    struct MetaTransaction {
        uint256 nonce;
        address from;
        bytes functionSignature; // sic: is calldata - see library level comment
    }

    event MetaTransactionExecuted(
        address userAddress,
        address payable relayerAddress,
        bytes functionSignature // sic: is calldata - see library level comment
    );

    bytes32 private constant META_TRANSACTION_TYPEHASH = keccak256(
        bytes(
            "MetaTransaction(uint256 nonce,address from,bytes functionSignature)"
        )
    );

    string private constant ERC712_VERSION = "1";

    bytes32 private constant EIP712_DOMAIN_TYPEHASH = keccak256(
        bytes(
            "EIP712Domain(string name,string version,address verifyingContract,bytes32 salt)"
        )
    );

    function setDomainSeparator(
        OpenSeaMetaTransactionStorage storage self,
        string memory name
    )
        internal
    {
        self.domainSeperator = keccak256(
            abi.encode(
                EIP712_DOMAIN_TYPEHASH,
                keccak256(bytes(name)),
                keccak256(bytes(ERC712_VERSION)),
                address(this),
                bytes32(getChainId())
            )
        );
    }

    function getDomainSeperator(
        OpenSeaMetaTransactionStorage storage self
    ) public view returns (bytes32) {
        return self.domainSeperator;
    }

    function getChainId() public view returns (uint256) {
        uint256 id;
        assembly {
            id := chainid()
        }
        return id;
    }

    function executeMetaTransaction(
        OpenSeaMetaTransactionStorage storage self,
        address userAddress,
        bytes memory functionSignature, // sic: is calldata - see library level comment
        bytes32 sigR,
        bytes32 sigS,
        uint8 sigV
    ) public returns (bytes memory) {
        MetaTransaction memory metaTx = MetaTransaction({
            nonce: self.nonces[userAddress],
            from: userAddress,
            functionSignature: functionSignature
        });

        require(
            verify(self, userAddress, metaTx, sigR, sigS, sigV),
            "Signer and signature do not match"
        );

        // increase nonce for user (to avoid re-use)
        self.nonces[userAddress] = self.nonces[userAddress] + 1;

        emit MetaTransactionExecuted(
            userAddress,
            payable(msg.sender),
            functionSignature
        );

        // Append userAddress and relayer address at the end to extract it
        // from calling context
        (bool success, bytes memory returnData) = address(this).call(
            abi.encodePacked(functionSignature, userAddress)
        );
        require(success, "Function call not successful");

        return returnData;
    }

    function getNonce(
        OpenSeaMetaTransactionStorage storage self,
        address user
    ) public view returns (uint256 nonce) {
        nonce = self.nonces[user];
    }

    function verify(
        OpenSeaMetaTransactionStorage storage self,
        address signer,
        MetaTransaction memory metaTx,
        bytes32 sigR,
        bytes32 sigS,
        uint8 sigV
    ) internal view returns (bool) {
        require(signer != address(0), "MetaTransaction: INVALID_SIGNER");
        return
            signer ==
            ecrecover(
                toTypedMessageHash(self, hashMetaTransaction(metaTx)),
                sigV,
                sigR,
                sigS
            );
    }


    function hashMetaTransaction(MetaTransaction memory metaTx)
        internal
        pure
        returns (bytes32)
    {
        return
            keccak256(
                abi.encode(
                    META_TRANSACTION_TYPEHASH,
                    metaTx.nonce,
                    metaTx.from,
                    keccak256(metaTx.functionSignature)
                )
            );
    }

    /**
     * Accept message hash and returns hash message in EIP712 compatible form.
     * So that it can be used to recover signer from signature signed using
     * EIP712 formatted meta tx data.
     */
    function toTypedMessageHash(
        OpenSeaMetaTransactionStorage storage self,
        bytes32 messageHash
    )
        internal
        view
        returns (bytes32)
    {
        return
            keccak256(
                abi.encodePacked("\x19\x01", getDomainSeperator(self), messageHash)
            );
    }

    function msgSenderFromEIP2771MsgData(bytes calldata msgData)
        public
        view
        returns (address sender)
    {
        if (msg.sender == address(this)) {
            bytes memory array = msgData;
            uint256 index = msgData.length;
            assembly {
                // Load the 32 bytes word from memory with the address on the lower 20 bytes, and mask those.
                sender := and(
                    mload(add(array, index)),
                    0xffffffffffffffffffffffffffffffffffffffff
                )
            }
        } else {
            sender = msg.sender;
        }
        return sender;
    }

}
