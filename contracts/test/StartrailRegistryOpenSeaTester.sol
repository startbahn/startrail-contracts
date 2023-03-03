// SPDX-License-Identifier: GPL-3.0-only

pragma solidity 0.8.13;

import "../startrailregistry/Storage.sol";
import "../startrailregistry/ERC721.sol";
import "../startrailregistry/OpenSeaMetaTransactionLibrary.sol";

/**
 * This is a modified version of the StartrailRegistry that includes just the
 * core ERC721 functions and the OpenSea integration related functions.
 *
 * The purpose of this is to deploy on Polygon to test the various OpenSea
 * integration pieces work okay without needing to do a full Startrail
 * shadow deployment to test this and without needing to upgrade our
 * main deployment just to test.
 *
 * Ideally we could do this on OpenSea testnets site but it is broken for
 * both Mumbai and Rinkeby testnets.
 */
contract StartrailRegistryOpenSeaTester is
    Storage,
    ERC721UpgradeSafe
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
    bytes32 private constant _METADATA_DIGEST = keccak256("metadataDigest");

    // contract-level metadata
    bytes32 private constant _CONTRACT_URI = keccak256("contractURI");

    // flag to disable standard ERC721 transfer method
    bytes32 private constant _LOCK_EXTERNAL_TRANSFER = keccak256("lockExternalTransfer");
    
    bytes32 private constant _OPENSEA_PROXY_ADDRESS = keccak256("openSeaProxyAddress");
    bytes32 private constant _OPENSEA_APPROVE_ALL_KILL_SWITCH = keccak256("openSeaApproveAllKillSwitch");

    /**
    * Structs
    */

    struct SRR {
        bool isPrimaryIssuer;
        address artistAddress;
        address issuer;
    }

    /*
     * Events
     */
  
    event CreateSRR(
        uint256 indexed tokenId,
        SRR registryRecord,
        string metadataDigest,
        bool lockExternalTransfer
    );

    event OwnershipTransferred(
        address indexed previousOwner, 
        address indexed newOwner
    );
  

    /*
     * State
     */

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

    modifier onlyOwner() {
        require(msg.sender == _owner, "Only owner can call this");
        _;
    }

    modifier tokenExists(uint256 tokenId) {
        require(
            ERC721UpgradeSafe._exists(tokenId),
            "The tokenId does not exist"
        );
        _;
    }

    constructor(
        string memory name,
        string memory symbol,
        string memory uriPrefix
    ) {
        ERC721UpgradeSafe.__ERC721_init_from_SR(name, symbol);
        _stringStorage[SRR_GLOBAL_SLOT][_SRR][_URI_PREFIX] = uriPrefix;
        _owner = msg.sender;
    }

    /**
     * @dev See {IERC165-supportsInterface}.
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override
        returns (bool)
    {
        return interfaceId == type(IERC721).interfaceId ||
               interfaceId == type(IERC721Metadata).interfaceId || 
               super.supportsInterface(interfaceId);
    }

    /**
     * @dev generate determined tokenId
     * @param metadataDigest bytes32 metadata digest of token
     * @return uint256 tokenId
     */
    function idGenerate(string calldata metadataDigest, address artistAddress)
        public
        pure
        returns (uint256)
    {
        uint256 ID_CAP = 10 ** 12;
        return
            uint256(
                keccak256(abi.encodePacked(metadataDigest, artistAddress))
            ) % ID_CAP;
    }

    /**
     * @dev Creates a registryRecord of an artwork
     * @param isPrimaryIssuer boolean whether the user is a primary issuer
     * @param artistAddress address of the artist contract
     * @param metadataDigest str of metadata hash
     * @param lockExternalTransfer bool of the flag to disable standard ERC721 transfer methods
     */
    function createSRR(
        bool isPrimaryIssuer,
        address artistAddress,
        string calldata metadataDigest,
        bool lockExternalTransfer
    )
        public
        onlyOwner
    {
        _createSRR(isPrimaryIssuer, artistAddress, metadataDigest, msg.sender, lockExternalTransfer);
    }

    /**
     * @dev Gets the registryRecord related with the tokenId
     * @param tokenId uint256 ID of StartrailRegistry
     * @return registryRecord dataset / metadataDigest
     */
    function getSRR(uint256 tokenId)
        public
        view
        tokenExists(tokenId)
        returns (SRR memory registryRecord, string memory metadataDigest)
    {
        registryRecord
            .isPrimaryIssuer = _boolStorage[tokenId][_SRR][_IS_PRIMARY_ISSUER];
        registryRecord
            .artistAddress = _addressStorage[tokenId][_SRR][_ARTIST_ADDRESS];
        registryRecord.issuer = _addressStorage[tokenId][_SRR][_ISSUER];
        metadataDigest = _stringStorage[tokenId][_SRR][_METADATA_DIGEST];
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
        return string(
            abi.encodePacked(
                _stringStorage[SRR_GLOBAL_SLOT][_SRR][_URI_PREFIX],
                _stringStorage[tokenId][_SRR][_METADATA_DIGEST]
            )
        );
    }

    /**
     * @dev Setter for uri prefix
     */
    function setURIPrefix(string memory _prefix)
        public
        onlyOwner
    {
        _stringStorage[SRR_GLOBAL_SLOT][_SRR][_URI_PREFIX] = _prefix;
    }


    /*
     * private functions
     */

    function _createSRR(
        bool isPrimaryIssuer,
        address artistAddress,
        string calldata metadataDigest,
        address sender,
        bool lockExternalTransfer
    ) private returns (uint256) {
        uint256 tokenId = _mint(sender, metadataDigest, artistAddress);
        _addressStorage[tokenId][_SRR][_ISSUER] = sender;
        _stringStorage[tokenId][_SRR][_METADATA_DIGEST] = metadataDigest;
        _boolStorage[tokenId][_SRR][_LOCK_EXTERNAL_TRANSFER] = lockExternalTransfer;
        require(
            _saveSRR(tokenId, isPrimaryIssuer, artistAddress),
            "fail to save Startrail Registry Record"
        );
        emit CreateSRR(
            tokenId,
            SRR(isPrimaryIssuer, artistAddress, sender),
            metadataDigest,
            lockExternalTransfer
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

    /**
     * @dev Generate a ERC721 token ID and mint for ERC721
     * @param sender address of the sender
     * @param metadataDigest metadataDigest for token
     * @return uint256 tokenId
     */
    function _mint(
        address sender,
        string calldata metadataDigest,
        address artistAddress
    ) private returns (uint256) {
        uint256 tokenId;
        tokenId = idGenerate(metadataDigest, artistAddress);
        ERC721UpgradeSafe._mint(sender, tokenId);
        return tokenId;
    }

    /**
     * @dev Transfers the ownership of a given token ID to another address.
     * Usage of this method is discouraged, use {safeTransferFrom} whenever possible.
     * Requires the msg.sender to be the owner, approved, or operator.
     * @param from current owner of the token
     * @param to address to receive the ownership of the given token ID
     * @param tokenId uint256 ID of the token to be transferred
     */
    function transferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public override {
        ERC721UpgradeSafe.transferFrom(from, to, tokenId);        
    }

    /**
     * @dev Safely transfers the ownership of a given token ID to another address
     * If the target address is a contract, it must implement {IERC721Receiver-onERC721Received},
     * which is called upon a safe transfer, and return the magic value
     * `bytes4(keccak256("onERC721Received(address,address,uint256,bytes)"))`; otherwise,
     * the transfer is reverted.
     * Requires the msg.sender to be the owner, approved, or operator
     * @param from current owner of the token
     * @param to address to receive the ownership of the given token ID
     * @param tokenId uint256 ID of the token to be transferred
     */
    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public override {
        safeTransferFrom(from, to, tokenId, "");
    }

    /**
     * @dev Safely transfers the ownership of a given token ID to another address
     * If the target address is a contract, it must implement {IERC721Receiver-onERC721Received},
     * which is called upon a safe transfer, and return the magic value
     * `bytes4(keccak256("onERC721Received(address,address,uint256,bytes)"))`; otherwise,
     * the transfer is reverted.
     * Requires the msg.sender to be the owner, approved, or operator
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
        ERC721UpgradeSafe.safeTransferFrom(from, to, tokenId, _data);
    }

    /**
     * @dev Approves another address to transfer the given token ID
     * The zero address indicates there is no approved address.
     * There can only be one approved address per token at a given time.
     * Can only be called by the token owner or an approved operator.
     * @param to address to be approved for the given token ID
     * @param tokenId uint256 ID of the token to be approved
     */
    function approve(address to, uint256 tokenId) public override {
        address owner_ = ownerOf(tokenId);
        require(to != owner_, "ERC721: approval to current owner");

        require(
            _msgSender() == owner_ || isApprovedForAll(owner_, _msgSender()),
            "ERC721: approve caller is not owner nor approved for all"
        );

        _approve(to, tokenId);
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
        onlyOwner
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
        public onlyOwner
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
            _addressStorage[SRR_GLOBAL_SLOT][_SRR][_OPENSEA_PROXY_ADDRESS] == operator
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
        onlyOwner
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
        onlyOwner
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
