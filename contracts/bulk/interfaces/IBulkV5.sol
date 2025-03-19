// SPDX-License-Identifier: GPL-3.0-only

pragma solidity 0.8.28;

interface IStartrailRegistry {
    function createSRRFromBulk(
        bool isPrimaryIssuer,
        address artistAddress,
        string memory metadataCID,
        address issuerAddress,
        bool lockExternalTransfer,
        address royaltyReceiver,
        uint16 royaltyBasisPoints
    ) external returns (uint256);

    function approveSRRByCommitmentFromBulk(
        address signer,
        uint256 tokenId,
        bytes32 commitment,
        string memory historyMetadataHash,
        uint256 customHistoryId
    ) external;

    function transferFromWithProvenanceFromBulk(
        address signer,
        address to,
        uint256 tokenId,
        string memory metadataCID,
        uint256 customHistoryId,
        bool isIntermediary
    ) external;
}

interface IBulkV5 {
    /*
     * Structs
     */
    struct Batch {
        bool prepared;
        address signer;
        uint8 processedCount;
        mapping(bytes32 => bool) processedLeaves;
    }

    struct CreateSRRInputs {
        bool isPrimaryIssuer;
        address artistAddress;
        string metadataCID;
        bool lockExternalTransfer;
        address royaltyReceiver;
        uint16 royaltyBasisPoints;
        address contractAddress;
    }

    /*
     * Events
     */

    event BatchPrepared(bytes32 indexed merkleRoot, address indexed sender);

    event CreateSRRWithProof(
        bytes32 indexed merkleRoot,
        address indexed contractAddress,
        uint256 indexed tokenId,
        bytes32 leafHash
    );

    event CreateSRRWithProof(
        bytes32 indexed merkleRoot,
        uint256 indexed tokenId,
        bytes32 leafHash
    );

    event ApproveSRRByCommitmentWithProof(
        bytes32 indexed merkleRoot,
        address indexed contractAddress,
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
        address indexed contractAddress,
        uint256 indexed tokenId,
        bytes32 leafHash
    );
    event TransferFromWithProvenanceWithProof(
        bytes32 indexed merkleRoot,
        uint256 indexed tokenId,
        bytes32 leafHash
    );

    /*
     * Public functions
     */

    /**
     * @dev Initializes the BulkIssue contract
     */
    function initialize(
        address _nameRegistry,
        address _trustedForwarder
    ) external;

    /**
     * @dev set address of the trusted forwarder.
     */
    function setTrustedForwarder(address forwarder) external;

    /**
     * @dev Reserves a batch request before excuting
     * @param merkleRoot bytes32 of merkle root
     */
    function prepareBatchFromLicensedUser(bytes32 merkleRoot) external;

    /**
     * @dev Creates multiple SRRs with or without Collection with merkle proofs
     * @param merkleProofs list of bytes32 of merkle proof value
     * @param merkleRoot bytes32 of merkle root value
     * @param leafHashes list of bytes32 of merkle tree leaf
     * @param isPrimaryIssuers list of primary issuer flags
     * @param artistAddresses list of address of artist
     * @param metadataCIDs list of ipfs cid
     * @param lockExternalTransfers list of lock transfer flags
     * @param royaltyReceivers list of royalty receiver
     * @param royaltyBasisPoints list of royalty basis points
     * @param contractAddresses list of collection addresses or zero address if for StartrailRegistry
     */
    function createSRRWithProofMulti(
        bytes32[][] memory merkleProofs,
        bytes32 merkleRoot,
        bytes32[] memory leafHashes,
        bool[] memory isPrimaryIssuers,
        address[] memory artistAddresses,
        string[] memory metadataCIDs,
        bool[] memory lockExternalTransfers,
        address[] memory royaltyReceivers,
        uint16[] memory royaltyBasisPoints,
        address[] memory contractAddresses
    ) external returns (uint256[] memory tokenIds);

    /**
     * @dev Creates multiple SRRs with merkle proofs (deprecated form)
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
    ) external returns (uint256[] memory tokenIds);

    /**
     * @dev ApproveSRRByCommitment with merkle proof (deprecated form)
     * @param merkleProof bytes32 of merkle proof value
     * @param merkleRoot bytes32 of merkle root value
     * @param leafHash bytes32 of merkle tree leaf
     * @param tokenId uint256 of StartrailRegistryRecordID
     * @param commitment bytes32 of the commitment hash
     * @param historyMetadataHash history metadata digest or cid
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
    ) external;

    /**
     * @dev ApproveSRRByCommitment with merkle proof including collection contract address
     * @param merkleProof bytes32 of merkle proof value
     * @param merkleRoot bytes32 of merkle root value
     * @param leafHash bytes32 of merkle tree leaf
     * @param tokenId uint256 of StartrailRegistryRecordID
     * @param commitment bytes32 of the commitment hash
     * @param historyMetadataHash  string of metadata hash
     * @param customHistoryId uint256 customHistoryId
     * @param contractAddress Collection address or zero address if for StartrailRegistry
     */
    function approveSRRByCommitmentWithProof(
        bytes32[] memory merkleProof,
        bytes32 merkleRoot,
        bytes32 leafHash,
        uint256 tokenId,
        bytes32 commitment,
        string memory historyMetadataHash,
        uint256 customHistoryId,
        address contractAddress
    ) external;

    /**
     * @dev TransferFromWithProvenance with merkle proof (deprecated form)
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
    ) external;

    /**
     * @dev TransferFromWithProvenance with merkle proof
     * @param merkleProof bytes32 of merkle proof value
     * @param merkleRoot bytes32 of merkle root value
     * @param leafHash bytes32 of merkle tree leaf
     * @param to address to receive the ownership of the given token ID
     * @param tokenId uint256 of StartrailRegistryRecordID
     * @param historyMetadataHash  string of metadata hash
     * @param customHistoryId uint256 customHistoryId
     * @param isIntermediary bool isIntermediary
     * @param contractAddress Collection address or zero address if for StartrailRegistry
     */
    function transferFromWithProvenanceWithProof(
        bytes32[] memory merkleProof,
        bytes32 merkleRoot,
        bytes32 leafHash,
        address to,
        uint256 tokenId,
        string memory historyMetadataHash,
        uint256 customHistoryId,
        bool isIntermediary,
        address contractAddress
    ) external;
}
