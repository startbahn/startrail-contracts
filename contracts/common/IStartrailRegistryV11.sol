// SPDX-License-Identifier: GPL-3.0-only

pragma solidity 0.8.13;

interface IStartrailRegistryV11 {

  /*
   * Events
   */
  
  event CreateSRR(
    uint256 indexed tokenId,
    SRR registryRecord,
    bytes32 metadataDigest,
    bool lockExternalTransfer
  );
  
  event UpdateSRR(
    uint256 indexed tokenId,
    SRR registryRecord
  );
  
  event UpdateSRRMetadataDigest(
    uint256 indexed tokenId,
    bytes32 metadataDigest
  );
  
  event History(
    uint256[] tokenIds,
    uint256[] customHistoryIds
  );

  event Provenance(
    uint256 indexed tokenId,
    address indexed from,
    address indexed to,
    string historyMetadataDigest,
    string historyMetadataURI,
    bool isIntermediary
  );

  event Provenance(
    uint256 indexed tokenId,
    address indexed from,
    address indexed to,
    uint256 customHistoryId,
    string historyMetadataDigest,
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
  
  event SRRCommitmentCancelled(
    uint256 indexed tokenId
  );
  
  event CreateCustomHistoryType(
    uint256 indexed id,
    string historyType
  );

  event CreateCustomHistory(
    uint256 indexed id,
    string name,
    uint256 customHistoryTypeId,
    bytes32 metadataDigest
  );

  event LockExternalTransfer(
    uint256 indexed tokenId,
    bool flag
  );

  event OwnershipTransferred(
    address indexed previousOwner, 
    address indexed newOwner
  );
  
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
  
  event Provenance(
    uint256 indexed tokenId,
    address indexed from,
    address indexed to,
    string historyMetadataDigest,
    string historyMetadataURI
  );

  event Provenance(
    uint256 indexed tokenId,
    address indexed from,
    address indexed to,
    uint256 customHistoryId,
    string historyMetadataDigest,
    string historyMetadataURI
  );

  event ProvenanceDateMigrationFix(
    uint256 indexed tokenId,
    uint256 originTimestamp
  );

  /**
   * Structs
   */
  struct SRR {
    bool isPrimaryIssuer;
    address artistAddress;
    address issuer;
  }


  /**
   * Functions
   */

  function createSRR(
    bool isPrimaryIssuer,
    address artistAddress,
    bytes32 metadataDigest,
    bool lockExternalTransfer
  ) external;

  function createSRR(
    bool isPrimaryIssuer,
    address artistAddress,
    bytes32 metadataDigest,
    bool lockExternalTransfer,
    address recipient
  ) external;

  function createSRRFromLicensedUser(
    bool isPrimaryIssuer,
    address artistAddress,
    bytes32 metadataDigest,
    bool lockExternalTransfer
  ) external;

  function createSRRFromLicensedUser(
    bool isPrimaryIssuer,
    address artistAddress,
    bytes32 metadataDigest,
    bool lockExternalTransfer,
    address recipient
  ) external;

  function createSRRFromBulk(
    bool isPrimaryIssuer,
    address artistAddress,
    bytes32 metadataDigest,
    address issuerAddress,
    bool lockExternalTransfer
  ) external returns (uint256);

  function updateSRRFromLicensedUser(
    uint256 tokenId,
    bool isPrimaryIssuer,
    address artistAddress
  ) external returns (uint256);

  function updateSRRMetadata(uint256 tokenId, bytes32 metadataDigest)
    external;

  function approveSRRByCommitment(
    uint256 tokenId,
    bytes32 commitment,
    string memory historyMetadataDigest
  ) external;

  function approveSRRByCommitment(
    uint256 tokenId,
    bytes32 commitment,
    string memory historyMetadataDigest,
    uint256 customHistoryId
  ) external;
  function cancelSRRCommitment(uint256 tokenId) external;

  function approveSRRByCommitmentFromBulk(
    uint256 tokenId,
    bytes32 commitment,
    string memory historyMetadataDigest,
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
  
  function addCustomHistoryType(string memory historyTypeName) external returns (uint256 id);

  function writeCustomHistory(string memory name,uint256 historyTypeId, bytes32 metadataDigest) external returns (uint256 id);

  function addHistory(uint256[] calldata tokenIds, uint256[] calldata customHistoryIds) external;

  /*
   * View functions
   */

  function getSRRCommitment(uint256 tokenId) external view returns (
    bytes32 commitment,
    string memory historyMetadataDigest,
    uint256 customHistoryId
  );

  function getSRR(uint256 tokenId)
    external
    view
    returns (SRR memory registryRecord, bytes32 metadataDigest);

  function getSRROwner(uint256 tokenId) external view returns (address);
  
  function getCustomHistoryNameById(uint256 id) external view returns (string memory);

  function tokenURI(string memory metadataDigests)
    external
    view
    returns (string memory);

  function contractURI() external view returns (string memory);
  function setContractURI(string memory _contractURI) external;

  function getTokenId(bytes32 metadataDigest,address artistAddress) external pure returns (uint256);

  function setLockExternalTransfer(uint256 tokenId, bool flag) external;
  function lockExternalTransfer(uint256 tokenId) external view returns (bool);
  function transferFromWithProvenance(
    address to,
    uint256 tokenId,
    string memory historyMetadataDigest,
    uint256 customHistoryId,
    bool isIntermediary
  ) external;
  function owner() external view returns (address);
  function transferOwnership(address newOwner) external;
  function transferFromWithProvenanceFromBulk(
    address to,
    uint256 tokenId,
    string memory historyMetadataDigest,
    uint256 customHistoryId,
    bool isIntermediary
  ) external;
}
