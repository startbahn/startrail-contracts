// SPDX-License-Identifier: GPL-3.0-only

pragma solidity 0.8.28;

import "../proxy/utils/InitializableWithGap.sol";
import "../common/INameRegistry.sol";
import "../common/IStartrailRegistryV5.sol";
import "../lib/IDGenerator.sol";
import "../metaTx/eip2771/EIP2771BaseRecipient.sol";
import "../name/Contracts.sol";
import "./Storage.sol";
import "./IERC2477.sol";
import "./ERC721.sol";
import "./IStartrailRegistryMigrationV2.sol";

interface ILicensedUserManager {
    function isActiveWallet(address walletAddress) external pure returns (bool);
}

contract StartrailRegistryV5 is
    Contracts,
    IERC2477,
    IStartrailRegistryV5,
    IStartrailRegistryMigrationV2,
    InitializableWithGap,
    Storage,
    ERC721UpgradeSafe,
    EIP2771BaseRecipient
{
    /*
     * Constants
     */
    // Static
    uint256 private constant SRR_GLOBAL_SLOT = 0;
    // types
    bytes32 private constant _SRR = keccak256("registryRecord");
    bytes32 private constant _HISTORY = keccak256("historyProvenance");

    // values
    bytes32 private constant _IS_PRIMARY_ISSUER = keccak256("isPrimaryIssuer");
    bytes32 private constant _ISSUER = keccak256("issuer");
    bytes32 private constant _ARTIST_ADDRESS = keccak256("artistAddress");
    bytes32 private constant _ROYALTY_RATE = keccak256("royaltyRate");
    bytes32 private constant _ROYALTY_RATE_DECIMALS = keccak256(
        "royaltyRateDecimals"
    );
    bytes32 private constant _COMMITMENT = keccak256("commitment");

    // metadata
    bytes32 private constant _URI_PREFIX = keccak256("URIPrefix");
    bytes32 private constant _URI_POSTFIX = keccak256("URIPostfix");
    bytes32 private constant _METADATA_DIGEST = keccak256("metadataDigest");
    bytes32 private constant _MIGRATION_INIT = keccak256("ERC721migrationInit");

    // custom history
    bytes32 private constant _CUSTOM_HISTORY = keccak256("customHistory");
    bytes32 private constant _CUSTOM_HISTORY_NAME = keccak256(
        "customHistoryName"
    );
    uint256 private constant _NO_CUSTOM_HISTORY = 0;

    // EIP2477 metadata hash algorithm
    string public constant HASH_ALGORITHM = "sha256";

    /*
     * State
     */

    address public nameRegistryAddress;

    //Custom History key
    uint256 private customHistoryCount = 1;
    uint256 private customHistoryTypeCount = 0;

    // custom history type vs id mapping
    mapping(uint256 => string) public customHistoryTypeNameById;
    mapping(string => uint256) public customHistoryTypeIdByName;

    // Maximum combination of token * history id that can be emitted
    uint256 public maxCombinedHistoryRecords;

    /*
     * Modifiers
     */

    modifier onlyAdministrator() {
        require(isAdministrator(), "Caller is not the Startrail Administrator");
        _;
    }

    modifier onlyLicensedUserOrAdministrator() {
        if (!isAdministrator()) {
            require(
                ILicensedUserManager(
                    _nameRegistry().get(
                        Contracts.LICENSED_USER_MANAGER
                    )
                ).isActiveWallet(msgSender()) == true,
                "Caller is not the Startrail Administrator or a LicensedUser"
            );
        }
        _;
    }

    modifier onlyBulk() {
        address bulkIssueAddress = _nameRegistry().get(BULK_ISSUE);
        require(
            bulkIssueAddress == msg.sender,
            "The sender isn't the BulkIssue contract"
        );
        _;
    }

    modifier onlyBulkTransfer() {
        address bulkTransferAddress = _nameRegistry().get(BULK_TRANSFER);
        require(
            bulkTransferAddress == msg.sender,
            "The sender isn't the BulkTransfer contract"
        );
        _;
    }
    modifier onlyArtist(uint256 tokenId) {
        require(
            msgSender() == _addressStorage[tokenId][_SRR][_ARTIST_ADDRESS] ||
                isAdministrator(),
            "This is neither a artist nor the admin"
        );
        _;
    }

    modifier onlyPrimaryIssuer(uint256 tokenId) {
        require(
            (msgSender() == _addressStorage[tokenId][_SRR][_ISSUER] &&
                _boolStorage[tokenId][_SRR][_IS_PRIMARY_ISSUER]) || isAdministrator(),
            "This is neither a primary issuer nor the admin"
        );
        _;
    }

    /**
     * Guarantee the caller is the owner of the token (see msgSender() - this 
     * will be a proxied LicensedUser request in most cases) or the 
     * Administrator.
     *
     * This check will throw if the token does not exist (see ownerOf).
     */
    modifier onlySRROwnerOrAdministrator(uint256 tokenId) {
        address owner = getSRROwner(tokenId);
        require(
            owner == msgSender() || isAdministrator(),
            "Sender is neither a SRR owner nor the admin"
        );
        _;
    }

    modifier tokenExists(uint256 tokenId) {
        require(
            ERC721UpgradeSafe._exists(tokenId),
            "The tokenId does not exist"
        );
        _;
    }

    modifier customHistoryTypeIdExists(uint256 customHistoryTypeId) {
        require(
            bytes(
                customHistoryTypeNameById[customHistoryTypeId]
            )
                .length != 0,
            "The custom history type id does not exist"
        );
        _;
    }

    modifier customHistoryIdExists(uint256 customHistoryId) {
        require(
            bytes(_getCustomHistoryNameById(customHistoryId)).length != 0,
            "The custom history id does not exist"
        );
        _;
    }

    /**
     * @dev Initializes the address of the nameRegistry contract
     * @param nameRegistry address of the NameRegistry
     * @param trustedForwarder address of the EIP2771 forwarder which will be the LUM contract
     * @param name token name eg. 'Startrail Registry Record'
     * @param symbol token code eg. SRR
     * @param URIPrefix string of the URI prefix of the scheme where SRR metadata is saved
     * @param URIPostfix string of the URI postfix of the scheme
     */
    function initialize(
        address nameRegistry,
        address trustedForwarder,
        string memory name,
        string memory symbol,
        string memory URIPrefix,
        string memory URIPostfix
    ) public initializer {
        nameRegistryAddress = nameRegistry;
        _setTrustedForwarder(trustedForwarder);
        ERC721UpgradeSafe.__ERC721_init_from_SR(name, symbol);
        _stringStorage[SRR_GLOBAL_SLOT][_SRR][_URI_PREFIX] = URIPrefix;
        _stringStorage[SRR_GLOBAL_SLOT][_SRR][_URI_POSTFIX] = URIPostfix;
    }

    /**
     * @dev Change the EIP2711 trusted forwarder address
     * @param forwarder address of the forwarder contract
     */
    function setTrustedForwarder(
        address forwarder
    ) public onlyAdministrator {
        _setTrustedForwarder(forwarder);
    }

    /**
     * @dev Change the maxCombinedHistoryRecords for emitHistory
     * @param maxRecords new maximum
     */
    function setMaxCombinedHistoryRecords(
        uint256 maxRecords
    ) public onlyAdministrator {
        maxCombinedHistoryRecords = maxRecords;
    }

    function isAdministrator() private view returns (bool) {
        return _nameRegistry().administrator() == msgSender();
    }

    /**
     * @dev Creates a registryRecord of an artwork
     * @param isPrimaryIssuer boolean whether the user is a primary issuer
     * @param artistAddress address of the artist contract
     * @param metadataDigest bytes32 of metadata hash
     */
    function createSRR(
        bool isPrimaryIssuer,
        address artistAddress,
        bytes32 metadataDigest
    )
        public
        override(IStartrailRegistryV5)
        onlyAdministrator
    {
        _createSRR(isPrimaryIssuer, artistAddress, metadataDigest, msg.sender);
    }

    /**
     * @dev Creates a registryRecord of an artwork from LicensedUserLogic contract
     * @param isPrimaryIssuer address of the issuer user contract
     * @param artistAddress address of the artist contract
     * @param metadataDigest bytes32 of metadata hash
     * @return uint256 tokenId
     */
    function createSRRFromLicensedUser(
        bool isPrimaryIssuer,
        address artistAddress,
        bytes32 metadataDigest
    )
        public
        override(IStartrailRegistryV5)
        trustedForwarderOnly
        returns (uint256)
    {
        return
            _createSRR(
                isPrimaryIssuer,
                artistAddress,
                metadataDigest,
                msgSender()
            );
    }

    function createSRRFromBulk(
        bool isPrimaryIssuer,
        address artistAddress,
        bytes32 metadataDigest,
        address issuerAddress
    ) public override(IStartrailRegistryV5) onlyBulk returns (uint256) {
        return
            _createSRR(
                isPrimaryIssuer,
                artistAddress,
                metadataDigest,
                issuerAddress
            );
    }

    function approveSRRByCommitmentFromBulk(
        uint256 tokenId,
        bytes32 commitment,
        string memory historyMetadataDigest,
        uint256 customHistoryId
    ) public override(IStartrailRegistryV5) onlyBulkTransfer {
        _approveSRRByCommitment(
            tokenId,
            commitment,
            historyMetadataDigest,
            customHistoryId
        );
    }
    /**
     * @dev Updates the registryRecord
     * @param tokenId uint256 of StartrailRegistryRecordID
     * @param isPrimaryIssuer boolean whether the user is a primary issuer
     * @return uint256 tokenId
     */
    function updateSRRFromLicensedUser(
        uint256 tokenId,
        bool isPrimaryIssuer,
        address artistAddress
    )
        public
        override(IStartrailRegistryV5)
        onlyLicensedUserOrAdministrator()
        returns (uint256)
    {
        require(
            _saveSRR(tokenId, isPrimaryIssuer, artistAddress),
            "fail to updateSRR"
        );
        emit UpdateSRR(
            tokenId,
            SRR(isPrimaryIssuer, artistAddress, msgSender())
        );
        return tokenId;
    }

    /**
     * @dev Updates the SRR metadata
     * @param tokenId uint256 of StartrailRegistryRecordID
     * @param metadataDigest bytes32 of the metadata hash
     */
    function updateSRRMetadata(uint256 tokenId, bytes32 metadataDigest)
        external
        override(IStartrailRegistryV5)
        onlyLicensedUserOrAdministrator()
    {
        _bytes32Storage[tokenId][_SRR][_METADATA_DIGEST] = metadataDigest;
        emit UpdateSRRMetadataDigest(tokenId, metadataDigest);
    }

    /**
     * @dev Gets the owner address of the SRR
     * @param tokenId uint256 of the SRR ID
     * @return owner address
     */
    function getSRROwner(uint256 tokenId)
        public
        override(IStartrailRegistryV5)
        view
        returns (address)
    {
        return ERC721UpgradeSafe.ownerOf(tokenId);
    }

    /**
     * @dev Approves the given commitment hash to transfer the SRR
     * @param tokenId uint256 ID of the SRR
     * @param commitment bytes32 of the commitment hash
     * @param historyMetadataDigest string of the history metadata digest
     */
    function approveSRRByCommitment(
        uint256 tokenId,
        bytes32 commitment,
        string memory historyMetadataDigest
    )
        public
        override(IStartrailRegistryV5)
        onlySRROwnerOrAdministrator(tokenId)
    {
        _approveSRRByCommitment(
            tokenId,
            commitment,
            historyMetadataDigest,
            _NO_CUSTOM_HISTORY
        );
    }

    /**
     * @dev Approves the given commitment hash to transfer the SRR with custom history id
     * @param tokenId uint256 ID of the SRR
     * @param commitment bytes32 of the commitment hash
     * @param historyMetadataDigest string of the history metadata digest
     * @param customHistoryId to map with custom history
     */
    function approveSRRByCommitment(
        uint256 tokenId,
        bytes32 commitment,
        string memory historyMetadataDigest,
        uint256 customHistoryId
    )
        public
        override(IStartrailRegistryV5)
        onlySRROwnerOrAdministrator(tokenId)
        customHistoryIdExists(customHistoryId)
    {
        _approveSRRByCommitment(
            tokenId,
            commitment,
            historyMetadataDigest,
            customHistoryId
        );
    }

    /**
     * @dev Cancels the current commitment of a given SRR
     * @param tokenId uint256 ID of the SRR
     */
    function cancelSRRCommitment(uint256 tokenId)
        public
        override(IStartrailRegistryV5)
        onlySRROwnerOrAdministrator(tokenId)
    {
        _clearSRRCommitment(tokenId);
        emit SRRCommitmentCancelled(tokenId);
    }

    // TODO: delete on next release
    /**
     * @dev Transfers the ownership of a given SRR ID to another address.
     * @param to address to receive the ownership
     * @param reveal bytes32 of the reveal hash value to restore the commitment value
     * @param tokenId uint256 ID of the SRR to be transferred
     */
    function transferSRRByReveal(
        address to,
        bytes32 reveal,
        uint256 tokenId
    ) public override(IStartrailRegistryV5) tokenExists(tokenId) {
        _transferSRRByReveal(to, reveal, tokenId, false, true);
    }

    /**
     * @dev Transfers the ownership of a given SRR ID to another address.
     * @param to address to receive the ownership
     * @param reveal bytes32 of the reveal hash value to restore the commitment value
     * @param tokenId uint256 ID of the SRR to be transferred
     * @param isIntermediary bool flag of the intermediary default is false
     */
    function transferSRRByReveal(
        address to,
        bytes32 reveal,
        uint256 tokenId,
        bool isIntermediary
    ) public override(IStartrailRegistryV5) tokenExists(tokenId) {
        _transferSRRByReveal(to, reveal, tokenId, isIntermediary, false);
    }

    /**
     * @dev Associating custom histories with SRRs
     * @param tokenIds Array of SRR token IDs
     * @param customHistoryIds Array of customHistoryIds
     */
    function addHistory(
        uint256[] calldata tokenIds,
        uint256[] calldata customHistoryIds
    )
        public
        override(IStartrailRegistryV5)
        onlyLicensedUserOrAdministrator()
    {
        require(
            tokenIds.length * customHistoryIds.length <= maxCombinedHistoryRecords,
            "maximum number of combined tokens and histories exceeded"
        );

        uint16 i;

        for (i = 0; i < tokenIds.length; i++) {
            require(
                ERC721UpgradeSafe._exists(tokenIds[i]),
                "one of the tokenIds does not exist"
            );
        }
            
        for (i = 0; i < customHistoryIds.length; i++) {
            require(
                bytes(_getCustomHistoryNameById(customHistoryIds[i])).length != 0,
                "one of the customHistoryIds does not exist"
            );
        }
            
        emit History(tokenIds, customHistoryIds);
    }

    /**
     * @dev Sets the addresses of the reference
     * @param nameRegistry address of the NameRegistry
     */
    function setNameRegistryAddress(address nameRegistry)
        public
        override(IStartrailRegistryV5)
        onlyAdministrator
    {
        nameRegistryAddress = nameRegistry;
    }

    /**
     * @dev Sets the URI info of the scheme where SRR metadata is saved
     * @param URIPrefix string of the URI prefix of the scheme
     * @param URIPostfix string of the URI postfix of the scheme
     */
    function setTokenURIParts(string memory URIPrefix, string memory URIPostfix)
        public
        override(IStartrailRegistryV5)
        onlyAdministrator
    {
        _stringStorage[SRR_GLOBAL_SLOT][_SRR][_URI_PREFIX] = URIPrefix;
        _stringStorage[SRR_GLOBAL_SLOT][_SRR][_URI_POSTFIX] = URIPostfix;
    }

    /**
     * @dev Gets the registryRecord related with the tokenId
     * @param tokenId uint256 ID of StartrailRegistry
     * @return registryRecord dataset / metadataDigest
     */
    function getSRR(uint256 tokenId)
        public
        override(IStartrailRegistryV5)
        view
        tokenExists(tokenId)
        returns (SRR memory registryRecord, bytes32 metadataDigest)
    {
        registryRecord
            .isPrimaryIssuer = _boolStorage[tokenId][_SRR][_IS_PRIMARY_ISSUER];
        registryRecord
            .artistAddress = _addressStorage[tokenId][_SRR][_ARTIST_ADDRESS];
        registryRecord.issuer = _addressStorage[tokenId][_SRR][_ISSUER];
        metadataDigest = _bytes32Storage[tokenId][_SRR][_METADATA_DIGEST];
    }

    /**
     * @dev Gets the given commitment hash to transfer the SRR
     * @param tokenId uint256 ID of StartrailRegistry
     * @return commitment details
     */
    function getSRRCommitment(uint256 tokenId)
        public
        override(IStartrailRegistryV5)
        view
        tokenExists(tokenId)
        returns (
            bytes32 commitment,
            string memory historyMetadataDigest,
            uint256 customHistoryId
        )
    {
        commitment = _bytes32Storage[tokenId][_SRR][_COMMITMENT];
        historyMetadataDigest = _stringStorage[tokenId][_HISTORY][_METADATA_DIGEST];
        customHistoryId = _uintStorage[tokenId][_HISTORY][_CUSTOM_HISTORY];
    }

    /**
     * NOT USED - schema integrity is stored in the JSON document under $schemaIntegrity
     * @dev Gets the scheme digests and hash
     * @param tokenId uint256 ID of StartrailRegistry
     * @return digest Bytes returned from the hash algorithm, or "" if not available
     * @return hashAlgorithm The name of the cryptographic hash algorithm, or "" if not available
     */
    function tokenURISchemaIntegrity(uint256 tokenId)
        external
        override(IERC2477)
        view
        tokenExists(tokenId)
        returns (bytes memory digest, string memory hashAlgorithm)
    {
        digest = "";
        hashAlgorithm = "";
    }

    /**
     * @dev Gets the metadata digests of SRR and hash
     * @param tokenId uint256 ID of StartrailRegistry
     * @return digest Bytes returned from the hash algorithm, or "" if not available
     * @return hashAlgorithm The name of the cryptographic hash algorithm, or "" if not available
     */
    function tokenURIIntegrity(uint256 tokenId)
        external
        override(IERC2477)
        view
        tokenExists(tokenId)
        returns (bytes memory digest, string memory hashAlgorithm)
    {
        digest = abi.encodePacked(
            _bytes32Storage[tokenId][_SRR][_METADATA_DIGEST]
        );
        hashAlgorithm = HASH_ALGORITHM;
    }

    /**
     * @dev Returns the URI for a given token ID. May return an empty string.
     * @param tokenId id of token to return metadata string for
     * @return URI
     */
    function tokenURI(uint256 tokenId)
        public
        override
        view
        returns (string memory)
    {
        string memory metadataDigest = bytes32ToString(
            _bytes32Storage[tokenId][_SRR][_METADATA_DIGEST]
        );
        return
            string(
                abi.encodePacked(
                    _stringStorage[SRR_GLOBAL_SLOT][_SRR][_URI_PREFIX],
                    "0x",
                    metadataDigest,
                    _stringStorage[SRR_GLOBAL_SLOT][_SRR][_URI_POSTFIX]
                )
            );
    }

    /**
     * @dev Gets URI where the matadata is saved
     * @param metadataDigest string of metadata digests
     * @return URI
     */
    function tokenURI(string memory metadataDigest)
        public
        override(IStartrailRegistryV5)
        view
        returns (string memory)
    {
        return
            string(
                abi.encodePacked(
                    _stringStorage[SRR_GLOBAL_SLOT][_SRR][_URI_PREFIX],
                    metadataDigest,
                    _stringStorage[SRR_GLOBAL_SLOT][_SRR][_URI_POSTFIX]
                )
            );
    }

    /**
     * @dev add history type before creating history ig: exhibithion
     * @param historyTypeName name of the custom history type
     * @return id representing custom history type into mapping
     */
    function addCustomHistoryType(string memory historyTypeName)
        public
        override(IStartrailRegistryV5)
        onlyAdministrator
        returns (uint256 id)
    {
        require(
            customHistoryTypeIdByName[historyTypeName] == 0,
            "History type with the same name already exists"
        );

        customHistoryTypeCount++;
        id = customHistoryTypeCount;

        customHistoryTypeNameById[id] = historyTypeName;
        customHistoryTypeIdByName[historyTypeName] = id;

        emit CreateCustomHistoryType(id, historyTypeName);

        return id;
    }

    /**
     * @dev Write custom history ig: exhibithion
     * @param id to determine the history
     * @param name of the custom history
     * @param customHistoryTypeId of the custom history
     * @param metadataDigest representing custom history
     */
    function writeCustomHistory(
        string memory name,
        uint256 customHistoryTypeId,
        bytes32 metadataDigest
    )
        public
        override(IStartrailRegistryV5)
        onlyAdministrator
        customHistoryTypeIdExists(customHistoryTypeId)
        returns (uint256 id)
    {
        customHistoryCount++;
        id = customHistoryCount;

        _stringStorage[id][_CUSTOM_HISTORY][_CUSTOM_HISTORY_NAME] = name;
        emit CreateCustomHistory(id, name, customHistoryTypeId, metadataDigest);

        return id;
    }

    /**
     * @dev Gets custom history name by id
     * @param id uint256 of customHistoryId
     * @return custom history name
     */
    function getCustomHistoryNameById(uint256 id)
        public
        override(IStartrailRegistryV5)
        view
        customHistoryIdExists(id)
        returns (string memory)
    {
        return _getCustomHistoryNameById(id);
    }

    function _getCustomHistoryNameById(uint256 id)
        private
        view
        returns (string memory)
    {
        return _stringStorage[id][_CUSTOM_HISTORY][_CUSTOM_HISTORY_NAME];
    }

    /*
     * private functions
     */

    function _createSRR(
        bool isPrimaryIssuer,
        address artistAddress,
        bytes32 metadataDigest,
        address sender
    ) private returns (uint256) {
        uint256 tokenId = _mint(sender, metadataDigest, artistAddress);
        _addressStorage[tokenId][_SRR][_ISSUER] = sender;
        _bytes32Storage[tokenId][_SRR][_METADATA_DIGEST] = metadataDigest;
        require(
            _saveSRR(tokenId, isPrimaryIssuer, artistAddress),
            "fail to save Startrail Registry Record"
        );
        emit CreateSRR(
            tokenId,
            SRR(isPrimaryIssuer, artistAddress, sender),
            metadataDigest
        );
        return tokenId;
    }

    /**
     * @dev Saves the registryRecord
     * @param tokenId uint256 of StartrailRegistryRecordID
     * @param isPrimaryIssuer boolean whether the user is a primary issuer
     * @return bool whether the process is successful
     */
    function _saveSRR(
        uint256 tokenId,
        bool isPrimaryIssuer,
        address artistAddress
    ) private returns (bool) {
        _addressStorage[tokenId][_SRR][_ARTIST_ADDRESS] = artistAddress;
        _boolStorage[tokenId][_SRR][_IS_PRIMARY_ISSUER] = isPrimaryIssuer;
        return true;
    }

    function _approveSRRByCommitment(
        uint256 tokenId,
        bytes32 commitment,
        string memory historyMetadataDigest,
        uint256 customHistoryId
    ) private {
        address owner = getSRROwner(tokenId);
        if (_bytes32Storage[tokenId][_SRR][_COMMITMENT] != "") {
            emit SRRCommitmentCancelled(tokenId);
        }
        _bytes32Storage[tokenId][_SRR][_COMMITMENT] = commitment;
        _stringStorage[tokenId][_HISTORY][_METADATA_DIGEST] = historyMetadataDigest;
        if (customHistoryId == _NO_CUSTOM_HISTORY) {
            emit SRRCommitment(tokenId, owner, commitment);
        } else {
            _uintStorage[tokenId][_HISTORY][_CUSTOM_HISTORY] = customHistoryId;
            emit SRRCommitment(tokenId, owner, commitment, customHistoryId);
        }
    }
    
    function _transferSRRByReveal(
        address to,
        bytes32 reveal,
        uint256 tokenId,
        bool isIntermediary,
        bool isOldFunction // TODO: delete on next release
    ) private {
        bytes32 commitment;
        (commitment,,) = getSRRCommitment(tokenId);
        require(
            keccak256(abi.encodePacked(reveal)) == commitment,
            "Hash of reveal doesn't match"
        );
        address from = getSRROwner(tokenId);

        if(isOldFunction) {
            _historyProvenance(
                tokenId,
                from,
                to,
                _stringStorage[tokenId][_HISTORY][_METADATA_DIGEST],
                _uintStorage[tokenId][_HISTORY][_CUSTOM_HISTORY]
            );
        } else {
            _historyProvenance(
                tokenId,
                from,
                to,
                _stringStorage[tokenId][_HISTORY][_METADATA_DIGEST],
                _uintStorage[tokenId][_HISTORY][_CUSTOM_HISTORY],
                isIntermediary
            );
        }
        _clearSRRCommitment(tokenId);
        ERC721UpgradeSafe._transfer(from, to, tokenId);
    }
    
    // TODO: delete on next release
    function _historyProvenance(
        uint256 tokenId,
        address from,
        address to,
        string memory historyMetadataDigest,
        uint256 customHistoryId // adding this to support common private function to use emit history provenance
    ) private {
        string memory historyMetadataURI = tokenURI(historyMetadataDigest);
        if (customHistoryId != _NO_CUSTOM_HISTORY) {
            emit Provenance(
                tokenId,
                from,
                to,
                customHistoryId,
                historyMetadataDigest,
                historyMetadataURI
            );
        } else {
            emit Provenance(
                tokenId,
                from,
                to,
                historyMetadataDigest,
                historyMetadataURI
            );
        }
    }

    function _historyProvenance(
        uint256 tokenId,
        address from,
        address to,
        string memory historyMetadataDigest,
        uint256 customHistoryId, // adding this to support common private function to use emit history provenance
        bool isIntermediary
    ) private {
        string memory historyMetadataURI = tokenURI(historyMetadataDigest);
        if (customHistoryId != _NO_CUSTOM_HISTORY) {
            emit Provenance(
                tokenId,
                from,
                to,
                customHistoryId,
                historyMetadataDigest,
                historyMetadataURI,
                isIntermediary
            );
        } else {
            emit Provenance(
                tokenId,
                from,
                to,
                historyMetadataDigest,
                historyMetadataURI,
                isIntermediary
            );
        }
    }

    function _clearSRRCommitment(uint256 tokenId) private {
        _bytes32Storage[tokenId][_SRR][_COMMITMENT] = "";
        _stringStorage[tokenId][_HISTORY][_METADATA_DIGEST] = "";
        _uintStorage[tokenId][_HISTORY][_CUSTOM_HISTORY] = 0;
    }

    function _nameRegistry() private view returns (INameRegistry) {
        return INameRegistry(nameRegistryAddress);
    }

    /**
     * @dev Generate a ERC721 token ID and mint for ERC721
     * @param sender address of the sender
     * @param metadataDigest metadataDigest for token
     * @return uint256 tokenId
     */
    function _mint(
        address sender,
        bytes32 metadataDigest,
        address artistAddress
    ) private returns (uint256) {
        uint256 tokenId;
        tokenId = IDGenerator.generate(metadataDigest, artistAddress);
        ERC721UpgradeSafe._mint(sender, tokenId);
        return tokenId;
    }

    /**
     * @dev Gets the tokenID from ID Generator using metadataDigest.
     * @param metadataDigest bytes32 metadata digest of token
     * @return tokenId from metadataDigest
     */
    function getTokenId(bytes32 metadataDigest, address artistAddress)
        external
        override(IStartrailRegistryV5)
        pure
        returns (uint256)
    {
        return IDGenerator.generate(metadataDigest, artistAddress);
    }

    /*
     * STARTRAIL-844 one time function to fix broken provenance created_at 
     *   timestamps.
     *
     * TODO: remove once the fix has been applied.
     */
    function emitProvenanceDateMigrationFix(
        uint256 tokenId,
        uint256 originTimestamp
    )
        external
        override(IStartrailRegistryV5)
        onlyAdministrator
    {
        emit ProvenanceDateMigrationFix(tokenId, originTimestamp);
    }

    /**
     * Convert a bytes32 into a string by manually converting each hex digit
     * to it's corresponding string codepoint.
     */
    function bytes32ToString(bytes32 b32)
        internal
        pure
        returns
        (string memory)
    {
        string memory res = new string(64);
        for (uint8 i; i < 32; i++) {
            uint256 hex1 = uint8(b32[i] >> 4);
            uint256 hex2 = uint8((b32[i] << 4) >> 4);
            uint256 char1 = hex1 + (hex1 < 10 ? 48 : 87);
            uint256 char2 = hex2 + (hex2 < 10 ? 48 : 87);
            assembly {
                let chPtr := add(mul(i, 2), add(res, 32))
                mstore8(chPtr, char1)
                mstore8(add(chPtr, 1), char2)
            }
        }
        return res;
  }


}
