// SPDX-License-Identifier: GPL-3.0-only

pragma solidity 0.6.11;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts-ethereum-package/contracts/Initializable.sol";
import "@openzeppelin/contracts/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/cryptography/ECDSA.sol";

import "../common/INameRegistry.sol";
import "../metaTx/eip2771/EIP2771BaseRecipient.sol";
import "../name/Contracts.sol";

interface IStartrailRegistry {
    function createSRRFromBulk(
        bool isPrimaryIssuer,
        address artistAddress,
        bytes32 metadataDigest,
        address issuerAddress,
        bool lockExternalTransfer
    ) external returns (uint256);

    function approveSRRByCommitmentFromBulk(
        uint256 tokenId,
        bytes32 commitment,
        string memory historyMetadataDigest,
        uint256 customHistoryId
    ) external;

    function transferFromWithProvenanceFromBulk(
        address to,
        uint256 tokenId,
        string memory historyMetadataDigest,
        uint256 customHistoryId,
        bool isIntermediary
    ) external;
}

contract Bulk is 
    Contracts,
    Initializable,
    EIP2771BaseRecipient
{
    using ECDSA for bytes32;
    
    /*
     * Structs
     */
    struct Batch {
        bool prepared;
        address signer;
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
        bytes32 leafHash
    );
    event ApproveSRRByCommitmentWithProof(
        bytes32 indexed merkleRoot,
        uint256 indexed tokenId,
        bytes32 leafHash
    );
    event TransferFromWithProvenanceWithProof(
        bytes32 indexed merkleRoot,
        uint256 indexed tokenId,
        bytes32 leafHash
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

    modifier srrNotAlreadyProcessed(bytes32 merkleRoot, bytes32 leafHash) {
        require(
            !batches[merkleRoot].processedLeaves[leafHash],
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
     * This method exists for backward compatibility. We plan to remove it in a future release.
     * @param merkleProof bytes32 of merkle proof value
     * @param merkleRoot bytes32 of merkle root value
     * @param leafHash bytes32 of merkle tree leaf
     * @param isPrimaryIssuer boolean whether the user is a primary issuer
     * @param artistAddress address of the artist contract
     * @param metadataDigest bytes32 of metadata hash
     */
    function createSRRWithProof(
        bytes32[] memory merkleProof,
        bytes32 merkleRoot,
        bytes32 leafHash,
        bool isPrimaryIssuer,
        address artistAddress,
        bytes32 metadataDigest
    )
        public
        batchExists(merkleRoot)
        srrNotAlreadyProcessed(merkleRoot, leafHash)
        returns (uint256 tokenId)
    {
        require(
            verifyLeafHash(
                leafHash,
                isPrimaryIssuer,
                artistAddress,
                metadataDigest
            ),
            "leafHash does not match the srr details"
        );
        tokenId = _createSRRWithProof(
            merkleProof, 
            merkleRoot, 
            leafHash, 
            isPrimaryIssuer, 
            artistAddress, 
            metadataDigest, 
            false
        );
    }

    /**
     * @dev Verify the hash of the params when creating SRR
     * This method exists for backward compatibility. We plan to remove it in a future release.
     * @param leafHash bytes32 of hash value of all other params
     * @param isPrimaryIssuer boolean whether the user is a primary issuer
     * @param artistAddress address of the artist contract
     * @param metadataDigest bytes32 of metadata hash
     */
    function verifyLeafHash(
        bytes32 leafHash,
        bool isPrimaryIssuer,
        address artistAddress,
        bytes32 metadataDigest
    ) public pure returns (bool hashMatches) {
        hashMatches =
            leafHash ==
            keccak256(
                abi.encodePacked(isPrimaryIssuer, artistAddress, metadataDigest)
            );
    }

    /**
     * @dev Creates SRR with merkle proof
     * @param merkleProof bytes32 of merkle proof value
     * @param merkleRoot bytes32 of merkle root value
     * @param leafHash bytes32 of merkle tree leaf
     * @param isPrimaryIssuer boolean whether the user is a primary issuer
     * @param artistAddress address of the artist contract
     * @param metadataDigest bytes32 of metadata hash
     * @param lockExternalTransfer bool of the flag to disable standard ERC721 transfer methods
     */
    function createSRRWithProof(
        bytes32[] memory merkleProof,
        bytes32 merkleRoot,
        bytes32 leafHash,
        bool isPrimaryIssuer,
        address artistAddress,
        bytes32 metadataDigest,
        bool lockExternalTransfer
    )
        public
        batchExists(merkleRoot)
        srrNotAlreadyProcessed(merkleRoot, leafHash)
        returns (uint256 tokenId)
    {
        require(
            verifyLeafHash(
                leafHash,
                isPrimaryIssuer,
                artistAddress,
                metadataDigest,
                lockExternalTransfer
            ),
            "leafHash does not match the srr details"
        );
        tokenId = _createSRRWithProof(
            merkleProof, 
            merkleRoot, 
            leafHash, 
            isPrimaryIssuer, 
            artistAddress, 
            metadataDigest, 
            lockExternalTransfer
        );
    }
    
    /**
     * @dev Creates multiple SRRs with merkle proofs
     * @param merkleProofs list of bytes32 of merkle proof value
     * @param merkleRoot bytes32 of merkle root value
     * @param leafHashes list of bytes32 of merkle tree leaf
     * @param isPrimaryIssuers list of primary issuer flags
     * @param artistAddresses list of address of artist
     * @param metadataDigests list of metadata hashes
     * @param lockExternalTransfers list of lock transfer flags
     */
    function createSRRWithProofMulti(
        bytes32[][] memory merkleProofs,
        bytes32 merkleRoot,
        bytes32[] memory leafHashes,
        bool[] memory isPrimaryIssuers,
        address[] memory artistAddresses,
        bytes32[] memory metadataDigests,
        bool[] memory lockExternalTransfers
    )
        public
        batchExists(merkleRoot)
        returns (uint256[] memory tokenIds)
    {
        tokenIds = new uint256[](leafHashes.length);

        for (uint256 i = 0; i < leafHashes.length; i++) {
            require(
                !batches[merkleRoot].processedLeaves[leafHashes[i]],
                "SRR already processed."
            );
            
            require(
                verifyLeafHash(
                    leafHashes[i],
                    isPrimaryIssuers[i],
                    artistAddresses[i],
                    metadataDigests[i],
                    lockExternalTransfers[i]
                ),
                "leafHash does not match the srr details"
            );

            tokenIds[i] = _createSRRWithProof(
                merkleProofs[i], 
                merkleRoot, 
                leafHashes[i],
                isPrimaryIssuers[i],
                artistAddresses[i],
                metadataDigests[i],
                lockExternalTransfers[i]
            );
        }
    }

    /**
     * @dev Verify the hash of the params when creating SRR
     * This method exists for backward compatibility. We plan to remove it in a future release.
     * @param leafHash bytes32 of hash value of all other params
     * @param isPrimaryIssuer boolean whether the user is a primary issuer
     * @param artistAddress address of the artist contract
     * @param metadataDigest bytes32 of metadata hash
     * @param lockExternalTransfer bool of the transfer permission flag to marketplaces
     */
    function verifyLeafHash(
        bytes32 leafHash,
        bool isPrimaryIssuer,
        address artistAddress,
        bytes32 metadataDigest,
        bool lockExternalTransfer
    ) public pure returns (bool hashMatches) {
        hashMatches =
            leafHash ==
            keccak256(
                abi.encodePacked(isPrimaryIssuer, artistAddress, metadataDigest, lockExternalTransfer)
            );
    }

    /**
     * @dev ApproveSRRByCommitment with merkle proof
     * @param merkleProof bytes32 of merkle proof value
     * @param merkleRoot bytes32 of merkle root value
     * @param leafHash bytes32 of merkle tree leaf
     * @param tokenId uint256 of StartrailRegistryRecordID
     * @param commitment bytes32 of the commitment hash
     * @param historyMetadataDigest string of metadata hash
     * @param customHistoryId uint256 customHistoryId
     */
    function approveSRRByCommitmentWithProof(
        bytes32[] memory merkleProof,
        bytes32 merkleRoot,
        bytes32 leafHash,
        uint256 tokenId,
        bytes32 commitment,
        string memory historyMetadataDigest,
        uint256 customHistoryId
    )
        public
        batchExists(merkleRoot)
        srrNotAlreadyProcessed(merkleRoot, leafHash)
    {
        require(
            verifyApproveSRRByCommitmentHash(
                leafHash, 
                tokenId, 
                commitment, 
                historyMetadataDigest,
                customHistoryId
            ),
            "leafHash does not match the approveSRRByCommitment details"
        );

        require(
            MerkleProof.verify(merkleProof, merkleRoot, leafHash),
            "Merkle proof verification failed"
        );

        batches[merkleRoot].processedLeaves[leafHash] = true;
        batches[merkleRoot].processedCount++;
        _startrailRegistry().approveSRRByCommitmentFromBulk(
            tokenId, 
            commitment, 
            historyMetadataDigest, 
            customHistoryId
        );

        emit ApproveSRRByCommitmentWithProof(merkleRoot, tokenId, leafHash);
    }

    /**
     * @dev Verify the hash of the params for approveSRRByCommitment
     * @param leafHash bytes32 of hash value of all other params
     * @param tokenId uint256 of StartrailRegistryRecordID
     * @param commitment bytes32 of the commitment hash
     * @param historyMetadataDigest string of metadata hash
     * @param customHistoryId uint256 customHistoryId
     */
    function verifyApproveSRRByCommitmentHash(
        bytes32 leafHash,
        uint256 tokenId,
        bytes32 commitment,
        string memory historyMetadataDigest,
        uint256 customHistoryId
    ) public pure returns (bool hashMatches) {
        hashMatches =
            leafHash ==
            keccak256(
                abi.encodePacked(tokenId, commitment, historyMetadataDigest, customHistoryId)
            );
    }

    /**
     * @dev TransferFromWithProvenance with merkle proof
     * @param merkleProof bytes32 of merkle proof value
     * @param merkleRoot bytes32 of merkle root value
     * @param leafHash bytes32 of merkle tree leaf
     * @param tokenId uint256 of StartrailRegistryRecordID
     * @param historyMetadataDigest string of metadata hash
     * @param customHistoryId uint256 customHistoryId
     * @param isIntermediary bool isIntermediary
     */
    function transferFromWithProvenanceWithProof(
        bytes32[] memory merkleProof,
        bytes32 merkleRoot,
        bytes32 leafHash,
        address to,
        uint256 tokenId,
        string memory historyMetadataDigest,
        uint256 customHistoryId,
        bool isIntermediary
    )
        public
        batchExists(merkleRoot)
        srrNotAlreadyProcessed(merkleRoot, leafHash)
    {
        require(
            verifyTransferFromWithProvenanceHash(
                leafHash, 
                to,
                tokenId, 
                historyMetadataDigest,
                customHistoryId,
                isIntermediary
            ),
            "leafHash does not match the transferFromWithProvenance details"
        );

        require(
            MerkleProof.verify(merkleProof, merkleRoot, leafHash),
            "Merkle proof verification failed"
        );

        batches[merkleRoot].processedLeaves[leafHash] = true;
        batches[merkleRoot].processedCount++;
        _startrailRegistry().transferFromWithProvenanceFromBulk(
            to,
            tokenId, 
            historyMetadataDigest, 
            customHistoryId,
            isIntermediary
        );

        emit TransferFromWithProvenanceWithProof(merkleRoot, tokenId, leafHash);
    }

    /**
     * @dev Verify the hash of the params for transferFromWithProvenance
     * @param leafHash bytes32 of hash value of all other params
     * @param to address to receive the ownership of the given token ID
     * @param tokenId uint256 of StartrailRegistryRecordID
     * @param historyMetadataDigest string of metadata hash
     * @param customHistoryId uint256 customHistoryId
     * @param isIntermediary bool isIntermediary
     */
    function verifyTransferFromWithProvenanceHash(
        bytes32 leafHash,
        address to,
        uint256 tokenId,
        string memory historyMetadataDigest,
        uint256 customHistoryId,
        bool isIntermediary
    ) public pure returns (bool hashMatches) {
        hashMatches =
            leafHash ==
            keccak256(
                abi.encodePacked(to, tokenId, historyMetadataDigest, customHistoryId, isIntermediary)
            );
    }

    /**
     * Private functions
     */

    function _prepareBatch(bytes32 merkleRoot) private {
        batches[merkleRoot] = Batch({
            prepared: true,
            signer: msgSender(),
            processedCount: 0
        });
        emit BatchPrepared(merkleRoot, msgSender());
    }

    function _startrailRegistry() private view returns (IStartrailRegistry sr) {
        sr = IStartrailRegistry(
            INameRegistry(nameRegistryAddress).get(STARTRAIL_REGISTRY)
        );
    }

    function _createSRRWithProof(
        bytes32[] memory merkleProof,
        bytes32 merkleRoot,
        bytes32 leafHash,
        bool isPrimaryIssuer,
        address artistAddress,
        bytes32 metadataDigest,
        bool lockExternalTransfer
    )   
        internal 
        returns (uint256 tokenId) 
    {
        require(
            MerkleProof.verify(merkleProof, merkleRoot, leafHash),
            "Merkle proof verification failed"
        );

        batches[merkleRoot].processedLeaves[leafHash] = true;
        batches[merkleRoot].processedCount++;
        
        // Avoid `Stack too deep` error
        address issuerAddress;
        {
            issuerAddress = batches[merkleRoot].signer; // LUW address - signer
        }

        tokenId = _startrailRegistry().createSRRFromBulk(
            isPrimaryIssuer,
            artistAddress,
            metadataDigest,
            issuerAddress, 
            lockExternalTransfer
        );
        emit CreateSRRWithProof(merkleRoot, tokenId, leafHash);
    }

}
