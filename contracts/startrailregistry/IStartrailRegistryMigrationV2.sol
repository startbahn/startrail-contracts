// SPDX-License-Identifier: GPL-3.0-only

pragma solidity 0.8.28;

import "../common/IStartrailRegistryV1.sol";

/**
 * @title IStartrailRegistryMigrationV2 - events from the migration
 *
 * @dev Events required to migrate tokens to the new chain. The functions
 *      were removed for this V2 version.
 */
interface IStartrailRegistryMigrationV2 {
  /*
   * Events ERC721
   */

  event TransferFromMigration(
    address indexed from,
    address indexed to,
    uint256 indexed tokenId,
    uint256 originTimestamp,
    bytes32 originTxHash
  );

  /*
   * Events StartrailRegistry
   */

  event MigrateSRR(
    uint256 indexed tokenId,
    string originChain
  );

  event CreateSRRFromMigration(
    uint256 indexed tokenId,
    IStartrailRegistryV1.SRR registryRecord,
    bytes32 metadataDigest,
    uint256 originTimestamp,
    bytes32 originTxHash
  );
  event UpdateSRRFromMigration(
    uint256 indexed tokenId,
    IStartrailRegistryV1.SRR registryRecord,
    uint256 originTimestamp,
    bytes32 originTxHash
  );
  event UpdateSRRMetadataDigestFromMigration(
    uint256 indexed tokenId,
    bytes32 metadataDigest,
    uint256 originTimestamp,
    bytes32 originTxHash
  );
  event ProvenanceFromMigration(
    uint256 indexed tokenId,
    address indexed from,
    address indexed to,
    uint256 timestamp,
    string historyMetadataDigest,
    string historyMetadataURI,
    uint256 originTimestamp,
    bytes32 originTxHash
  );

  event ProvenanceFromMigration(
    uint256 indexed tokenId,
    address indexed from,
    address indexed to,
    uint256 timestamp,
    uint256 customHistoryId,
    string historyMetadataDigest,
    string historyMetadataURI,
    uint256 originTimestamp,
    bytes32 originTxHash
  );

  event SRRCommitmentFromMigration(
    address owner,
    bytes32 commitment,
    uint256 tokenId,
    uint256 originTimestamp,
    bytes32 originTxHash
  );
  event SRRCommitmentFromMigration(
    address owner,
    bytes32 commitment,
    uint256 tokenId,
    uint256 customHistoryId,
    uint256 originTimestamp,
    bytes32 originTxHash
  );
  event SRRCommitmentCancelledFromMigration(
    uint256 tokenId,
    uint256 originTimestamp,
    bytes32 originTxHash
  );
  event CreateCustomHistoryFromMigration(
    uint256 indexed id,
    string name,
    uint256 customHistoryTypeId,
    bytes32 metadataDigest,
    string originChain,
    uint256 originTimestamp,
    bytes32 originTxHash
  );

}
