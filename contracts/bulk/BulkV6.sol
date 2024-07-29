// SPDX-License-Identifier: GPL-3.0-only

pragma solidity 0.8.21;

import "../proxy/utils/InitializableWithGap.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

import "../collection/features/interfaces/IBulkFeatureV02.sol";
import "../common/INameRegistry.sol";
import "../metaTx/eip2771/EIP2771BaseRecipient.sol";
import "../name/Contracts.sol";

import "./interfaces/IBulkV6.sol";

contract BulkV6 is
    IBulkV6,
    Contracts,
    InitializableWithGap,
    EIP2771BaseRecipient
{
    using ECDSA for bytes32;

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
     * @inheritdoc IBulkV6
     */
    function initialize(
        address _nameRegistry,
        address _trustedForwarder
    ) public override initializer {
        nameRegistryAddress = _nameRegistry;
        _setTrustedForwarder(_trustedForwarder);
    }

    function setTrustedForwarder(
        address forwarder
    ) public override onlyAdministrator {
        _setTrustedForwarder(forwarder);
    }

    /**
     * @inheritdoc IBulkV6
     */
    function prepareBatchFromLicensedUser(
        bytes32 merkleRoot
    ) public override isNewBatch(merkleRoot) trustedForwarderOnly {
        _prepareBatch(merkleRoot);
    }

    /**
     * @inheritdoc IBulkV6
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
    )
        public
        override
        batchExists(merkleRoot)
        returns (uint256[] memory tokenIds)
    {
        tokenIds = new uint256[](leafHashes.length);

        for (uint256 i = 0; i < leafHashes.length; i++) {
            require(
                !batches[merkleRoot].processedLeaves[leafHashes[i]],
                "SRR already processed."
            );

            CreateSRRInputs memory inputs = CreateSRRInputs(
                isPrimaryIssuers[i],
                artistAddresses[i],
                metadataCIDs[i],
                lockExternalTransfers[i],
                address(0),
                royaltyReceivers[i],
                royaltyBasisPoints[i],
                contractAddresses[i]
            );

            require(
                verifyLeafHash(leafHashes[i], inputs, false),
                "leafHash does not match the srr details"
            );

            tokenIds[i] = _createSRRWithProof(
                merkleProofs[i],
                merkleRoot,
                leafHashes[i],
                inputs
            );
        }
    }

    /**
     * @inheritdoc IBulkV6
     */
    function createSRRWithProofMulti(
        bytes32[][] memory merkleProofs,
        bytes32 merkleRoot,
        bytes32[] memory leafHashes,
        bool[] memory isPrimaryIssuers,
        address[] memory artistAddresses,
        string[] memory metadataCIDs,
        bool[] memory lockExternalTransfers,
        address[] memory tos,
        address[] memory royaltyReceivers,
        uint16[] memory royaltyBasisPoints,
        address[] memory contractAddresses
    )
        public
        override
        batchExists(merkleRoot)
        returns (uint256[] memory tokenIds)
    {
        tokenIds = new uint256[](leafHashes.length);

        for (uint256 i = 0; i < leafHashes.length; i++) {
            require(
                !batches[merkleRoot].processedLeaves[leafHashes[i]],
                "SRR already processed."
            );

            CreateSRRInputs memory inputs = CreateSRRInputs(
                isPrimaryIssuers[i],
                artistAddresses[i],
                metadataCIDs[i],
                lockExternalTransfers[i],
                tos[i],
                royaltyReceivers[i],
                royaltyBasisPoints[i],
                contractAddresses[i]
            );

            require(
                verifyLeafHash(leafHashes[i], inputs, true),
                "leafHash does not match the srr details"
            );

            tokenIds[i] = _createSRRWithProof(
                merkleProofs[i],
                merkleRoot,
                leafHashes[i],
                inputs
            );
        }
    }

    /**
     * @inheritdoc IBulkV6
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
    ) public override {
        _approveSRRByCommitmentWithProof(
            merkleProof,
            merkleRoot,
            leafHash,
            tokenId,
            commitment,
            historyMetadataHash,
            customHistoryId,
            contractAddress
        );
    }

    /**
     * @inheritdoc IBulkV6
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
    ) public override {
        _transferFromWithProvenanceWithProof(
            merkleProof,
            merkleRoot,
            leafHash,
            to,
            tokenId,
            historyMetadataHash,
            customHistoryId,
            isIntermediary,
            contractAddress
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

    /**
     * @dev Verify the hash of the params for approveSRRByCommitment
     * @param leafHash bytes32 of hash value of all other params
     * @param tokenId uint256 of StartrailRegistryRecordID
     * @param commitment bytes32 of the commitment hash
     * @param historyMetadataHash string of metadata hash
     * @param customHistoryId uint256 customHistoryId
     * @param contractAddress Collection address or zero address if for StartrailRegistry
     */
    function verifyApproveSRRByCommitmentHash(
        bytes32 leafHash,
        uint256 tokenId,
        bytes32 commitment,
        string memory historyMetadataHash,
        uint256 customHistoryId,
        address contractAddress
    ) private pure returns (bool hashMatches) {
        bytes memory hashInputs = abi.encodePacked(
            tokenId,
            commitment,
            historyMetadataHash,
            customHistoryId
        );

        if (contractAddress != address(0)) {
            hashInputs = abi.encodePacked(hashInputs, contractAddress);
        }

        hashMatches = leafHash == keccak256(hashInputs);
    }

    /**
     * @dev Verify the hash of the params for transferFromWithProvenance
     * @param leafHash bytes32 of hash value of all other params
     * @param to address to receive the ownership of the given token ID
     * @param tokenId uint256 of StartrailRegistryRecordID
     * @param metadataCID string of ipfs cid
     * @param customHistoryId uint256 customHistoryId
     * @param isIntermediary bool isIntermediary
     * @param contractAddress Collection address or zero address if for StartrailRegistry
     */
    function verifyTransferFromWithProvenanceHash(
        bytes32 leafHash,
        address to,
        uint256 tokenId,
        string memory metadataCID,
        uint256 customHistoryId,
        bool isIntermediary,
        address contractAddress
    ) private pure returns (bool hashMatches) {
        bytes memory hashInputs = abi.encodePacked(
            to,
            tokenId,
            metadataCID,
            customHistoryId,
            isIntermediary
        );

        if (contractAddress != address(0)) {
            hashInputs = abi.encodePacked(hashInputs, contractAddress);
        }

        hashMatches = leafHash == keccak256(hashInputs);
    }

    function _transferFromWithProvenanceWithProof(
        bytes32[] memory merkleProof,
        bytes32 merkleRoot,
        bytes32 leafHash,
        address to,
        uint256 tokenId,
        string memory historyMetadataHash,
        uint256 customHistoryId,
        bool isIntermediary,
        address contractAddress
    )
        private
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
                isIntermediary,
                contractAddress
            ),
            "leafHash does not match the transferFromWithProvenance details"
        );

        require(
            MerkleProof.verify(merkleProof, merkleRoot, leafHash),
            "Merkle proof verification failed"
        );

        batches[merkleRoot].processedLeaves[leafHash] = true;
        batches[merkleRoot].processedCount++;

        address signer = batches[merkleRoot].signer; // LUW address - bulk signer

        if (contractAddress == address(0)) {
            _startrailRegistry().transferFromWithProvenanceFromBulk(
                signer,
                to,
                tokenId,
                historyMetadataHash,
                customHistoryId,
                isIntermediary
            );
        } else {
            IBulkFeatureV02(contractAddress).transferFromWithProvenanceFromBulk(
                signer,
                to,
                tokenId,
                historyMetadataHash,
                customHistoryId,
                isIntermediary
            );
        }

        emit TransferFromWithProvenanceWithProof(
            merkleRoot,
            contractAddress,
            tokenId,
            leafHash
        );
    }

    function _approveSRRByCommitmentWithProof(
        bytes32[] memory merkleProof,
        bytes32 merkleRoot,
        bytes32 leafHash,
        uint256 tokenId,
        bytes32 commitment,
        string memory historyMetadataHash,
        uint256 customHistoryId,
        address contractAddress
    )
        private
        batchExists(merkleRoot)
        srrNotAlreadyProcessed(merkleRoot, leafHash)
    {
        require(
            verifyApproveSRRByCommitmentHash(
                leafHash,
                tokenId,
                commitment,
                historyMetadataHash,
                customHistoryId,
                contractAddress
            ),
            "leafHash does not match the approveSRRByCommitment details"
        );

        require(
            MerkleProof.verify(merkleProof, merkleRoot, leafHash),
            "Merkle proof verification failed"
        );

        batches[merkleRoot].processedLeaves[leafHash] = true;
        batches[merkleRoot].processedCount++;

        address signer = batches[merkleRoot].signer; // LUW address - bulk signer

        if (contractAddress == address(0)) {
            _startrailRegistry().approveSRRByCommitmentFromBulk(
                signer,
                tokenId,
                commitment,
                historyMetadataHash,
                customHistoryId
            );
        } else {
            IBulkFeatureV02(contractAddress).approveSRRByCommitmentFromBulk(
                signer,
                tokenId,
                commitment,
                historyMetadataHash,
                customHistoryId
            );
        }

        emit ApproveSRRByCommitmentWithProof(
            merkleRoot,
            contractAddress,
            tokenId,
            leafHash
        );
    }

    /**
     * @dev Verify the hash of the params when creating SRR
     *
     * @param leafHash The hash to be verified against.
     * @param inputs The input parameters used to calculate the hash.
     * @param isToInLeafHash A boolean indicating whether to address is included in the leaf hash.
     * @return hashMatches A boolean indicating whether the provided leaf hash matches the calculated hash.
     */
    function verifyLeafHash(
        bytes32 leafHash,
        CreateSRRInputs memory inputs,
        bool isToInLeafHash
    ) private pure returns (bool hashMatches) {
        bytes memory hashInputs = abi.encodePacked(
            inputs.isPrimaryIssuer,
            inputs.artistAddress,
            inputs.metadataCID,
            inputs.lockExternalTransfer
        );

        if (isToInLeafHash) {
            hashInputs = abi.encodePacked(hashInputs, inputs.to);
        }

        hashInputs = abi.encodePacked(
            hashInputs,
            inputs.royaltyReceiver,
            inputs.royaltyBasisPoints
        );

        if (inputs.contractAddress != address(0)) {
            hashInputs = abi.encodePacked(hashInputs, inputs.contractAddress);
        }

        hashMatches = leafHash == keccak256(hashInputs);
    }

    function _createSRRWithProof(
        bytes32[] memory merkleProof,
        bytes32 merkleRoot,
        bytes32 leafHash,
        CreateSRRInputs memory inputs
    ) private returns (uint256 tokenId) {
        require(
            MerkleProof.verify(merkleProof, merkleRoot, leafHash),
            "Merkle proof verification failed"
        );

        batches[merkleRoot].processedLeaves[leafHash] = true;
        batches[merkleRoot].processedCount++;

        address issuerAddress = batches[merkleRoot].signer; // LUW address - signer

        if (inputs.contractAddress == address(0)) {
            tokenId = _startrailRegistry().createSRRFromBulk(
                inputs.isPrimaryIssuer,
                inputs.artistAddress,
                inputs.metadataCID,
                issuerAddress,
                inputs.lockExternalTransfer,
                inputs.to,
                inputs.royaltyReceiver,
                inputs.royaltyBasisPoints
            );
        } else {
            tokenId = IBulkFeatureV02(inputs.contractAddress).createSRRFromBulk(
                inputs.isPrimaryIssuer,
                inputs.artistAddress,
                inputs.metadataCID,
                issuerAddress,
                inputs.lockExternalTransfer,
                inputs.to,
                inputs.royaltyReceiver,
                inputs.royaltyBasisPoints
            );
        }

        emit CreateSRRWithProof(
            merkleRoot,
            inputs.contractAddress,
            tokenId,
            leafHash
        );
    }

    function isCIDString(string memory _string) internal pure returns (bool) {
        return bytes(_string).length > 0;
    }
}
