// SPDX-License-Identifier: GPL-3.0-only

pragma solidity 0.6.11;
pragma experimental ABIEncoderV2;

interface IStartrailRegistryV2 {
  /*
   * Events
   */
  event CreateSRR(
    uint256 indexed tokenId,
    SRR registryRecord,
    bytes32 metadataDigest
  );
  event UpdateSRR(
    uint256 indexed tokenId,
    SRR registryRecord
  );
  event UpdateSRRMetadataDigest(
    uint256 indexed tokenId,
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
    bytes32 metadataDigest
  ) external returns (uint256);

  function createSRRFromLicensedUser(
    bool isPrimaryIssuer,
    address artistAddress,
    bytes32 metadataDigest
  ) external returns (uint256);

  function createSRRFromBulk(
    bool isPrimaryIssuer,
    address artistAddress,
    bytes32 metadataDigest,
    address issuerAddress
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
    uint256 tokenId
  ) external;

  function setNameRegistryAddress(address nameRegistry) external;

  function setTokenURIParts(string memory URIPrefix, string memory URIPostfix)
    external;
  
  function addCustomHistoryType(string memory historyTypeName) external returns (uint256 id);

  function writeCustomHistory(string memory name,uint256 historyTypeId, bytes32 metadataDigest) external returns (uint256 id);

  // Second transfer related functions removed from this LUM release
  // function approveFromAdmin(address to, uint256 tokenId) external;
  
  // function transferSRR(
  //   address to,
  //   uint256 tokenId,
  //   string memory historyMetadataDigest,
  //   uint256 customHistoryId
  // ) external;

  // function transferSRR(
  //   address to,
  //   uint256 tokenId,
  //   string memory historyMetadataDigest
  // ) external;

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

  // function getCustomHistoryTypeIdByName(string memory historyTypeName) external view returns (uint256 historyTypeId);

  function tokenURI(string memory metadataDigests)
    external
    view
    returns (string memory);

  function getTokenId(bytes32 metadataDigest,address artistAddress) external pure returns (uint256);
}
