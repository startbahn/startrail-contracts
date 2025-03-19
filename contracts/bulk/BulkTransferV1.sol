// SPDX-License-Identifier: GPL-3.0-only

pragma solidity 0.8.28;

import "../proxy/utils/InitializableWithGap.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

import "../common/INameRegistry.sol";
import "../metaTx/eip2771/EIP2771BaseRecipient.sol";
import "../name/Contracts.sol";

interface IStartrailRegistry {
    function approveSRRByCommitmentFromBulk(
        uint256 tokenId,
        bytes32 commitment,
        string memory historyMetadataDigest,
        uint256 customHistoryId
    ) external;
}

contract BulkTransferV1 is 
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
        address sender;
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
    event ApproveSRRByCommitmentWithProof(
        bytes32 indexed merkleRoot,
        uint256 indexed tokenId,
        bytes32 srrApproveHash
    );

    /*
     * Constant
     */
    uint256 private constant _NO_CUSTOM_HISTORY = 0;

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

    modifier srrNotAlreadyProcessed(bytes32 merkleRoot, bytes32 srrApproveHash) {
        require(
            !batches[merkleRoot].processedLeaves[srrApproveHash],
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
     * @dev ApproveSRRByCommitment with merkle proof
     * @param merkleProof bytes32 of merkle proof value
     * @param merkleRoot bytes32 of merkle root value
     * @param srrApproveHash bytes32 of merkle tree leaf
     * @param tokenId uint256 of StartrailRegistryRecordID
     * @param commitment bytes32 of the commitment hash
     * @param historyMetadataDigest string of metadata hash
     * @param customHistoryId uint256 customHistoryId
     */
    function approveSRRByCommitmentWithProof(
        bytes32[] memory merkleProof,
        bytes32 merkleRoot,
        bytes32 srrApproveHash,
        uint256 tokenId,
        bytes32 commitment,
        string memory historyMetadataDigest,
        uint256 customHistoryId
    )
        public
        batchExists(merkleRoot)
        srrNotAlreadyProcessed(merkleRoot, srrApproveHash)
    {
        require(
            verifyApproveSRRByCommitmentHash(
                srrApproveHash, 
                tokenId, 
                commitment, 
                historyMetadataDigest,
                customHistoryId
            ),
            "srrApproveHash does not match the approveSRRByCommitment details"
        );

        require(
            MerkleProof.verify(merkleProof, merkleRoot, srrApproveHash),
            "Merkle proof verification failed"
        );

        batches[merkleRoot].processedLeaves[srrApproveHash] = true;
        batches[merkleRoot].processedCount++;
        _startrailRegistry().approveSRRByCommitmentFromBulk(
            tokenId, 
            commitment, 
            historyMetadataDigest, 
            customHistoryId
        );

        emit ApproveSRRByCommitmentWithProof(merkleRoot, tokenId, srrApproveHash);
    }

    /**
     * @dev Verify the hash of the params for approveSRRByCommitment
     * @param srrApproveHash bytes32 of hash value of all other params
     * @param tokenId uint256 of StartrailRegistryRecordID
     * @param commitment bytes32 of the commitment hash
     * @param historyMetadataDigest string of metadata hash
     * @param customHistoryId uint256 customHistoryId
     */
    function verifyApproveSRRByCommitmentHash(
        bytes32 srrApproveHash,
        uint256 tokenId,
        bytes32 commitment,
        string memory historyMetadataDigest,
        uint256 customHistoryId
    ) public pure returns (bool hashMatches) {
        hashMatches =
            srrApproveHash ==
            keccak256(
                abi.encodePacked(tokenId, commitment, historyMetadataDigest, customHistoryId)
            );
    }

    function _prepareBatch(bytes32 merkleRoot) private {
        Batch storage batch = batches[merkleRoot]; 
        batch.prepared = true;
        batch.processedCount = 0;
        batch.sender = msgSender();
        emit BatchPrepared(merkleRoot, batch.sender);
    }

    function _startrailRegistry() private view returns (IStartrailRegistry sr) {
        sr = IStartrailRegistry(
            INameRegistry(nameRegistryAddress).get(STARTRAIL_REGISTRY)
        );
    }

}
