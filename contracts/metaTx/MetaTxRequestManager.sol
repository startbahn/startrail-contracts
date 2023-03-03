// SPDX-License-Identifier: GPL-3.0-only
pragma solidity 0.8.13;

import "../proxy/utils/InitializableWithGap.sol";
import "../common/INameRegistry.sol";
import "./IMetaTxRequest.sol";

/**
 * @title MetaTxRequestManager - a register of Startrail MetaTx request types
 * @dev This contract maintains a register of all Startrail meta transaction
 * request types.
 *
 * Each request is registered with an EIP712 typeHash. The type hash and
 * corresponding type string are emitted with event RequestTypeRegistered
 * at registration time.
 *
 * All request types share a common set of parameters defined by
 * GENERIC_PARAMS.
 *
 * The function encodeRequest is provided to build a an EIP712 signature
 * encoding for a given request type and inputs.
 * @author Chris Hatch - <chris.hatch@startbahn.jp>
 */
contract MetaTxRequestManager is InitializableWithGap, IMetaTxRequest {
    //
    // Types
    //

    struct MetaTxRequestType {
        address destination;
        bytes4 functionSignature;
    }

    //
    // Events
    //

    event RequestTypeRegistered(bytes32 indexed typeHash, string typeStr);
    event RequestTypeUnregistered(bytes32 indexed typeHash);

    //
    // Constants
    //

    string public constant DOMAIN_NAME = "Startrail";
    string public constant DOMAIN_VERSION = "1";
    bytes32 public constant DOMAIN_SEPARATOR_TYPEHASH =
        keccak256(
            "EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"
        );

    string public constant GENERIC_PARAMS = "address from,uint256 nonce";

    //
    // State
    //

    // register of request types
    mapping(bytes32 => bool) public typeHashes;

    // each request type typeHash maps to details
    mapping(bytes32 => MetaTxRequestType) public requestTypes;

    bytes32 public domainSeparator;

    address public nameRegistryAddress;

    //
    // Modifiers
    //

    modifier requestTypeRegistered(bytes32 _typeHash) {
        require(typeHashes[_typeHash] == true, "request type not registered");
        _;
    }

    modifier onlyAdministrator() {
        require(
            INameRegistry(nameRegistryAddress).administrator() == msg.sender,
            "Caller is not the Startrail Administrator"
        );
        _;
    }

    //
    // Functions
    //

    /**
     * @dev Setup the contract - build the domain separator with chain id
     */
    function __MTRM_initialize(address _nameRegistryAddress)
        internal
        initializer
    {
        uint256 chainId;
        // solium-disable-next-line security/no-inline-assembly
        assembly {
            chainId := chainid()
        }

        domainSeparator = keccak256(
            abi.encode(
                DOMAIN_SEPARATOR_TYPEHASH,
                keccak256(bytes(DOMAIN_NAME)),
                keccak256(bytes(DOMAIN_VERSION)),
                chainId,
                this // verifyingContract
            )
        );

        nameRegistryAddress = _nameRegistryAddress;
    }

    /**
     * @dev Add a new request type to the register.
     *
     * _typeSuffix defines the parameters that follow the GENERIC_PARAMS
     * (defined above). The format should follow the EIP712 spec.
     *
     * Where the full type hash is:
     *
     *   name ‖ "(" ‖ member₁ ‖ "," ‖ member₂ ‖ "," ‖ … ‖ memberₙ ")"
     *
     * _typeSuffix format can be defined as:
     *
     *   memberₘ ‖ "," ‖ … ‖ memberₙ
     *
     * @param _typeName Request type name
     * @param _typeSuffix Defines parameters specific to the request
     * @param _destinationContract Single fixed destination of this request
     * @param _functionSignature 4 byte Solidity function signature to call
     */
    function registerRequestType(
        string calldata _typeName,
        string calldata _typeSuffix,
        address _destinationContract,
        bytes4 _functionSignature
    ) external onlyAdministrator {
        // Check the name doesn't have '(' or ')' inside it
        for (uint256 i = 0; i < bytes(_typeName).length; i++) {
            bytes1 c = bytes(_typeName)[i];
            require(c != "(" && c != ")", "invalid typename");
        }

        string memory requestType = string(
            abi.encodePacked(
                _typeName,
                "(",
                GENERIC_PARAMS,
                ",",
                _typeSuffix,
                ")"
            )
        );
        bytes32 requestTypeHash = keccak256(bytes(requestType));
        require(
            typeHashes[requestTypeHash] == false,
            "Already registered type with this typeHash"
        );

        typeHashes[requestTypeHash] = true;
        requestTypes[requestTypeHash] = MetaTxRequestType(
            _destinationContract,
            _functionSignature
        );
        emit RequestTypeRegistered(requestTypeHash, string(requestType));
    }

    /**
     * @dev Remove a new request type from the register.
     * @param _typeHash Request type hash
     */
    function unregisterRequestType(bytes32 _typeHash)
        external
        requestTypeRegistered(_typeHash)
        onlyAdministrator
    {
        // remove typeHash - using delete instead of assigning false here is
        // slightly cheaper (measured 121 gas difference) and both get a small
        // refund:
        delete typeHashes[_typeHash];

        // remove type details
        delete requestTypes[_typeHash];

        emit RequestTypeUnregistered(_typeHash);
    }

    /**
     * @dev Encodes request details into EIP712 spec encoding format.
     * @param _request ExecutionRequest - transaction details
     * @return Transaction hash bytes.
     */
    function encodeRequest(ExecutionRequest calldata _request)
        public
        view
        requestTypeRegistered(_request.typeHash)
        returns (bytes memory)
    {
        //
        // EIP712 spec:
        //
        //   hashStruct(s : 𝕊) = keccak256(
        //     typeHash ‖
        //     encodeData(s)
        //   )
        //
        bytes memory encodedStructPrefix = abi.encodePacked(
            _request.typeHash,
            abi.encode(_request.from, _request.nonce)
        );
        bytes memory encodedStructSuffix = (_request.callData.length > 0)
            ? abi.encodePacked(
                keccak256(_request.callData),
                _request.suffixData
            )
            : abi.encodePacked(_request.suffixData);

        bytes32 txHash = keccak256(
            abi.encodePacked(encodedStructPrefix, encodedStructSuffix)
        );

        //
        // EIP712 spec:
        //
        //   encode(domainSeparator : 𝔹²⁵⁶, message : 𝕊) =
        //     "\x19\x01" ‖
        //     domainSeparator ‖
        //     hashStruct(message)
        //   )
        //
        return
            abi.encodePacked(
                bytes1(0x19),
                bytes1(0x01),
                domainSeparator,
                txHash
            );
    }
}
