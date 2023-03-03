// SPDX-License-Identifier: GPL-3.0-only

pragma solidity 0.8.13;

import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

import "../common/INameRegistry.sol";
import "../metaTx/eip2771/EIP2771BaseRecipient.sol";
import "../name/Contracts.sol";
import "../proxy/utils/InitializableWithGap.sol";

interface IStartrailRegistry {
    function createSRRFromBulk(
        bool isPrimaryIssuer,
        address artistAddress,
        bytes32 metadataDigest,
        address issuerAddress
    ) external returns (uint256);
}

contract BulkIssueV1 is 
    Contracts,
    InitializableWithGap,
    EIP2771BaseRecipient
{
    using ECDSA for bytes32;
    
    /*
     * Structs
     */
    struct Batch {
        bool prepared;
        address issuer;
        uint8 processedCount;
        mapping(bytes32 => bool) processedLeaves;
    }

    /*
     * Events
     */

    event BatchPrepared(
        bytes32 indexed merkleRoot,
        address indexed sender
    );
    event CreateSRRWithProof(
        bytes32 indexed merkleRoot,
        uint256 indexed tokenId,
        bytes32 srrHash
    );
    event MigrateBatch(
        bytes32 indexed merkleRoot,
        bytes32[] processedLeaves,
        address issuer,
        uint256 originTimestampCreated,
        uint256 originTimestampUpdated
    );

    /*
     * State
     */

    address public nameRegistryAddress;
    mapping(bytes32 => Batch) public batches;

    /*
     * Modifiers
     */
    modifier isNewBatch(bytes32 merkleRoot) {
        require(
            !batches[merkleRoot].prepared,
            "Batch already exists for the given merkle root"
        );
        _;
    }

    modifier batchExists(bytes32 merkleRoot) {
        require(
            batches[merkleRoot].prepared,
            "Batch doesn't exist for the given merkle root"
        );
        _;
    }

    modifier srrNotAlreadyProcessed(bytes32 merkleRoot, bytes32 srrHash) {
        require(
            !batches[merkleRoot].processedLeaves[srrHash],
            "SRR already processed."
        );
        _;
    }

    modifier onlyAdministrator() {
        require(
            INameRegistry(nameRegistryAddress).administrator() == msg.sender,
            "Caller is not the Startrail Administrator"
        );
        _;
    }

    /*
     * Public functions
     */

    /**
     * @dev Initializes the BulkIssue contract
     */
    function initialize(address _nameRegistry, address _trustedForwarder) public initializer {
        nameRegistryAddress = _nameRegistry;
        _setTrustedForwarder(_trustedForwarder);
    }

    function setTrustedForwarder(
        address forwarder
    ) public onlyAdministrator {
        _setTrustedForwarder(forwarder);
    }

    /**
     * @dev Reserves a batch request before excuting
     * @param merkleRoot bytes32 of merkle root
     */
    function prepareBatchFromLicensedUser(
        bytes32 merkleRoot
    )
        public
        isNewBatch(merkleRoot)
        trustedForwarderOnly
    {
        _prepareBatch(merkleRoot);
    }

    /**
     * @dev Creates SRR with merkle proof
     * @param merkleProof bytes32 of merkle proof value
     * @param merkleRoot bytes32 of merkle root value
     * @param srrHash bytes32 of merkle tree leaf
     * @param isPrimaryIssuer boolean whether the user is a primary issuer
     * @param artistAddress address of the artist contract
     * @param metadataDigest bytes32 of metadata hash
     */
    function createSRRWithProof(
        bytes32[] memory merkleProof,
        bytes32 merkleRoot,
        bytes32 srrHash,
        bool isPrimaryIssuer,
        address artistAddress,
        bytes32 metadataDigest
    )
        public
        batchExists(merkleRoot)
        srrNotAlreadyProcessed(merkleRoot, srrHash)
        returns (uint256 tokenId)
    {
        require(
            verifySRRHash(
                srrHash,
                isPrimaryIssuer,
                artistAddress,
                metadataDigest
            ),
            "srrHash does not match the srr details"
        );

        require(
            MerkleProof.verify(merkleProof, merkleRoot, srrHash),
            "Merkle proof verification failed"
        );

        batches[merkleRoot].processedLeaves[srrHash] = true;
        batches[merkleRoot].processedCount++;

        tokenId = _startrailRegistry().createSRRFromBulk(
            isPrimaryIssuer,
            artistAddress,
            metadataDigest,
            batches[merkleRoot].issuer // LUW address - issuer
        );
        emit CreateSRRWithProof(merkleRoot, tokenId, srrHash);
    }

    /**
     * @dev Verify the hash of the params when creating SRR
     * @param srrHash bytes32 of hash value of all other params
     * @param isPrimaryIssuer boolean whether the user is a primary issuer
     * @param artistAddress address of the artist contract
     * @param metadataDigest bytes32 of metadata hash
     */
    function verifySRRHash(
        bytes32 srrHash,
        bool isPrimaryIssuer,
        address artistAddress,
        bytes32 metadataDigest
    ) public pure returns (bool hashMatches) {
        hashMatches =
            srrHash ==
            keccak256(
                abi.encodePacked(isPrimaryIssuer, artistAddress, metadataDigest)
            );
    }

    /**
     * @dev Creates SRR with merkle proof
     * @param merkleRoot bytes32 of merkle root value
     * @param processedLeaves bytes32 of all leafs issued so far
     * @param issuer Batch issuer
     */
    function migrateBatch(
        bytes32 merkleRoot,
        bytes32[] calldata processedLeaves,
        address issuer,
        uint256 originTimestampCreated,
        uint256 originTimestampUpdated
    )
        public
        onlyAdministrator()
    {
        Batch storage batch = batches[merkleRoot]; 
        batch.issuer = issuer;
        batch.prepared = true;
        batch.processedCount = uint8(processedLeaves.length);

        for (uint256 i = 0; i < processedLeaves.length; i++) {
            batches[merkleRoot].processedLeaves[processedLeaves[i]] = true;
        }
        
        emit MigrateBatch(
            merkleRoot,
            processedLeaves,
            issuer,
            originTimestampCreated,
            originTimestampUpdated
        );
    }

    /**
     * Private functions
     */

    function _prepareBatch(bytes32 merkleRoot) private {
        Batch storage batch = batches[merkleRoot]; 
        batch.issuer = msgSender();
        batch.prepared = true;
        batch.processedCount = 0;
        emit BatchPrepared(merkleRoot, batch.issuer);
    }

    function _startrailRegistry() private view returns (IStartrailRegistry sr) {
        sr = IStartrailRegistry(
            INameRegistry(nameRegistryAddress).get(STARTRAIL_REGISTRY)
        );
    }

}
