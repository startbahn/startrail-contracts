// SPDX-License-Identifier: GPL-3.0-only

pragma solidity 0.8.28;

import "../proxy/utils/InitializableWithGap.sol";
import "../common/INameRegistry.sol";
import "../common/IStartrailRegistryV12.sol";
import "../lib/IDGeneratorV2.sol";
import "../metaTx/eip2771/EIP2771BaseRecipient.sol";
import "../name/Contracts.sol";
import "./Storage.sol";
import "./IERC2477.sol";
import "./ERC721.sol";
import "./IStartrailRegistryMigrationV2.sol";
import "./OpenSeaMetaTransactionLibrary.sol";
import "./StartrailRegistryLibraryV1.sol";

interface ILicensedUserManager {
    function isActiveWallet(address walletAddress) external pure returns (bool);
}

contract StartrailRegistryV12 is
    Contracts,
    IERC2477,
    IStartrailRegistryV12,
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
    bytes32 private constant _COMMITMENT = keccak256("commitment");

    // metadata
    bytes32 private constant _URI_PREFIX = keccak256("URIPrefix");
    bytes32 private constant _URI_POSTFIX = keccak256("URIPostfix");
    bytes32 private constant _METADATA_DIGEST = keccak256("metadataDigest");

    // contract-level metadata
    bytes32 private constant _CONTRACT_URI = keccak256("contractURI");

    // custom history
    bytes32 private constant _CUSTOM_HISTORY = keccak256("customHistory");
    bytes32 private constant _CUSTOM_HISTORY_NAME = keccak256(
        "customHistoryName"
    );
    // flag to disable standard ERC721 transfer method
    bytes32 private constant _LOCK_EXTERNAL_TRANSFER = keccak256("lockExternalTransfer");
    
    bytes32 private constant _OPENSEA_PROXY_ADDRESS = keccak256("openSeaProxyAddress");
    bytes32 private constant _OPENSEA_APPROVE_ALL_KILL_SWITCH = keccak256("openSeaApproveAllKillSwitch");

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

    // owner address it is required for arranging the contract meta data in opensea
    address private _owner;

    // OpenSea Meta Transaction integration and storage
    using OpenSeaMetaTransactionLibrary for
        OpenSeaMetaTransactionLibrary.OpenSeaMetaTransactionStorage;

    OpenSeaMetaTransactionLibrary.OpenSeaMetaTransactionStorage private
        openSeaMetaTx;

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
        _isBulk();
        _;
    }
    
    // for bytecode optimize. 
    // if the same code is inlined multiple times, it adds up in size and that size limit can be hit easily.
    function _isBulk() internal view {
        address bulkAddress = _nameRegistry().get(BULK);
        address bulkIssueAddress = _nameRegistry().get(BULK_ISSUE);
        address bulkTransferAddress = _nameRegistry().get(BULK_TRANSFER);
        require(
            bulkAddress == msg.sender || bulkIssueAddress == msg.sender || bulkTransferAddress == msg.sender ,
            "The sender is not the Bulk related contract"
        );

    }

    modifier onlyIssuerOrAdministrator(uint256 tokenId) {
        require(
            msgSender() == _addressStorage[tokenId][_SRR][_ISSUER] || isAdministrator(),
            "This is neither a issuer nor the admin"
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
        address owner_ = getSRROwner(tokenId);
        require(
            owner_ == msgSender() || isAdministrator(),
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

    modifier externalTransferNotLocked(uint256 tokenId) {
        require(
            !_boolStorage[tokenId][_SRR][_LOCK_EXTERNAL_TRANSFER],
            "Transfer is locked for this token"
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
     * @param lockExternalTransfer_ bool of the flag to disable standard ERC721 transfer methods
     */
    function createSRR(
        bool isPrimaryIssuer,
        address artistAddress,
        bytes32 metadataDigest,
        bool lockExternalTransfer_
    )
        public
        override(IStartrailRegistryV12)
        onlyAdministrator
    {
        _createSRR(isPrimaryIssuer, artistAddress, metadataDigest, msg.sender, lockExternalTransfer_);
    }

    /**
     * @dev Creates a registryRecord of an artwork from LicensedUserLogic contract and transfers it to the recipient
     * @param isPrimaryIssuer boolean whether the user is a primary issuer
     * @param artistAddress address of the artist contract
     * @param metadataDigest bytes32 of metadata hash
     * @param lockExternalTransfer_ bool of the flag to disable standard ERC721 transfer methods
     * @param to the address this token will be transferred to after the creation
     */
    function createSRR(
        bool isPrimaryIssuer,
        address artistAddress,
        bytes32 metadataDigest,
        bool lockExternalTransfer_,
        address to
    )
        public
        override(IStartrailRegistryV12)
        onlyAdministrator
    {
        uint256 tokenId = _createSRR(isPrimaryIssuer, artistAddress, metadataDigest, msg.sender, lockExternalTransfer_);
        ERC721UpgradeSafe._transfer(msg.sender, to, tokenId);
    }

    /**
     * @dev Creates a registryRecord of an artwork from LicensedUserLogic contract
     * @param isPrimaryIssuer address of the issuer user contract
     * @param artistAddress address of the artist contract
     * @param metadataDigest bytes32 of metadata hash
     * @param lockExternalTransfer_ bool of the flag to disable standard ERC721 transfer methods
     */
    function createSRRFromLicensedUser(
        bool isPrimaryIssuer,
        address artistAddress,
        bytes32 metadataDigest,
        bool lockExternalTransfer_
    )
        public
        override(IStartrailRegistryV12)
        trustedForwarderOnly
    {
        _createSRR(
            isPrimaryIssuer,
            artistAddress,
            metadataDigest,
            msgSender(),
            lockExternalTransfer_
        );
    }

    /**
     * @dev Creates a registryRecord of an artwork from LicensedUserLogic contract and transfers it to the recipient
     * @param isPrimaryIssuer address of the issuer user contract
     * @param artistAddress address of the artist contract
     * @param metadataDigest bytes32 of metadata hash
     * @param lockExternalTransfer_ bool of the flag to disable standard ERC721 transfer methods
     * @param to the address this token will be transferred to after the creation
     */
    function createSRRFromLicensedUser(
        bool isPrimaryIssuer,
        address artistAddress,
        bytes32 metadataDigest,
        bool lockExternalTransfer_,
        address to
    )
        public
        override(IStartrailRegistryV12)
        trustedForwarderOnly
    {
        uint256 tokenId = _createSRR(
            isPrimaryIssuer,
            artistAddress,
            metadataDigest,
            msgSender(),
            lockExternalTransfer_
        );

        ERC721UpgradeSafe._transfer(msgSender(), to, tokenId);
    }

    function createSRRFromBulk(
        bool isPrimaryIssuer,
        address artistAddress,
        bytes32 metadataDigest,
        address issuerAddress,
        bool lockExternalTransfer_
    ) public override(IStartrailRegistryV12) onlyBulk returns (uint256) {
        return 
            _createSRR(
                isPrimaryIssuer,
                artistAddress,
                metadataDigest,
                issuerAddress,
                lockExternalTransfer_
            );
    }

    function approveSRRByCommitmentFromBulk(
        uint256 tokenId,
        bytes32 commitment,
        string memory historyMetadataDigest,
        uint256 customHistoryId
    ) public override(IStartrailRegistryV12) onlyBulk {
        _approveSRRByCommitment(
            tokenId,
            commitment,
            historyMetadataDigest,
            customHistoryId
        );
    }

    function transferFromWithProvenanceFromBulk(
        address to,
        uint256 tokenId,
        string memory historyMetadataDigest,
        uint256 customHistoryId,
        bool isIntermediary
    ) public override(IStartrailRegistryV12) onlyBulk {
        _transferFromWithProvenance(to, tokenId, historyMetadataDigest, customHistoryId, isIntermediary);
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
        override(IStartrailRegistryV12)
        onlyLicensedUserOrAdministrator()
        tokenExists(tokenId)
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
        override(IStartrailRegistryV12)
        onlyLicensedUserOrAdministrator()
        tokenExists(tokenId)
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
        override(IStartrailRegistryV12)
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
        override(IStartrailRegistryV12)
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
        override(IStartrailRegistryV12)
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
        override(IStartrailRegistryV12)
        onlySRROwnerOrAdministrator(tokenId)
    {
        _clearSRRCommitment(tokenId);
        emit SRRCommitmentCancelled(tokenId);
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
    ) public override(IStartrailRegistryV12) tokenExists(tokenId) {
        _transferSRRByReveal(to, reveal, tokenId, isIntermediary);
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
        override(IStartrailRegistryV12)
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
        override(IStartrailRegistryV12)
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
        override(IStartrailRegistryV12)
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
        override(IStartrailRegistryV12)
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
        override(IStartrailRegistryV12)
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
        return StartrailRegistryLibraryV1.tokenURIFromBytes32(
            _bytes32Storage[tokenId][_SRR][_METADATA_DIGEST],
            _stringStorage[SRR_GLOBAL_SLOT][_SRR][_URI_PREFIX],
            _stringStorage[SRR_GLOBAL_SLOT][_SRR][_URI_POSTFIX]
        );
    }

    /**
     * @dev Gets URI where the matadata is saved
     * @param metadataDigest string of metadata digests
     * @return URI
     */
    function tokenURI(string memory metadataDigest)
        public
        override(IStartrailRegistryV12)
        view
        returns (string memory)
    {
        return StartrailRegistryLibraryV1.tokenURIFromString(
            metadataDigest,
            _stringStorage[SRR_GLOBAL_SLOT][_SRR][_URI_PREFIX],
            _stringStorage[SRR_GLOBAL_SLOT][_SRR][_URI_POSTFIX]
        );
    }

    /**
     * @dev add history type before creating history ig: exhibithion
     * @param historyTypeName name of the custom history type
     * @return id representing custom history type into mapping
     */
    function addCustomHistoryType(string memory historyTypeName)
        public
        override(IStartrailRegistryV12)
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
        override(IStartrailRegistryV12)
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
        override(IStartrailRegistryV12)
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
        address sender,
        bool lockExternalTransfer_
    ) private returns (uint256) {
        uint256 tokenId = _mint(sender, metadataDigest, artistAddress);
        _addressStorage[tokenId][_SRR][_ISSUER] = sender;
        _bytes32Storage[tokenId][_SRR][_METADATA_DIGEST] = metadataDigest;
        _boolStorage[tokenId][_SRR][_LOCK_EXTERNAL_TRANSFER] = lockExternalTransfer_;
        require(
            _saveSRR(tokenId, isPrimaryIssuer, artistAddress),
            "fail to save Startrail Registry Record"
        );
        emit CreateSRR(
            tokenId,
            SRR(isPrimaryIssuer, artistAddress, sender),
            metadataDigest,
            lockExternalTransfer_
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
        address owner_ = getSRROwner(tokenId);
        if (_bytes32Storage[tokenId][_SRR][_COMMITMENT] != "") {
            emit SRRCommitmentCancelled(tokenId);
        }
        _bytes32Storage[tokenId][_SRR][_COMMITMENT] = commitment;
        _stringStorage[tokenId][_HISTORY][_METADATA_DIGEST] = historyMetadataDigest;
        if (customHistoryId == _NO_CUSTOM_HISTORY) {
            emit SRRCommitment(tokenId, owner_, commitment);
        } else {
            _uintStorage[tokenId][_HISTORY][_CUSTOM_HISTORY] = customHistoryId;
            emit SRRCommitment(tokenId, owner_, commitment, customHistoryId);
        }
    }
    
    function _transferSRRByReveal(
        address to,
        bytes32 reveal,
        uint256 tokenId,
        bool isIntermediary
    ) private {
        bytes32 commitment;
        (commitment,,) = getSRRCommitment(tokenId);
        require(
            keccak256(abi.encodePacked(reveal)) == commitment,
            "Hash of reveal doesn't match"
        );
        address from = getSRROwner(tokenId);

        _historyProvenance(
            tokenId,
            from,
            to,
            _stringStorage[tokenId][_HISTORY][_METADATA_DIGEST],
            _uintStorage[tokenId][_HISTORY][_CUSTOM_HISTORY],
            isIntermediary
        );

        _clearSRRCommitment(tokenId);
        ERC721UpgradeSafe._transfer(from, to, tokenId);
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
        tokenId = IDGeneratorV2.generate(metadataDigest, artistAddress);
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
        override(IStartrailRegistryV12)
        pure
        returns (uint256)
    {
        return IDGeneratorV2.generate(metadataDigest, artistAddress);
    }

    /**
     * @dev Transfers the ownership of a given token ID to another address.
     * Usage of this method is discouraged, use {safeTransferFrom} whenever possible.
     * Requires the msg.sender to be the owner, approved, or operator.
     * This function overwrites transferFrom with the externalTransferNotLocked modifier.
     * If lockExternalTransfer of tokenId is true, the transfer is reverted.
     * @param from current owner of the token
     * @param to address to receive the ownership of the given token ID
     * @param tokenId uint256 ID of the token to be transferred
     */
    function transferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public externalTransferNotLocked(tokenId) override {
        ERC721UpgradeSafe.transferFrom(from, to, tokenId);
    }

    /**
     * @dev Safely transfers the ownership of a given token ID to another address
     * If the target address is a contract, it must implement {IERC721Receiver-onERC721Received},
     * which is called upon a safe transfer, and return the magic value
     * `bytes4(keccak256("onERC721Received(address,address,uint256,bytes)"))`; otherwise,
     * the transfer is reverted.
     * Requires the msg.sender to be the owner, approved, or operator
     * This function overwrites safeTransferFrom with the externalTransferNotLocked modifier.
     * If lockExternalTransfer of tokenId is true, the transfer is reverted.
     * @param from current owner of the token
     * @param to address to receive the ownership of the given token ID
     * @param tokenId uint256 ID of the token to be transferred
     */
    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public externalTransferNotLocked(tokenId) override {
        safeTransferFrom(from, to, tokenId, "");
    }

    /**
     * @dev Safely transfers the ownership of a given token ID to another address
     * If the target address is a contract, it must implement {IERC721Receiver-onERC721Received},
     * which is called upon a safe transfer, and return the magic value
     * `bytes4(keccak256("onERC721Received(address,address,uint256,bytes)"))`; otherwise,
     * the transfer is reverted.
     * Requires the msg.sender to be the owner, approved, or operator
     * This function overwrites safeTransferFrom with the externalTransferNotLocked modifier.
     * If lockExternalTransfer of tokenId is true, the transfer is reverted.
     * @param from current owner of the token
     * @param to address to receive the ownership of the given token ID
     * @param tokenId uint256 ID of the token to be transferred
     * @param _data bytes data to send along with a safe transfer check
     */
    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId,
        bytes memory _data
    ) public externalTransferNotLocked(tokenId) override {
        ERC721UpgradeSafe.safeTransferFrom(from, to, tokenId, _data);
    }

    /**
     * @dev Safely transfers the ownership of a given token ID to another address
     * This function records the provenance at the same time as safeTransferFrom is executed.
     * In addition, check the externalTransferNotLocked modifier.
     * If lockExternalTransfer of tokenId is true, the transfer is reverted.
     * @param to address to receive the ownership of the given token ID
     * @param tokenId uint256 ID of the token to be transferred
     * @param historyMetadataDigest string of the history metadata digest
     * @param customHistoryId to map with custom history
     * @param isIntermediary bool flag of the intermediary default is false
     */
    function transferFromWithProvenance(
        address to,
        uint256 tokenId,
        string memory historyMetadataDigest,
        uint256 customHistoryId,
        bool isIntermediary
    )
        public 
        override(IStartrailRegistryV12)
        externalTransferNotLocked(tokenId) 
        onlySRROwnerOrAdministrator(tokenId)
    {
        _transferFromWithProvenance(to, tokenId, historyMetadataDigest, customHistoryId, isIntermediary);
    }

    function _transferFromWithProvenance(
        address to,
        uint256 tokenId,
        string memory historyMetadataDigest,
        uint256 customHistoryId,
        bool isIntermediary
    )
        private
    {
        address from = getSRROwner(tokenId);
        _historyProvenance(
            tokenId,
            from,
            to,
            historyMetadataDigest,
            customHistoryId,
            isIntermediary
        );
        ERC721UpgradeSafe._safeTransfer(from, to, tokenId, "");
    }

    /**
     * @dev Approves another address to transfer the given token ID
     * The zero address indicates there is no approved address.
     * There can only be one approved address per token at a given time.
     * Can only be called by the token owner or an approved operator.
     * This function overwrites approve with the externalTransferNotLocked modifier.
     * If lockExternalTransfer of tokenId is true, the approval is reverted.
     * @param to address to be approved for the given token ID
     * @param tokenId uint256 ID of the token to be approved
     */
    function approve(address to, uint256 tokenId) public externalTransferNotLocked(tokenId) override {
        address owner_ = ownerOf(tokenId);
        require(to != owner_, "ERC721: approval to current owner");

        require(
            _msgSender() == owner_ || isApprovedForAll(owner_, _msgSender()) || isAdministrator(),
            "ERC721: approve caller is not owner nor approved for all"
        );

        _approve(to, tokenId);
    }

    /**
     * @dev Disable standard ERC721 transfer method
     * @param tokenId uint256 of StartrailRegistryRecordID
     * @param flag bool of the flag to disable standard ERC721 transfer methods
     */
    function setLockExternalTransfer(uint256 tokenId, bool flag)
        public
        override(IStartrailRegistryV12)
        onlyIssuerOrAdministrator(tokenId)
        tokenExists(tokenId)
    {
        _boolStorage[tokenId][_SRR][_LOCK_EXTERNAL_TRANSFER] = flag;
        emit LockExternalTransfer(tokenId, flag);
    }

    /**
     * @dev Get the flag to disable standard ERC721 transfer method
     * @param tokenId uint256 of StartrailRegistryRecordID
     */
    function lockExternalTransfer(uint256 tokenId)
        public
        override(IStartrailRegistryV12)
        view
        returns(bool)
    {
        return _boolStorage[tokenId][_SRR][_LOCK_EXTERNAL_TRANSFER];
    }


    /**************************************************************************
     *
     * OpenSea integration related functions
     *
     *************************************************************************/

    /**************************************************************************
     * contractURI
     *
     * For contract level metadata in OpenSea
     *************************************************************************/

    /**
     * @dev OpenSea specific function to provide contract level or "storefront"
     *   metadata.
     * see https://docs.opensea.io/docs/contract-level-metadata
     */
    function contractURI()
        public
        override(IStartrailRegistryV12)
        view
        returns (string memory)
    {
        return _stringStorage[SRR_GLOBAL_SLOT][_SRR][_CONTRACT_URI];
    }

    /**
     * @dev Setter enabling admin to change the contract metadata URI
     */
    function setContractURI(string memory _contractURI)
        public
        override(IStartrailRegistryV12)
        onlyAdministrator
    {
        _stringStorage[SRR_GLOBAL_SLOT][_SRR][_CONTRACT_URI] = _contractURI;
    }


    /**************************************************************************
     * Ownership
     *
     * For signatures to OpenSea that set contract level properties. This
     * can't be a contract address as OpenSea doesn't support that. So we will
     * set an EOA here that can sign messages from the OpenSea DApp.
     *************************************************************************/

    /**
     * @dev Get the "contract owner" address, the address authorized to sign
     *   OpenSea messages that change contract level properties in OpenSea.
     */
    function owner()
        public
        override(IStartrailRegistryV12)
        view
        returns (address)
    {
        return _owner;
    }

    /**
     * @dev Transfers ownership of the contract to a new account (`newOwner`).
     * Can only be called by the current owner. Follows the standard Ownable
     * naming for the event.
     */
    function transferOwnership(address newOwner)
        public onlyAdministrator
        override(IStartrailRegistryV12)
    {
        require(newOwner != address(0), "Ownable: new owner is the zero address");
        emit OwnershipTransferred(_owner, newOwner);
        _owner = newOwner;
    }

    /**************************************************************************
     * Transfers and Approvals
     *
     * Override isApprovedAll to whitelist OpenSea addresses to approve(),
     * transferFrom() and safeTransferFrom tokens.
     *************************************************************************/

    /**
     * @dev Standard ERC721.isApprovedForAll with an additional whitelisting
     *   of OpenSea addresses registered with their ProxyRegistry contract.
     */
    function isApprovedForAll(address tokenOwner, address operator)
        override
        public
        view
        returns (bool)
    {
        // Whitelist OpenSea proxy contract for easy trading.
        // see docs here: https://docs.opensea.io/docs/polygon-basic-integration#code-example-for-erc721
        if (
            _boolStorage[SRR_GLOBAL_SLOT][_SRR][_OPENSEA_APPROVE_ALL_KILL_SWITCH] == false &&
            getOpenSeaProxyAddress() == operator
        ) {
            return true;
        }

        return super.isApprovedForAll(tokenOwner, operator);
    }

    /**
     * @dev Turn on / off the kill switch for OpenSea isApprovedForAll ability.
     *
     * Basically a kill switch if we find the ProxyRegistry is compromised or
     * rogue or something.
     */
    function setOpenSeaApproveAllKillSwitch(bool on)
        public
        onlyAdministrator
    {
        _boolStorage[SRR_GLOBAL_SLOT][_SRR][_OPENSEA_APPROVE_ALL_KILL_SWITCH] =
            on;
    }

    /**************************************************************************
     * Meta Transactions
     *
     * Enable meta transactions that trigger approvals and transfers so
     * OpenSea users can send gas-less transactions.
     *
     * NOTE: these are entirely separate from the Startrail meta transactions
     *   which operate on Startrail specific functions.
     *************************************************************************/

    /**
     * @dev Setup OpenSea meta transaction integration details.
     *
     * Should be a one time function but we make it possible for the admin to
     * change this after the fact here in case we need to do that.
     */
    function setOpenSeaMetaTxIntegration(
        address proxyRegistryAddress,
        string calldata name
    )
        public
        onlyAdministrator
    {
        _addressStorage[SRR_GLOBAL_SLOT][_SRR][_OPENSEA_PROXY_ADDRESS] =
            proxyRegistryAddress;
        openSeaMetaTx.setDomainSeparator(name);
    }

    /**
     * @dev Execute a meta transaction on one of the ERC721 approve/transfer functions.
     */
    function executeMetaTransaction(
        address userAddress,
        bytes memory callData,
        bytes32 sigR,
        bytes32 sigS,
        uint8 sigV
    ) public returns (bytes memory) {
        return openSeaMetaTx.executeMetaTransaction(
            userAddress,
            callData,
            sigR,
            sigS,
            sigV
        );
    }

    /**
     * @dev Get next meta-tx nonce by user.
     */
    function getNonce(address user) public view returns (uint256) {
        return openSeaMetaTx.nonces[user];
    }

    /**
     * @dev Get the chain id if callers building the signatures require this.
     *
     * In reality they should be aware of what chain they are sending too. But
     * not sure if OpenSea requires this getter to build the meta transaction
     * so making it public and available here to be sure.
     */
    function getChainId() public view returns (uint256) {
        return OpenSeaMetaTransactionLibrary.getChainId();
    }

    /**
     * @dev Get the domain seperator
     */
    function getDomainSeperator() public view returns (bytes32) {
        return openSeaMetaTx.getDomainSeperator();
    }

    /**
     * @dev Get the registered OpenSea proxy address
     */
    function getOpenSeaProxyAddress() public view returns (address) {
        return _addressStorage[SRR_GLOBAL_SLOT][_SRR][_OPENSEA_PROXY_ADDRESS];
    }

    /**
     * Override ERC721._msgSender to enable EIP2771 lookups for meta
     * transactions on the ERC721 functions transferFrom, safeTransferFrom,
     * approve, setApprovalForAll.
     *
     * NOTE: this function is distinct from the EIP2771BaseReceipient.msgSender
     * which is used for EIP2771 forwards for Startrail meta transactions
     * forwarded by the Startrail MetaTxForwarder.
     */
    function _msgSender()
        internal
        override
        view
        returns (address sender)
    {
        return OpenSeaMetaTransactionLibrary.msgSenderFromEIP2771MsgData(msg.data);
    }

}
