// SPDX-License-Identifier: GPL-3.0-only

pragma solidity 0.8.21;

import "@openzeppelin/contracts/utils/introspection/ERC165.sol";
import "@openzeppelin/contracts/interfaces/IERC2981.sol";
import "../proxy/utils/InitializableWithGap.sol";
import "../common/INameRegistry.sol";
import "../common/IStartrailRegistryV20.sol";
import "../lib/IDGeneratorV3.sol";
import "../metaTx/eip2771/EIP2771BaseRecipient.sol";
import "../name/Contracts.sol";
import "./Storage.sol";
import "./ERC721.sol";
import "./IStartrailRegistryMigrationV2.sol";
import "./OpenSeaMetaTransactionLibrary.sol";
import "./StartrailRegistryLibraryV1.sol";

interface ILicensedUserManager {
    function isActiveWallet(address walletAddress) external pure returns (bool);
}

contract StartrailRegistryV20 is
    Contracts,
    IStartrailRegistryV20,
    IStartrailRegistryMigrationV2,
    InitializableWithGap,
    Storage,
    ERC721UpgradeSafe,
    EIP2771BaseRecipient,
    IERC2981
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
    bytes32 private constant _METADATA_HASH = keccak256("metadataDigest");

    // contract-level metadata
    bytes32 private constant _CONTRACT_URI = keccak256("contractURI");

    // custom history
    bytes32 private constant _CUSTOM_HISTORY = keccak256("customHistory");
    bytes32 private constant _CUSTOM_HISTORY_NAME =
        keccak256("customHistoryName");
    // flag to disable standard ERC721 transfer method
    bytes32 private constant _LOCK_EXTERNAL_TRANSFER =
        keccak256("lockExternalTransfer");

    bytes32 private constant _OPENSEA_PROXY_ADDRESS =
        keccak256("openSeaProxyAddress");
    bytes32 private constant _OPENSEA_APPROVE_ALL_KILL_SWITCH =
        keccak256("openSeaApproveAllKillSwitch");

    uint256 private constant _NO_CUSTOM_HISTORY = 0;

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
    address public owner;

    // OpenSea Meta Transaction integration and storage
    using OpenSeaMetaTransactionLibrary for OpenSeaMetaTransactionLibrary.OpenSeaMetaTransactionStorage;

    OpenSeaMetaTransactionLibrary.OpenSeaMetaTransactionStorage
        private openSeaMetaTx;

    /**
     * Royalties
     * marked `public` to provide direct read access to the percentages.
     * required for proposed SBINFT implementation AND
     * it's handy to have this lookup as royaltyInfo doesn't show this.
     * although it could be derived: `royaltyInfo(tokenId, 1 ether);
     */
    mapping(uint256 => RoyaltyInfo) public royalties;

    /**
     * @dev See {IERC165-supportsInterface}.
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(IERC165, ERC721UpgradeSafe)
        returns (bool)
    {
        return
            interfaceId == type(IERC2981).interfaceId ||
            super.supportsInterface(interfaceId);
    }

    /*
     * Modifiers (as functions to save deployment gas - see
     *   https://ethereum.org/en/developers/tutorials/downsizing-contracts-to-fight-the-contract-size-limit/#remove-modifiers
     * )
     */

    function onlyAdministrator() private view {
        require(isAdministrator(), "Caller is not the Startrail Administrator");
    }

    function onlyIssuerOrArtistOrAdministrator(uint256 tokenId) private view {
        if (!isAdministrator()) {
            if (!isIssuer(tokenId)) {
                require(
                    isArtist(tokenId),
                    "Caller is not the Startrail Administrator or an Issuer or an Artist"
                );
            }
        }
    }

    function onlyLicensedUserOrAdministrator() private view {
        if (!isAdministrator()) {
            require(
                ILicensedUserManager(
                    INameRegistry(nameRegistryAddress).get(
                        Contracts.LICENSED_USER_MANAGER
                    )
                ).isActiveWallet(msgSender()),
                "Caller is not the Startrail Administrator or a LicensedUser"
            );
        }
    }

    // for bytecode optimize.
    // if the same code is inlined multiple times, it adds up in size and that size limit can be hit easily.
    function onlyBulk() private view {
        INameRegistry nr = INameRegistry(nameRegistryAddress);
        require(
            nr.get(BULK) == msg.sender ||
                nr.get(BULK_ISSUE) == msg.sender ||
                nr.get(BULK_TRANSFER) == msg.sender,
            "The sender is not the Bulk related contract"
        );
    }

    function onlyIssuerOrAdministrator(uint256 tokenId) private view {
        require(
            msgSender() == _addressStorage[tokenId][_SRR][_ISSUER] ||
                isAdministrator(),
            "This is neither a issuer nor the admin"
        );
    }

    /**
     * Guarantee the caller is the owner of the token (see msgSender() - this
     * will be a proxied LicensedUser request in most cases) or the
     * Administrator.
     *
     * This check will throw if the token does not exist (see ownerOf).
     */
    function onlySRROwnerOrAdministrator(uint256 tokenId) private view {
        require(
            ownerOf(tokenId) == msgSender() || isAdministrator(),
            "Sender is neither a SRR owner nor the admin"
        );
    }

    function tokenExists(uint256 tokenId) private view {
        require(
            ERC721UpgradeSafe._exists(tokenId),
            "The tokenId does not exist"
        );
    }

    function customHistoryIdExists(uint256 customHistoryId) private view {
        require(
            bytes(getCustomHistoryNameById(customHistoryId)).length != 0,
            "The custom history id does not exist"
        );
    }

    function requireCustomHistoryName(string memory name) private pure {
        require(bytes(name).length != 0, "The custom history name is required");
    }

    function externalTransferNotLocked(uint256 tokenId) private view {
        require(
            !_boolStorage[tokenId][_SRR][_LOCK_EXTERNAL_TRANSFER],
            "Transfer is locked for this token"
        );
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

    // COMMENT OUT as this is only required on deployment the first time and
    //    leaving this in just adds dead bytecode to subsequent implementations

    // function initialize(
    //     address nameRegistry,
    //     address trustedForwarder,
    //     string memory name,
    //     string memory symbol,
    //     string memory URIPrefix,
    //     string memory URIPostfix
    // ) public initializer {
    //     nameRegistryAddress = nameRegistry;
    //     _setTrustedForwarder(trustedForwarder);
    //     ERC721UpgradeSafe.__ERC721_init_from_SR(name, symbol);
    //     _stringStorage[SRR_GLOBAL_SLOT][_SRR][_URI_PREFIX] = URIPrefix;
    //     _stringStorage[SRR_GLOBAL_SLOT][_SRR][_URI_POSTFIX] = URIPostfix;
    // }

    /**
     * @dev Change the EIP2711 trusted forwarder address
     * @param forwarder address of the forwarder contract
     */
    function setTrustedForwarder(address forwarder) external {
        onlyAdministrator();
        _setTrustedForwarder(forwarder);
    }

    /**
     * @dev Change the maxCombinedHistoryRecords for emitHistory
     * @param maxRecords new maximum
     */
    function setMaxCombinedHistoryRecords(uint256 maxRecords) external {
        onlyAdministrator();
        maxCombinedHistoryRecords = maxRecords;
    }

    function isAdministrator() private view returns (bool) {
        return
            INameRegistry(nameRegistryAddress).administrator() == msgSender();
    }

    function isIssuer(uint256 tokenId) private view returns (bool) {
        return msgSender() == _addressStorage[tokenId][_SRR][_ISSUER];
    }

    function isArtist(uint256 tokenId) private view returns (bool) {
        return msgSender() == _addressStorage[tokenId][_SRR][_ARTIST_ADDRESS];
    }

    /**
     * @dev Creates a registryRecord of an artwork from LicensedUser wallet
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
    ) public override(IStartrailRegistryV20) trustedForwarderOnly {
        _createSRR(
            isPrimaryIssuer,
            artistAddress,
            metadataDigest,
            "",
            msgSender(),
            lockExternalTransfer_,
            address(0),
            0
        );
    }

    /**
     * backward compatibility
     * @dev Creates a registryRecord of an artwork from LicensedUser wallet and transfers it to the recipient
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
    ) public override(IStartrailRegistryV20) trustedForwarderOnly {
        uint256 tokenId = _createSRR(
            isPrimaryIssuer,
            artistAddress,
            metadataDigest,
            "",
            msgSender(),
            lockExternalTransfer_,
            address(0),
            0
        );
        if (to != address(0)) {
            ERC721UpgradeSafe._transfer(msgSender(), to, tokenId);
        }
    }

    /**
     * @dev Creates a registryRecord of an artwork from LicensedUser wallet and transfers it to the recipient
     * @param isPrimaryIssuer address of the issuer user contract
     * @param artistAddress address of the artist contract
     * @param metadataDigest bytes32 of metadata hash used by detect if createSRR is duplicate
     * @param metadataCID string of ipfs cid
     * @param lockExternalTransfer_ bool of the flag to disable standard ERC721 transfer methods
     * @param to the address this token will be transferred to after the creation
     * @param royaltyReceiver royalty receiver
     * @param royaltyPercentage royalty percentage
     */
    function createSRRFromLicensedUser(
        bool isPrimaryIssuer,
        address artistAddress,
        bytes32 metadataDigest,
        string memory metadataCID,
        bool lockExternalTransfer_,
        address to,
        address royaltyReceiver,
        uint16 royaltyPercentage
    ) public override(IStartrailRegistryV20) trustedForwarderOnly {
        uint256 tokenId = _createSRR(
            isPrimaryIssuer,
            artistAddress,
            metadataDigest,
            metadataCID,
            msgSender(),
            lockExternalTransfer_,
            royaltyReceiver,
            royaltyPercentage
        );
        if (to != address(0)) {
            ERC721UpgradeSafe._transfer(msgSender(), to, tokenId);
        }
    }

    // backward compatibility
    function createSRRFromBulk(
        bool isPrimaryIssuer,
        address artistAddress,
        bytes32 metadataDigest,
        address issuerAddress,
        bool lockExternalTransfer_
    ) public override(IStartrailRegistryV20) returns (uint256) {
        onlyBulk();
        return
            _createSRR(
                isPrimaryIssuer,
                artistAddress,
                metadataDigest,
                "",
                issuerAddress,
                lockExternalTransfer_,
                address(0),
                0
            );
    }

    function createSRRFromBulk(
        bool isPrimaryIssuer,
        address artistAddress,
        bytes32 metadataDigest,
        string memory metadataCID,
        address issuerAddress,
        bool lockExternalTransfer_,
        address royaltyReceiver,
        uint16 royaltyPercentage
    ) public override(IStartrailRegistryV20) returns (uint256) {
        onlyBulk();
        return
            _createSRR(
                isPrimaryIssuer,
                artistAddress,
                metadataDigest,
                metadataCID,
                issuerAddress,
                lockExternalTransfer_,
                royaltyReceiver,
                royaltyPercentage
            );
    }

    function approveSRRByCommitmentFromBulk(
        uint256 tokenId,
        bytes32 commitment,
        string memory historyMetadataHash,
        uint256 customHistoryId
    ) public override(IStartrailRegistryV20) {
        onlyBulk();
        _approveSRRByCommitment(
            tokenId,
            commitment,
            historyMetadataHash,
            customHistoryId
        );
    }

    function transferFromWithProvenanceFromBulk(
        address to,
        uint256 tokenId,
        string memory historyMetadataHash,
        uint256 customHistoryId,
        bool isIntermediary
    ) external override(IStartrailRegistryV20) {
        onlyBulk();
        _transferFromWithProvenance(
            to,
            tokenId,
            historyMetadataHash,
            customHistoryId,
            isIntermediary
        );
    }

    /**
     * @dev Updates the registryRecord
     * @param tokenId uint256 of StartrailRegistryRecordID
     * @param isPrimaryIssuer boolean whether the user is a primary issuer
     * @param artistAddress artists LUW
     */
    function updateSRR(
        uint256 tokenId,
        bool isPrimaryIssuer,
        address artistAddress
    ) external override(IStartrailRegistryV20) {
        tokenExists(tokenId);
        onlyIssuerOrArtistOrAdministrator(tokenId);
        _saveSRR(tokenId, isPrimaryIssuer, artistAddress);

        emit UpdateSRR(tokenId, isPrimaryIssuer, artistAddress, msgSender());
    }

    /**
     * @dev Updates the SRR metadata
     * @param tokenId uint256 of StartrailRegistryRecordID
     * @param metadataDigest bytes32 of the metadata hash
     */
    function updateSRRMetadata(uint256 tokenId, bytes32 metadataDigest)
        external
        override(IStartrailRegistryV20)
    {
        tokenExists(tokenId);
        onlyIssuerOrArtistOrAdministrator(tokenId);
        _bytes32Storage[tokenId][_SRR][_METADATA_HASH] = metadataDigest;
        emit UpdateSRRMetadataDigest(tokenId, metadataDigest);
    }

    /**
     * @dev Updates the SRR metadata
     * @param tokenId uint256 of StartrailRegistryRecordID
     * @param metadataCID string of ipfs cid
     */
    function updateSRRMetadata(uint256 tokenId, string memory metadataCID)
        external
        override(IStartrailRegistryV20)
    {
        tokenExists(tokenId);
        onlyIssuerOrArtistOrAdministrator(tokenId);
        _stringStorage[tokenId][_SRR][_METADATA_HASH] = metadataCID;
        emit UpdateSRRMetadataDigest(tokenId, metadataCID);
    }

    /**
     * @dev Updates the SRR Royalty
     * @param tokenId uint256 of StartrailRegistryRecordID
     * @param royaltyReceiver royalty receiver
     * @param royaltyPercentage royalty percentage
     */
    function updateSRRRoyalty(
        uint256 tokenId,
        address royaltyReceiver,
        uint16 royaltyPercentage
    ) external override(IStartrailRegistryV20) {
        tokenExists(tokenId);
        onlyIssuerOrArtistOrAdministrator(tokenId);

        _saveRoyalties(tokenId, royaltyPercentage, royaltyReceiver);
        emit RoyaltiesSet(tokenId, _getTokenRoyalty(tokenId));
    }

    /**
     * @dev Approves the given commitment hash to transfer the SRR
     * @param tokenId uint256 ID of the SRR
     * @param commitment bytes32 of the commitment hash
     * @param historyMetadataHash string of the history metadata digest or cid
     */
    function approveSRRByCommitment(
        uint256 tokenId,
        bytes32 commitment,
        string memory historyMetadataHash
    ) external override(IStartrailRegistryV20) {
        onlySRROwnerOrAdministrator(tokenId);
        _approveSRRByCommitment(
            tokenId,
            commitment,
            historyMetadataHash,
            _NO_CUSTOM_HISTORY
        );
    }

    /**
     * @dev Approves the given commitment hash to transfer the SRR with custom history id
     * @param tokenId uint256 ID of the SRR
     * @param commitment bytes32 of the commitment hash
     * @param historyMetadataHash string of the history metadata digest or cid
     * @param customHistoryId to map with custom history
     */
    function approveSRRByCommitment(
        uint256 tokenId,
        bytes32 commitment,
        string memory historyMetadataHash,
        uint256 customHistoryId
    ) external override(IStartrailRegistryV20) {
        onlySRROwnerOrAdministrator(tokenId);
        customHistoryIdExists(customHistoryId);
        _approveSRRByCommitment(
            tokenId,
            commitment,
            historyMetadataHash,
            customHistoryId
        );
    }

    /**
     * @dev Cancels the current commitment of a given SRR
     * @param tokenId uint256 ID of the SRR
     */
    function cancelSRRCommitment(uint256 tokenId)
        external
        override(IStartrailRegistryV20)
    {
        onlySRROwnerOrAdministrator(tokenId);
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
    ) external override(IStartrailRegistryV20) {
        tokenExists(tokenId);

        bytes32 commitment;
        (commitment, , ) = getSRRCommitment(tokenId);
        require(
            keccak256(abi.encodePacked(reveal)) == commitment,
            "Hash of reveal doesn't match"
        );

        address from = ownerOf(tokenId);

        _historyProvenance(
            tokenId,
            from,
            to,
            _stringStorage[tokenId][_HISTORY][_METADATA_HASH],
            _uintStorage[tokenId][_HISTORY][_CUSTOM_HISTORY],
            isIntermediary
        );

        _clearSRRCommitment(tokenId);

        ERC721UpgradeSafe._transfer(from, to, tokenId);
    }

    /**
     * @dev Associating custom histories with SRRs
     * @param tokenIds Array of SRR token IDs
     * @param customHistoryIds Array of customHistoryIds
     */
    function addHistory(
        uint256[] calldata tokenIds,
        uint256[] calldata customHistoryIds
    ) external override(IStartrailRegistryV20) {
        onlyLicensedUserOrAdministrator();
        require(
            tokenIds.length * customHistoryIds.length <=
                maxCombinedHistoryRecords,
            "maximum number of combined tokens and histories exceeded"
        );

        uint16 i;

        for (i = 0; i < tokenIds.length; i++) {
            require(
                ERC721UpgradeSafe._exists(tokenIds[i]),
                "one of the tokenIds does not exist"
            );
            onlyIssuerOrArtistOrAdministrator(tokenIds[i]);
        }

        for (i = 0; i < customHistoryIds.length; i++) {
            // REVERTs inside this call if the id does not exist
            customHistoryIdExists(customHistoryIds[i]);
        }

        emit History(tokenIds, customHistoryIds);
    }

    /**
     * @dev Sets the addresses of the reference
     * @param nameRegistry address of the NameRegistry
     */
    function setNameRegistryAddress(address nameRegistry)
        external
        override(IStartrailRegistryV20)
    {
        require(nameRegistry != address(0), "nameRegistry cannot be 0 address");
        onlyAdministrator();
        nameRegistryAddress = nameRegistry;
    }

    /**
     * @dev Sets the URI info of the scheme where SRR metadata is saved
     * @param URIPrefix string of the URI prefix of the scheme
     * @param URIPostfix string of the URI postfix of the scheme
     */
    function setTokenURIParts(string memory URIPrefix, string memory URIPostfix)
        external
        override(IStartrailRegistryV20)
    {
        onlyAdministrator();
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
        view
        override(IStartrailRegistryV20)
        returns (SRR memory registryRecord, bytes32 metadataDigest)
    {
        tokenExists(tokenId);
        registryRecord.isPrimaryIssuer = _boolStorage[tokenId][_SRR][
            _IS_PRIMARY_ISSUER
        ];
        registryRecord.artistAddress = _addressStorage[tokenId][_SRR][
            _ARTIST_ADDRESS
        ];
        registryRecord.issuer = _addressStorage[tokenId][_SRR][_ISSUER];
        metadataDigest = _bytes32Storage[tokenId][_SRR][_METADATA_HASH];
    }

    /**
     * @dev Gets the given commitment hash to transfer the SRR
     * @param tokenId uint256 ID of StartrailRegistry
     * @return commitment details
     */
    function getSRRCommitment(uint256 tokenId)
        public
        view
        override(IStartrailRegistryV20)
        returns (
            bytes32 commitment,
            string memory historyMetadataHash,
            uint256 customHistoryId
        )
    {
        tokenExists(tokenId);
        commitment = _bytes32Storage[tokenId][_SRR][_COMMITMENT];
        historyMetadataHash = _stringStorage[tokenId][_HISTORY][_METADATA_HASH];
        customHistoryId = _uintStorage[tokenId][_HISTORY][_CUSTOM_HISTORY];
    }

    /**
     * @dev Returns the URI for a given token ID. May return an empty string.
     * @param tokenId id of token to return metadata string for
     * @return URI
     */
    function tokenURI(uint256 tokenId)
        public
        view
        override
        returns (string memory)
    {
        bool isCID = isNotEmptyString(
            _stringStorage[tokenId][_SRR][_METADATA_HASH]
        );
        if (isCID) {
            return
                StartrailRegistryLibraryV1.tokenURIFromString(
                    _stringStorage[tokenId][_SRR][_METADATA_HASH],
                    "ipfs://",
                    ""
                );
        } else {
            return
                StartrailRegistryLibraryV1.tokenURIFromBytes32(
                    _bytes32Storage[tokenId][_SRR][_METADATA_HASH],
                    _stringStorage[SRR_GLOBAL_SLOT][_SRR][_URI_PREFIX],
                    _stringStorage[SRR_GLOBAL_SLOT][_SRR][_URI_POSTFIX]
                );
        }
    }

    /**
     * @dev Gets URI where the matadata is saved
     * @param metadataDigest string of metadata digests with 0x prefix or metadata cid
     * @return URI
     */
    function tokenURI(string memory metadataDigest)
        public
        view
        override(IStartrailRegistryV20)
        returns (string memory)
    {
        // length == 0x + 64, it's metadataDigest not ipfs cid
        if (bytes(metadataDigest).length == 66) {
            return
                StartrailRegistryLibraryV1.tokenURIFromString(
                    metadataDigest,
                    _stringStorage[SRR_GLOBAL_SLOT][_SRR][_URI_PREFIX],
                    _stringStorage[SRR_GLOBAL_SLOT][_SRR][_URI_POSTFIX]
                );
        } else {
            // it's cid
            return
                StartrailRegistryLibraryV1.tokenURIFromString(
                    metadataDigest,
                    "ipfs://",
                    ""
                );
        }
    }

    /**
     * @dev add history type before creating history id: exhibition
     * @param historyTypeName name of the custom history type
     */
    function addCustomHistoryType(string memory historyTypeName)
        external
        override(IStartrailRegistryV20)
    {
        onlyAdministrator();
        require(
            customHistoryTypeIdByName[historyTypeName] == 0,
            "History type with the same name already exists"
        );

        customHistoryTypeCount++;

        customHistoryTypeNameById[customHistoryTypeCount] = historyTypeName;
        customHistoryTypeIdByName[historyTypeName] = customHistoryTypeCount;

        emit CreateCustomHistoryType(customHistoryTypeCount, historyTypeName);
    }

    /**
     * @dev Write custom history id: exhibition
     * @param name of the custom history
     * @param customHistoryTypeId of the custom history
     * @param metadataDigest representing custom history
     */
    function writeCustomHistory(
        string memory name,
        uint256 customHistoryTypeId,
        bytes32 metadataDigest
    ) public override(IStartrailRegistryV20) {
        onlyAdministrator();

        require(
            bytes(customHistoryTypeNameById[customHistoryTypeId]).length != 0,
            "The custom history type id does not exist"
        );

        customHistoryCount++;

        _stringStorage[customHistoryCount][_CUSTOM_HISTORY][
            _CUSTOM_HISTORY_NAME
        ] = name;
        emit CreateCustomHistory(
            customHistoryCount,
            name,
            customHistoryTypeId,
            metadataDigest
        );
    }

    /**
     * @dev Write custom history id: exhibition
     * @param name of the custom history
     * @param customHistoryTypeId of the custom history
     * @param metadataCID representing custom history
     */
    function writeCustomHistory(
        string memory name,
        uint256 customHistoryTypeId,
        string memory metadataCID
    ) public override(IStartrailRegistryV20) {
        onlyAdministrator();

        require(
            bytes(customHistoryTypeNameById[customHistoryTypeId]).length != 0,
            "The custom history type id does not exist"
        );

        customHistoryCount++;

        _stringStorage[customHistoryCount][_CUSTOM_HISTORY][
            _CUSTOM_HISTORY_NAME
        ] = name;
        emit CreateCustomHistory(
            customHistoryCount,
            name,
            customHistoryTypeId,
            metadataCID
        );
    }

    /**
     * @dev update custom history id: exhibition
     * @param customHistoryId of the custom history to update
     * @param metadataDigest representing custom history
     */
    function updateCustomHistory(
        uint256 customHistoryId,
        string memory name,
        bytes32 metadataDigest
    ) public override(IStartrailRegistryV20) {
        onlyAdministrator();

        // REVERTs inside this call if the id does not exist
        customHistoryIdExists(customHistoryId);

        requireCustomHistoryName(name);

        if (
            keccak256(bytes(getCustomHistoryNameById(customHistoryId))) !=
            keccak256(bytes(name))
        ) {
            _stringStorage[customHistoryId][_CUSTOM_HISTORY][
                _CUSTOM_HISTORY_NAME
            ] = name;
        }

        emit UpdateCustomHistory(customHistoryId, name, metadataDigest);
    }

    /**
     * @dev update custom history id: exhibition
     * @param customHistoryId of the custom history to update
     * @param metadataCID representing custom history ipfs cid
     */
    function updateCustomHistory(
        uint256 customHistoryId,
        string memory name,
        string memory metadataCID
    ) public override(IStartrailRegistryV20) {
        onlyAdministrator();

        // REVERTs inside this call if the id does not exist
        customHistoryIdExists(customHistoryId);

        requireCustomHistoryName(name);

        if (
            keccak256(bytes(getCustomHistoryNameById(customHistoryId))) !=
            keccak256(bytes(name))
        ) {
            _stringStorage[customHistoryId][_CUSTOM_HISTORY][
                _CUSTOM_HISTORY_NAME
            ] = name;
        }

        emit UpdateCustomHistory(customHistoryId, name, metadataCID);
    }

    /**
     * @dev Gets custom history name by id
     * @param id uint256 of customHistoryId
     * @return custom history name
     */
    function getCustomHistoryNameById(uint256 id)
        public
        view
        override(IStartrailRegistryV20)
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
        bytes32 metadataDigestBytes32,
        string memory metadataCID, // `calldata` triggers compiler bug #7929
        address sender,
        bool lockExternalTransfer_,
        address royaltyReceiver,
        uint16 royaltyPercentage
    ) private returns (uint256 tokenId) {
        bool isCID = isNotEmptyString(metadataCID);

        // check if SRR already exists on chain for artist and metadata combination
        // it's needed for the situation happens if a user send the tx to this contract directly
        require(
            !ERC721UpgradeSafe._exists(
                IDGeneratorV3.generate(metadataDigestBytes32, artistAddress)
            ),
            "SRR already exists on chain for artist/metadata combination"
        );
        require(
            !ERC721UpgradeSafe._exists(
                IDGeneratorV3.generate(metadataCID, artistAddress)
            ),
            "SRR already exists on chain for artist/metadata combination"
        );

        if (royaltyReceiver != address(0)) {
            require(
                royaltyPercentage <= 10000,
                "ERC2981: royalty fee will exceed salePrice"
            );
        }

        tokenId = isCID
            ? IDGeneratorV3.generate(metadataCID, artistAddress)
            : IDGeneratorV3.generate(metadataDigestBytes32, artistAddress);

        ERC721UpgradeSafe._mint(sender, tokenId);

        _addressStorage[tokenId][_SRR][_ISSUER] = sender;

        if (isCID) {
            _stringStorage[tokenId][_SRR][_METADATA_HASH] = metadataCID;
        } else {
            _bytes32Storage[tokenId][_SRR][
                _METADATA_HASH
            ] = metadataDigestBytes32;
        }

        _boolStorage[tokenId][_SRR][
            _LOCK_EXTERNAL_TRANSFER
        ] = lockExternalTransfer_;

        _saveSRR(tokenId, isPrimaryIssuer, artistAddress);

        if (isCID) {
            emit CreateSRR(
                tokenId,
                SRR(isPrimaryIssuer, artistAddress, sender),
                metadataCID,
                lockExternalTransfer_
            );
        } else {
            emit CreateSRR(
                tokenId,
                SRR(isPrimaryIssuer, artistAddress, sender),
                metadataDigestBytes32,
                lockExternalTransfer_
            );
        }

        if (royaltyReceiver != address(0)) {
            _saveRoyalties(tokenId, royaltyPercentage, royaltyReceiver);
            emit RoyaltiesSet(tokenId, _getTokenRoyalty(tokenId));
        }
    }

    /**
     * @dev Saves the registryRecord
     * @param tokenId uint256 of StartrailRegistryRecordID
     * @param isPrimaryIssuer boolean whether the user is a primary issuer
     */
    function _saveSRR(
        uint256 tokenId,
        bool isPrimaryIssuer,
        address artistAddress
    ) private {
        _addressStorage[tokenId][_SRR][_ARTIST_ADDRESS] = artistAddress;
        _boolStorage[tokenId][_SRR][_IS_PRIMARY_ISSUER] = isPrimaryIssuer;
    }

    function _approveSRRByCommitment(
        uint256 tokenId,
        bytes32 commitment,
        string memory historyMetadataHash,
        uint256 customHistoryId
    ) private {
        if (_bytes32Storage[tokenId][_SRR][_COMMITMENT] != "") {
            emit SRRCommitmentCancelled(tokenId);
        }
        _bytes32Storage[tokenId][_SRR][_COMMITMENT] = commitment;
        _stringStorage[tokenId][_HISTORY][_METADATA_HASH] = historyMetadataHash;
        if (customHistoryId == _NO_CUSTOM_HISTORY) {
            emit SRRCommitment(tokenId, ownerOf(tokenId), commitment);
        } else {
            _uintStorage[tokenId][_HISTORY][_CUSTOM_HISTORY] = customHistoryId;
            emit SRRCommitment(
                tokenId,
                ownerOf(tokenId),
                commitment,
                customHistoryId
            );
        }
    }

    function _historyProvenance(
        uint256 tokenId,
        address from,
        address to,
        string memory historyMetadataHash,
        uint256 customHistoryId, // adding this to support common private function to use emit history provenance
        bool isIntermediary
    ) private {
        string memory historyMetadataURI = tokenURI(historyMetadataHash);
        if (customHistoryId != _NO_CUSTOM_HISTORY) {
            emit Provenance(
                tokenId,
                from,
                to,
                customHistoryId,
                historyMetadataHash,
                historyMetadataURI,
                isIntermediary
            );
        } else {
            emit Provenance(
                tokenId,
                from,
                to,
                historyMetadataHash,
                historyMetadataURI,
                isIntermediary
            );
        }
    }

    function _clearSRRCommitment(uint256 tokenId) private {
        _bytes32Storage[tokenId][_SRR][_COMMITMENT] = "";
        _stringStorage[tokenId][_HISTORY][_METADATA_HASH] = "";
        _uintStorage[tokenId][_HISTORY][_CUSTOM_HISTORY] = 0;
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
    ) public override {
        externalTransferNotLocked(tokenId);
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
    ) public override {
        externalTransferNotLocked(tokenId);
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
    ) public override {
        externalTransferNotLocked(tokenId);
        ERC721UpgradeSafe.safeTransferFrom(from, to, tokenId, _data);
    }

    /**
     * @dev Safely transfers the ownership of a given token ID to another address
     * This function records the provenance at the same time as safeTransferFrom is executed.
     * In addition, check the externalTransferNotLocked modifier.
     * If lockExternalTransfer of tokenId is true, the transfer is reverted.
     * @param to address to receive the ownership of the given token ID
     * @param tokenId uint256 ID of the token to be transferred
     * @param historyMetadataHash string of the history metadata digest or cid
     * @param customHistoryId to map with custom history
     * @param isIntermediary bool flag of the intermediary default is false
     */
    function transferFromWithProvenance(
        address to,
        uint256 tokenId,
        string memory historyMetadataHash,
        uint256 customHistoryId,
        bool isIntermediary
    ) external override(IStartrailRegistryV20) {
        externalTransferNotLocked(tokenId);
        onlySRROwnerOrAdministrator(tokenId);
        _transferFromWithProvenance(
            to,
            tokenId,
            historyMetadataHash,
            customHistoryId,
            isIntermediary
        );
    }

    function _transferFromWithProvenance(
        address to,
        uint256 tokenId,
        string memory historyMetadataHash,
        uint256 customHistoryId,
        bool isIntermediary
    ) private {
        address from = ownerOf(tokenId);
        _historyProvenance(
            tokenId,
            from,
            to,
            historyMetadataHash,
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
    function approve(address to, uint256 tokenId) public override {
        externalTransferNotLocked(tokenId);
        address tokenOwner = ownerOf(tokenId);
        require(to != tokenOwner, "ERC721: approval to current owner");

        require(
            _msgSender() == tokenOwner ||
                isApprovedForAll(tokenOwner, _msgSender()) ||
                isAdministrator(),
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
        external
        override(IStartrailRegistryV20)
    {
        onlyIssuerOrAdministrator(tokenId);
        tokenExists(tokenId);
        _boolStorage[tokenId][_SRR][_LOCK_EXTERNAL_TRANSFER] = flag;
        emit LockExternalTransfer(tokenId, flag);
    }

    /**
     * @dev Get the flag to disable standard ERC721 transfer method
     * @param tokenId uint256 of StartrailRegistryRecordID
     */
    function lockExternalTransfer(uint256 tokenId)
        public
        view
        override(IStartrailRegistryV20)
        returns (bool)
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
        external
        view
        override(IStartrailRegistryV20)
        returns (string memory)
    {
        return _stringStorage[SRR_GLOBAL_SLOT][_SRR][_CONTRACT_URI];
    }

    /**
     * @dev Setter enabling admin to change the contract metadata URI
     */
    function setContractURI(string memory _contractURI)
        external
        override(IStartrailRegistryV20)
    {
        onlyAdministrator();
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
     * @dev Transfers ownership of the contract to a new account (`newOwner`).
     * Can only be called by the current owner. Follows the standard Ownable
     * naming for the event.
     */
    function transferOwnership(address newOwner)
        public
        override(IStartrailRegistryV20)
    {
        onlyAdministrator();
        require(
            newOwner != address(0),
            "Ownable: new owner is the zero address"
        );
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
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
        public
        view
        override
        returns (bool)
    {
        // Whitelist OpenSea proxy contract for easy trading.
        // see docs here: https://docs.opensea.io/docs/polygon-basic-integration#code-example-for-erc721
        if (
            _boolStorage[SRR_GLOBAL_SLOT][_SRR][
                _OPENSEA_APPROVE_ALL_KILL_SWITCH
            ] ==
            false &&
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
    function setOpenSeaApproveAllKillSwitch(bool on) public {
        onlyAdministrator();
        _boolStorage[SRR_GLOBAL_SLOT][_SRR][
            _OPENSEA_APPROVE_ALL_KILL_SWITCH
        ] = on;
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
    ) public {
        onlyAdministrator();
        _addressStorage[SRR_GLOBAL_SLOT][_SRR][
            _OPENSEA_PROXY_ADDRESS
        ] = proxyRegistryAddress;
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
        return
            openSeaMetaTx.executeMetaTransaction(
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
    function _msgSender() internal view override returns (address sender) {
        return
            OpenSeaMetaTransactionLibrary.msgSenderFromEIP2771MsgData(msg.data);
    }

    function isNotEmptyString(string memory _string)
        internal
        pure
        returns (bool)
    {
        return bytes(_string).length > 0;
    }

    /**
     * @dev get royalty information for the token id
     */
    function _getTokenRoyalty(uint256 tokenId)
        private
        view
        returns (RoyaltyInfo memory)
    {
        RoyaltyInfo memory royalty = royalties[tokenId];
        if (royalty.receiver == address(0)) {
            // The default receiver address 0x75194F40c5337d218A6798B02BbB34500a653A16 is what we use for OpenSea
            // for all environments like QA, STG and production. As we set the default royalty to 0, this shouldn’t matter.
            royalty = RoyaltyInfo(
                0x75194F40c5337d218A6798B02BbB34500a653A16,
                0
            );
        }
        return royalty;
    }

    /**
     * @dev Saves the Royalty
     * @param tokenId uint256 of StartrailRegistryRecordID
     * @param percentage uint16
     * @param receiver address
     */
    function _saveRoyalties(
        uint256 tokenId,
        uint16 percentage,
        address receiver
    ) private {
        require(
            receiver != address(0),
            "ERC2981: royalty receiver can not be address(0)"
        );

        require(
            percentage <= 10000,
            "ERC2981: royalty fee will exceed salePrice"
        );

        tokenExists(tokenId);

        royalties[tokenId] = RoyaltyInfo(receiver, percentage);
    }

    /**
     * @notice Called with the sale price to determine how much royalty
     *         is owed and to whom.
     *  @param _tokenId - the NFT asset queried for royalty information
     *  @param _salePrice - the sale price of the NFT asset specified by _tokenId
     *  @return receiver - address of who should be sent the royalty payment
     *  @return royaltyAmount - the royalty payment amount for _salePrice
     */
    function royaltyInfo(uint256 _tokenId, uint256 _salePrice)
        external
        view
        override
        returns (address, uint256)
    {
        RoyaltyInfo memory royalty = _getTokenRoyalty(_tokenId);

        uint256 royaltyAmount = (_salePrice * royalty.percentage) / 10000;

        return (royalty.receiver, royaltyAmount);
    }
}
