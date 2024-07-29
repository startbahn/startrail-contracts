// SPDX-License-Identifier: GPL-3.0-only

pragma solidity 0.8.21;

import "../proxy/utils/InitializableWithGap.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

import "../common/INameRegistry.sol";
import "../metaTx/eip2771/EIP2771BaseRecipient.sol";
import "../name/Contracts.sol";

interface IStartrailRegistry {
    // backward compatibility
    function createSRRFromBulk(
        bool isPrimaryIssuer,
        address artistAddress,
        bytes32 metadataDigest,
        address issuerAddress,
        bool lockExternalTransfer
    ) external returns (uint256);

    function createSRRFromBulk(
        bool isPrimaryIssuer,
        address artistAddress,
        bytes32 metadataDigest,
        string memory metadataCID,
        address issuerAddress,
        bool lockExternalTransfer
    ) external returns (uint256);
}

contract BulkIssueV4 is 
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

    /*
     * Legacy Events 
     * - emitted in previous versions of the contract
     * - leave here so they appear in ABI and can be indexed by the subgraph
     */

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
     * backward compatibility
     * @dev Creates multiple SRRs with merkle proofs
     * @param merkleProofs list of bytes32 of merkle proof value
     * @param merkleRoot bytes32 of merkle root value
     * @param srrHashes list of bytes32 of merkle tree leaf
     * @param isPrimaryIssuers list of primary issuer flags
     * @param artistAddresses list of address of artist
     * @param metadataDigests list of metadata hashes
     * @param lockExternalTransfers list of lock transfer flags
     */
    function createSRRWithProofMulti(
        bytes32[][] memory merkleProofs,
        bytes32 merkleRoot,
        bytes32[] memory srrHashes,
        bool[] memory isPrimaryIssuers,
        address[] memory artistAddresses,
        bytes32[] memory metadataDigests,
        bool[] memory lockExternalTransfers
    )
        public
        batchExists(merkleRoot)
        returns (uint256[] memory tokenIds)
    {
        tokenIds = new uint256[](srrHashes.length);

        for (uint256 i = 0; i < srrHashes.length; i++) {
            require(
                !batches[merkleRoot].processedLeaves[srrHashes[i]],
                "SRR already processed."
            );

            bytes32 metadataDigest = metadataDigests[i];
       
            require(
                verifySRRHash(
                    srrHashes[i],
                    isPrimaryIssuers[i],
                    artistAddresses[i],
                    metadataDigest,
                    "",
                    lockExternalTransfers[i]
                ),
                "srrHash does not match the srr details"
            );

            tokenIds[i] = _createSRRWithProof(
                merkleProofs[i], 
                merkleRoot, 
                srrHashes[i],
                isPrimaryIssuers[i],
                artistAddresses[i],
                metadataDigest,
                "",
                lockExternalTransfers[i]
            );
        }
    }

    /**
     * @dev Creates multiple SRRs with merkle proofs
     * @param merkleProofs list of bytes32 of merkle proof value
     * @param merkleRoot bytes32 of merkle root value
     * @param srrHashes list of bytes32 of merkle tree leaf
     * @param isPrimaryIssuers list of primary issuer flags
     * @param artistAddresses list of address of artist
     * @param metadataDigests list of metadata hashes
     * @param metadataCIDs list of ipfs cid
     * @param lockExternalTransfers list of lock transfer flags
     */
    function createSRRWithProofMulti(
        bytes32[][] memory merkleProofs,
        bytes32 merkleRoot,
        bytes32[] memory srrHashes,
        bool[] memory isPrimaryIssuers,
        address[] memory artistAddresses,
        bytes32[] memory metadataDigests,
        string[] memory metadataCIDs,
        bool[] memory lockExternalTransfers
    )
        public
        batchExists(merkleRoot)
        returns (uint256[] memory tokenIds)
    {
        tokenIds = new uint256[](srrHashes.length);

        for (uint256 i = 0; i < srrHashes.length; i++) {
            require(
                !batches[merkleRoot].processedLeaves[srrHashes[i]],
                "SRR already processed."
            );

            bytes32 metadataDigest = metadataDigests[i];
            string memory metadataCID;
            if(metadataCIDs.length != 0) {
                metadataCID = metadataCIDs[i];
            }
       
            require(
                verifySRRHash(
                    srrHashes[i],
                    isPrimaryIssuers[i],
                    artistAddresses[i],
                    metadataDigest,
                    metadataCID,
                    lockExternalTransfers[i]
                ),
                "srrHash does not match the srr details"
            );

            tokenIds[i] = _createSRRWithProof(
                merkleProofs[i], 
                merkleRoot, 
                srrHashes[i],
                isPrimaryIssuers[i],
                artistAddresses[i],
                metadataDigest,
                metadataCID,
                lockExternalTransfers[i]
            );
        }
    }

    /**
     * @dev Verify the hash of the params when creating SRR
     * This method exists for backward compatibility. We plan to remove it in a future release.
     * @param srrHash bytes32 of hash value of all other params
     * @param isPrimaryIssuer boolean whether the user is a primary issuer
     * @param artistAddress address of the artist contract
     * @param metadataDigest bytes32 of metadata hash
     * @param metadataCID string of ipfs cid
     * @param lockExternalTransfer bool of the transfer permission flag to marketplaces
     */
    function verifySRRHash(
        bytes32 srrHash,
        bool isPrimaryIssuer,
        address artistAddress,
        bytes32 metadataDigest,
        string memory metadataCID,
        bool lockExternalTransfer
    ) public pure returns (bool hashMatches) {
        bool isCID = isCIDString(metadataCID);
        if(isCID) {
            hashMatches =
                srrHash ==
                keccak256(
                    abi.encodePacked(isPrimaryIssuer, artistAddress, metadataCID, lockExternalTransfer)
                );
        } else {
            hashMatches =
                srrHash ==
                keccak256(
                    abi.encodePacked(isPrimaryIssuer, artistAddress, metadataDigest, lockExternalTransfer)
                );
        }
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

    function _createSRRWithProof(
        bytes32[] memory merkleProof,
        bytes32 merkleRoot,
        bytes32 srrHash,
        bool isPrimaryIssuer,
        address artistAddress,
        bytes32 metadataDigest,
        string memory metadataCID,
        bool lockExternalTransfer
    )   
        internal 
        returns (uint256 tokenId) 
    {
        require(
            MerkleProof.verify(merkleProof, merkleRoot, srrHash),
            "Merkle proof verification failed"
        );

        batches[merkleRoot].processedLeaves[srrHash] = true;
        batches[merkleRoot].processedCount++;
        
        // Avoid `Stack too deep` error
        address issuerAddress;
        {
            issuerAddress = batches[merkleRoot].issuer; // LUW address - issuer
        }
        
        bool isCID = isCIDString(metadataCID);
        if (isCID) { 
            tokenId = _startrailRegistry().createSRRFromBulk(
                isPrimaryIssuer,
                artistAddress,
                metadataDigest,
                metadataCID,
                issuerAddress, 
                lockExternalTransfer
            );
        } else {
            tokenId = _startrailRegistry().createSRRFromBulk(
                isPrimaryIssuer,
                artistAddress,
                metadataDigest,
                issuerAddress, 
                lockExternalTransfer
            );
        }
        emit CreateSRRWithProof(merkleRoot, tokenId, srrHash);
    }

    function isCIDString(string memory _string) internal pure returns (bool) {
        return  bytes(_string).length > 0;
    }
}
