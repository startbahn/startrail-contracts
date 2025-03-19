// SPDX-License-Identifier: GPL-3.0-only

pragma solidity 0.8.28;

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
        bool lockExternalTransfer,
        address royaltyReceiver,
        uint16 royaltyBasisPoints
    ) external returns (uint256);

    function approveSRRByCommitmentFromBulk(
        uint256 tokenId,
        bytes32 commitment,
        string memory historyMetadataHash,
        uint256 customHistoryId
    ) external;

    function transferFromWithProvenanceFromBulk(
        address to,
        uint256 tokenId,
        string memory metadataCID,
        uint256 customHistoryId,
        bool isIntermediary
    ) external;
}

contract BulkV4 is Contracts, InitializableWithGap, EIP2771BaseRecipient {
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

    event BatchPrepared(bytes32 indexed merkleRoot, address indexed sender);

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
    function initialize(address _nameRegistry, address _trustedForwarder)
        public
        initializer
    {
        nameRegistryAddress = _nameRegistry;
        _setTrustedForwarder(_trustedForwarder);
    }

    function setTrustedForwarder(address forwarder) public onlyAdministrator {
        _setTrustedForwarder(forwarder);
    }

    /**
     * @dev Reserves a batch request before excuting
     * @param merkleRoot bytes32 of merkle root
     */
    function prepareBatchFromLicensedUser(bytes32 merkleRoot)
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
    ) public batchExists(merkleRoot) returns (uint256[] memory tokenIds) {
        tokenIds = new uint256[](leafHashes.length);

        for (uint256 i = 0; i < leafHashes.length; i++) {
            require(
                !batches[merkleRoot].processedLeaves[leafHashes[i]],
                "SRR already processed."
            );

            bytes32 metadataDigest = metadataDigests[i];

            require(
                verifyLeafHash(
                    leafHashes[i],
                    isPrimaryIssuers[i],
                    artistAddresses[i],
                    metadataDigest,
                    "",
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
                metadataDigest,
                "",
                lockExternalTransfers[i],
                address(0),
                0
            );
        }
    }

    /**
     * @dev Creates multiple SRRs with merkle proofs
     * @param merkleProofs list of bytes32 of merkle proof value
     * @param merkleRoot bytes32 of merkle root value
     * @param leafHashes list of bytes32 of merkle tree leaf
     * @param isPrimaryIssuers list of primary issuer flags
     * @param artistAddresses list of address of artist
     * @param metadataDigests list of metadata hashes
     * @param metadataCIDs list of ipfs cid
     * @param lockExternalTransfers list of lock transfer flags
     * @param royaltyReceivers list of royalty receiver
     * @param royaltyBasisPoints list of royalty basis points
     */
    function createSRRWithProofMulti(
        bytes32[][] memory merkleProofs,
        bytes32 merkleRoot,
        bytes32[] memory leafHashes,
        bool[] memory isPrimaryIssuers,
        address[] memory artistAddresses,
        bytes32[] memory metadataDigests,
        string[] memory metadataCIDs,
        bool[] memory lockExternalTransfers,
        address[] memory royaltyReceivers,
        uint16[] memory royaltyBasisPoints
    ) public batchExists(merkleRoot) returns (uint256[] memory tokenIds) {
        tokenIds = new uint256[](leafHashes.length);

        for (uint256 i = 0; i < leafHashes.length; i++) {
            require(
                !batches[merkleRoot].processedLeaves[leafHashes[i]],
                "SRR already processed."
            );

            bytes32 metadataDigest = metadataDigests[i];
            string memory metadataCID;
            if (metadataCIDs.length != 0) {
                metadataCID = metadataCIDs[i];
            }

            require(
                verifyLeafHash(
                    leafHashes[i],
                    isPrimaryIssuers[i],
                    artistAddresses[i],
                    metadataDigest,
                    metadataCID,
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
                metadataDigest,
                metadataCID,
                lockExternalTransfers[i],
                royaltyReceivers.length != 0 ? royaltyReceivers[i] : address(0), // Avoid `Stack too deep` error
                royaltyBasisPoints.length != 0 ? royaltyBasisPoints[i] : 0
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
     * @param metadataCID string of ipfs cid
     * @param lockExternalTransfer bool of the transfer permission flag to marketplaces
     */
    function verifyLeafHash(
        bytes32 leafHash,
        bool isPrimaryIssuer,
        address artistAddress,
        bytes32 metadataDigest,
        string memory metadataCID,
        bool lockExternalTransfer
    ) public pure returns (bool hashMatches) {
        bool isCID = isCIDString(metadataCID);
        if (isCID) {
            hashMatches =
                leafHash ==
                keccak256(
                    abi.encodePacked(
                        isPrimaryIssuer,
                        artistAddress,
                        metadataCID,
                        lockExternalTransfer
                    )
                );
        } else {
            hashMatches =
                leafHash ==
                keccak256(
                    abi.encodePacked(
                        isPrimaryIssuer,
                        artistAddress,
                        metadataDigest,
                        lockExternalTransfer
                    )
                );
        }
    }

    /**
     * @dev ApproveSRRByCommitment with merkle proof
     * @param merkleProof bytes32 of merkle proof value
     * @param merkleRoot bytes32 of merkle root value
     * @param leafHash bytes32 of merkle tree leaf
     * @param tokenId uint256 of StartrailRegistryRecordID
     * @param commitment bytes32 of the commitment hash
     * @param historyMetadataHash  string of metadata hash
     * @param customHistoryId uint256 customHistoryId
     */
    function approveSRRByCommitmentWithProof(
        bytes32[] memory merkleProof,
        bytes32 merkleRoot,
        bytes32 leafHash,
        uint256 tokenId,
        bytes32 commitment,
        string memory historyMetadataHash,
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
                historyMetadataHash,
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
            historyMetadataHash,
            customHistoryId
        );

        emit ApproveSRRByCommitmentWithProof(merkleRoot, tokenId, leafHash);
    }

    /**
     * @dev Verify the hash of the params for approveSRRByCommitment
     * @param leafHash bytes32 of hash value of all other params
     * @param tokenId uint256 of StartrailRegistryRecordID
     * @param commitment bytes32 of the commitment hash
     * @param historyMetadataHash string of metadata hash
     * @param customHistoryId uint256 customHistoryId
     */
    function verifyApproveSRRByCommitmentHash(
        bytes32 leafHash,
        uint256 tokenId,
        bytes32 commitment,
        string memory historyMetadataHash,
        uint256 customHistoryId
    ) public pure returns (bool hashMatches) {
        hashMatches =
            leafHash ==
            keccak256(
                abi.encodePacked(
                    tokenId,
                    commitment,
                    historyMetadataHash,
                    customHistoryId
                )
            );
    }

    /**
     * @dev TransferFromWithProvenance with merkle proof
     * @param merkleProof bytes32 of merkle proof value
     * @param merkleRoot bytes32 of merkle root value
     * @param leafHash bytes32 of merkle tree leaf
     * @param tokenId uint256 of StartrailRegistryRecordID
     * @param historyMetadataHash  string of metadata hash
     * @param customHistoryId uint256 customHistoryId
     * @param isIntermediary bool isIntermediary
     */
    function transferFromWithProvenanceWithProof(
        bytes32[] memory merkleProof,
        bytes32 merkleRoot,
        bytes32 leafHash,
        address to,
        uint256 tokenId,
        string memory historyMetadataHash,
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
                historyMetadataHash,
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
            historyMetadataHash,
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
     * @param metadataCID string of ipfs cid
     * @param customHistoryId uint256 customHistoryId
     * @param isIntermediary bool isIntermediary
     */
    function verifyTransferFromWithProvenanceHash(
        bytes32 leafHash,
        address to,
        uint256 tokenId,
        string memory metadataCID,
        uint256 customHistoryId,
        bool isIntermediary
    ) public pure returns (bool hashMatches) {
        hashMatches =
            leafHash ==
            keccak256(
                abi.encodePacked(
                    to,
                    tokenId,
                    metadataCID,
                    customHistoryId,
                    isIntermediary
                )
            );
    }

    /**
     * Private functions
     */

    function _prepareBatch(bytes32 merkleRoot) private {
        Batch storage batch = batches[merkleRoot];
        batch.processedCount = 0;
        batch.prepared = true;
        batch.signer = msgSender();
        emit BatchPrepared(merkleRoot, batch.signer);
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
        string memory metadataCID,
        bool lockExternalTransfer,
        address royaltyReceiver,
        uint16 royaltyBasisPoints
    ) internal returns (uint256 tokenId) {
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

        bool isCID = isCIDString(metadataCID);
        if (isCID) {
            tokenId = _startrailRegistry().createSRRFromBulk(
                isPrimaryIssuer,
                artistAddress,
                metadataDigest,
                metadataCID,
                issuerAddress,
                lockExternalTransfer,
                royaltyReceiver,
                royaltyBasisPoints
            );
        } else {
            tokenId = _startrailRegistry().createSRRFromBulk(
                isPrimaryIssuer,
                artistAddress,
                metadataDigest,
                "",
                issuerAddress,
                lockExternalTransfer,
                royaltyReceiver,
                royaltyBasisPoints
            );
        }
        emit CreateSRRWithProof(merkleRoot, tokenId, leafHash);
    }

    function isCIDString(string memory _string) internal pure returns (bool) {
        return bytes(_string).length > 0;
    }
}
