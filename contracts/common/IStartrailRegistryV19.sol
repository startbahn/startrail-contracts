// SPDX-License-Identifier: GPL-3.0-only

pragma solidity 0.8.13;

interface IStartrailRegistryV19 {
    /*
     * Events
     */

    event CreateSRR(
        uint256 indexed tokenId,
        SRR registryRecord,
        string metadataCID,
        bool lockExternalTransfer
    );

    event UpdateSRR(
        uint256 indexed tokenId,
        bool isPrimaryIssuer,
        address artistAddress,
        address sender
    );

    event UpdateSRRMetadataDigest(uint256 indexed tokenId, string metadataCID);

    event History(uint256[] tokenIds, uint256[] customHistoryIds);

    event Provenance(
        uint256 indexed tokenId,
        address indexed from,
        address indexed to,
        string historyMetadataHash,
        string historyMetadataURI,
        bool isIntermediary
    );

    event Provenance(
        uint256 indexed tokenId,
        address indexed from,
        address indexed to,
        uint256 customHistoryId,
        string historyMetadataHash,
        string historyMetadataURI,
        bool isIntermediary
    );

    event SRRCommitment(
        uint256 indexed tokenId,
        address owner,
        bytes32 commitment
    );

    event SRRCommitment(
        uint256 indexed tokenId,
        address owner,
        bytes32 commitment,
        uint256 customHistoryId
    );

    event SRRCommitmentCancelled(uint256 indexed tokenId);

    event CreateCustomHistoryType(uint256 indexed id, string historyType);

    event CreateCustomHistory(
        uint256 indexed id,
        string name,
        uint256 customHistoryTypeId,
        string metadataCID
    );

    event UpdateCustomHistory(
        uint256 indexed id,
        string name,
        string metadataCID
    );

    event LockExternalTransfer(uint256 indexed tokenId, bool flag);

    event OwnershipTransferred(
        address indexed previousOwner,
        address indexed newOwner
    );

    /**
     * Royalty events
     */
    event RoyaltiesSet(uint256 indexed tokenId, RoyaltyInfo royalty);

    /*
     * Legacy Events
     * - were emitted in previous versions of the contract
     * - leave here so they appear in ABI and can be indexed by the subgraph
     */

    event CreateSRR(
        uint256 indexed tokenId,
        SRR registryRecord,
        bytes32 metadataDigest
    );

    event UpdateSRR(uint256 indexed tokenId, SRR registryRecord);

    event Provenance(
        uint256 indexed tokenId,
        address indexed from,
        address indexed to,
        string historyMetadataHash,
        string historyMetadataURI
    );

    event Provenance(
        uint256 indexed tokenId,
        address indexed from,
        address indexed to,
        uint256 customHistoryId,
        string historyMetadataHash,
        string historyMetadataURI
    );

    event ProvenanceDateMigrationFix(
        uint256 indexed tokenId,
        uint256 originTimestamp
    );

    event CreateSRR(
        uint256 indexed tokenId,
        SRR registryRecord,
        bytes32 metadataDigest,
        bool lockExternalTransfer
    );

    event UpdateSRRMetadataDigest(
        uint256 indexed tokenId,
        bytes32 metadataDigest
    );

    event CreateCustomHistory(
        uint256 indexed id,
        string name,
        uint256 customHistoryTypeId,
        bytes32 metadataDigest
    );

    event UpdateCustomHistory(
        uint256 indexed id,
        string name,
        bytes32 metadataDigest
    );

    /**
     * Structs
     */
    struct SRR {
        bool isPrimaryIssuer;
        address artistAddress;
        address issuer;
    }

    struct RoyaltyInfo {
        address receiver;
        // max percent value 9999 fits inside uint16
        //   AND
        // address size + uint16 size < one slot [256]
        uint16 percentage;
    }

    /**
     * Functions
     */

    function createSRRFromLicensedUser(
        bool isPrimaryIssuer,
        address artistAddress,
        bytes32 metadataDigest,
        bool lockExternalTransfer
    ) external;

    // backward compatibility
    function createSRRFromLicensedUser(
        bool isPrimaryIssuer,
        address artistAddress,
        bytes32 metadataDigest,
        bool lockExternalTransfer,
        address to
    ) external;

    function createSRRFromLicensedUser(
        bool isPrimaryIssuer,
        address artistAddress,
        bytes32 metadataDigest,
        string memory metadataCID,
        bool lockExternalTransfer,
        address to,
        address royaltyReceiver,
        uint16 royaltyPercentage
    ) external;

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
        uint16 royaltyPercentage
    ) external returns (uint256);

    function updateSRR(
        uint256 tokenId,
        bool isPrimaryIssuer,
        address artistAddress
    ) external;

    function updateSRRMetadata(uint256 tokenId, bytes32 metadataDigest)
        external;

    function updateSRRMetadata(uint256 tokenId, string memory metadataCID)
        external;

    function updateSRRRoyalty(
        uint256 tokenId,
        address royaltyReceiver,
        uint16 royaltyPercentage
    ) external;

    function approveSRRByCommitment(
        uint256 tokenId,
        bytes32 commitment,
        string memory historyMetadataHash
    ) external;

    function approveSRRByCommitment(
        uint256 tokenId,
        bytes32 commitment,
        string memory historyMetadataHash,
        uint256 customHistoryId
    ) external;

    function cancelSRRCommitment(uint256 tokenId) external;

    function approveSRRByCommitmentFromBulk(
        uint256 tokenId,
        bytes32 commitment,
        string memory historyMetadataHash,
        uint256 customHistoryId
    ) external;

    function transferSRRByReveal(
        address to,
        bytes32 reveal,
        uint256 tokenId,
        bool isIntermediary
    ) external;

    function setNameRegistryAddress(address nameRegistry) external;

    function setTokenURIParts(string memory URIPrefix, string memory URIPostfix)
        external;

    function addCustomHistoryType(string memory historyTypeName) external;

    function writeCustomHistory(
        string memory name,
        uint256 historyTypeId,
        bytes32 metadataDigest
    ) external;

    function writeCustomHistory(
        string memory name,
        uint256 historyTypeId,
        string memory metadataCID
    ) external;

    function updateCustomHistory(
        uint256 customHistoryId,
        string memory name,
        bytes32 metadataDigest
    ) external;

    function updateCustomHistory(
        uint256 customHistoryId,
        string memory name,
        string memory metadataCID
    ) external;

    function addHistory(
        uint256[] calldata tokenIds,
        uint256[] calldata customHistoryIds
    ) external;

    /*
     * View functions
     */

    function getSRRCommitment(uint256 tokenId)
        external
        view
        returns (
            bytes32 commitment,
            string memory historyMetadataHash,
            uint256 customHistoryId
        );

    function getSRR(uint256 tokenId)
        external
        view
        returns (SRR memory registryRecord, bytes32 metadataDigest);

    function getCustomHistoryNameById(uint256 id)
        external
        view
        returns (string memory);

    function tokenURI(string memory metadataDigests)
        external
        view
        returns (string memory);

    function contractURI() external view returns (string memory);

    function setContractURI(string memory _contractURI) external;

    function setLockExternalTransfer(uint256 tokenId, bool flag) external;

    function lockExternalTransfer(uint256 tokenId) external view returns (bool);

    function transferFromWithProvenance(
        address to,
        uint256 tokenId,
        string memory historyMetadataHash,
        uint256 customHistoryId,
        bool isIntermediary
    ) external;

    function transferOwnership(address newOwner) external;

    function transferFromWithProvenanceFromBulk(
        address to,
        uint256 tokenId,
        string memory historyMetadataHash,
        uint256 customHistoryId,
        bool isIntermediary
    ) external;
}
