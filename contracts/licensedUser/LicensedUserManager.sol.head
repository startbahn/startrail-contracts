// SPDX-License-Identifier: GPL-3.0-only

pragma solidity 0.8.28;

import "@openzeppelin/contracts/utils/Create2.sol";
import "@openzeppelin/contracts/proxy/beacon/BeaconProxy.sol";

import "../common/INameRegistry.sol";
import "./OwnerManager.sol";
import "./SignatureChecker.sol";

/**
 * @title LicensedUserManagerV02 - manages LicensedUser wallets v2.
 * @author Tomohiro Nakamura - <tomo@startbahn.jp>
 *
 * @dev A LicensedUser wallet is a single address controlled by one or more
 * owners. The owners registers with Startbahn as known and KYC'd entities.
 * 
 * Each wallet is allocated an Ethereum address which is computed with
 * create2. However no bytecode is stored at that address.
 *
 * This contract manages all LicensedUser wallets in Startrail with a level
 * of security equal to a proxy with bytecode. This is because the 
 * LicensedUserManager checks signatures are correct and n of m signature 
 * thresholds are reached before each transaction is sent. The same checks that
 * would be in place at a proxy with bytecode.
 *
 * This setup provides very cheap wallet creation (~110k gas) and transaction 
 * relaying.
 *
 * Ownership of Startrail Registry Record NFT tokens (SRRs) is bound to these 
 * LicensedUser wallet addresses and any transfers of ownership or 
 * modifications require signatures from the owners of the wallets.
 * The owners are in complete control of these wallets.
 *
 * If for some reason an independent contract is required. ie. a contract with
 * it's own bytecode, then a theoretical ejectWallet function can be called to
 * install bytecode (a tx proxy, LU management functions, etc.) and store state
 * (owner lists, LU names, etc.) at the wallet address. An example, commented
 * out implementation is provided and could be added by upgrade in the future.
 *
 * Wallets can be single owner or multiple owner and a single owner is upgraded 
 * to a multiple owner if a second owner is added. This separation was done to
 * make creation of single owner wallets as cheap as possible.
 */
contract LicensedUserManagerV02 is
  SignatureChecker,
  OwnerManager
{
  //
  // Types
  //

  enum UserType {HANDLER, ARTIST}

  struct LicensedUser {
    address owner;
    // Administrators/Governance can deactivate an LU wallet with the
    // 'active' flag:
    bool active;
    UserType userType;
    string englishName;
    string originalName;
  }

  // A separate struct here as DTO (Data-transfer-object) only.
  // This exists to workaround stack too deep errors.
  struct LicensedUserDto {
    address[] owners;
    uint8 threshold;
    UserType userType;
    string englishName;
    string originalName;
  }

  
  //
  // Events
  //

  event CreateLicensedUserWallet(
    address indexed walletAddress,
    address[] owners,
    uint8 threshold,
    string englishName,
    string originalName,
    UserType userType,
    bytes32 salt
  );

  event UpgradeLicensedUserWalletToMulti(
    address indexed walletAddress,
    address[] owners,
    uint8 threshold
  );

  event UpdateLicensedUserDetail(
    address indexed walletAddress,
    string key,
    string value
  );

  event MigrateLicensedUserWallet(
    address indexed walletAddress,
    string originChain,
    uint256 originTimestamp
  );

  //
  // Constants
  //

  // Valid signature check response (use EIP1271 style response)
  // Value is the function signature of isValidSignatureSet
  bytes4 internal constant IS_VALID_SIG_SUCCESS = 0x9878440b; 

  //
  // State
  //

  mapping(address => LicensedUser) internal luws;
  address public upgradeableBeacon;

  //
  // Modifiers
  //

  modifier onlyActiveWallet(address _wallet) {
    require(
      isActiveWallet(_wallet),
      "Wallet is inactive or does not exist"
    );
    _;
  }

  modifier isValidCreateWalletRequest(
    LicensedUserDto calldata _details,
    address _walletAddress
  ) {
    require(walletExists(_walletAddress) == false, "A wallet already exists for this address");
    require(_details.owners[0] != address(0), "Invalid owner address");
    require(isEmptyString(_details.englishName) == false, "englishName must not be empty");
    require(isEmptyString(_details.originalName) == false, "originalName must not be empty");
    _;
  }

  function initializeV2(
    address _upgradeableBeacon
  )
    external
    reinitializer(2)
  {
    upgradeableBeacon = _upgradeableBeacon;
  }

  //
  // Create Wallet Functions
  //

  /**
   * @dev Create LicensedUser wallet.
   * @param _details LicensedUserDto containing wallet details.
   * @param _salt Salt for the create2 address creation.
   * @return walletAddress Address of created wallet.
   */
  function createWallet(
    LicensedUserDto calldata _details,
    bytes32 _salt
  )
    public
    onlyAdministrator
    returns (address walletAddress)
  {
    bytes memory bytecode = abi.encodePacked(
      type(BeaconProxy).creationCode,
      abi.encode(
        upgradeableBeacon,
        abi.encodeWithSignature("initialize(address)", _details.owners[0])
      )
    );
    walletAddress = Create2.computeAddress(_salt, keccak256(bytecode));
    createWalletInternal(
      _details,
      walletAddress,
      _salt
    );
  }

  /**
   * @dev Create LicensedUser migrating legacy wallet with known address.
   * @param _details LicensedUserDto containing wallet details.
   * @param _walletAddress Known legacy wallet address.
   * @param _originChain Chain ID of chain created on.
   * @param _originTimestamp Time created on origin chain
   */
  function createWalletFromMigration(
    LicensedUserDto calldata _details,
    address _walletAddress,
    string calldata _originChain,
    uint256 _originTimestamp
  )
    public
    onlyAdministrator
  {
    createWalletInternal(
      _details,
      _walletAddress,
      0x0
    );
    emit MigrateLicensedUserWallet(
      _walletAddress,
      _originChain,
      _originTimestamp
    );
  }

  /**
   * @dev Create LicensedUser wallet
   * @param _details LicensedUserDto containing wallet details.
   * @param _walletAddress Address of wallet to create.
   */
  function createWalletInternal(
    LicensedUserDto calldata _details,
    address _walletAddress,
    bytes32 _salt
  ) 
    isValidCreateWalletRequest(
      _details,
      _walletAddress
    )
    private
  {
    bool singleOwner = _details.owners.length == 1;
    address owner = singleOwner ? _details.owners[0] : address(0x0);
    luws[_walletAddress] = LicensedUser(
      owner,
      true, // active
      _details.userType,
      _details.englishName,
      _details.originalName
    );
    
    if (!singleOwner) {
        setupOwners(_walletAddress, _details.owners, _details.threshold);
    }

    emitCreateLicensedUserWallet(_walletAddress, _salt);
  }

  /*
   * use a separate function to workaround "stack too deep"
   */
  function emitCreateLicensedUserWallet(address _walletAddress, bytes32 _salt)
    private
  {
    LicensedUser storage luw = luws[_walletAddress];
    emit CreateLicensedUserWallet(
      _walletAddress,
      getOwners(_walletAddress),
      getThreshold(_walletAddress),
      luw.englishName,
      luw.originalName,
      luw.userType,
      _salt
    );
  }


  //
  // Signature validation
  //

  /**
   * @dev Given a LUW address, a hash and list of signatures of the hash, 
   *      verify the signatures and check the number of signatures is >= 
          the wallet threshold. REVERTs if not valid.
   * @param _walletAddress Address of wallet to create.
   * @param _hash Hash signed by the signatures.
   * @param _signatures List of signatures of the hash in a flattened and
   *      concatenated form.
   * @return success Success or failure
   */
  function isValidSignatureSet(
    address _walletAddress,
    bytes32 _hash,
    bytes calldata _signatures
  )
    external
    view
    onlyActiveWallet(_walletAddress)
    returns (bytes4)
  {
    if (isSingleOwner(_walletAddress)) {
      uint8 v;
      bytes32 r;
      bytes32 s;
      (v, r, s) = signatureSplit(_signatures, 0);
      
      require(
        ecrecover(_hash, v, r, s) == luws[_walletAddress].owner,
        "Signer in signatures is not an owner of this wallet"
      );
    } else {
      checkSignatures(
        wallets[_walletAddress].owners,
        wallets[_walletAddress].threshold,
        _hash,
        _signatures
      );
    }

    return IS_VALID_SIG_SUCCESS;
  }

  //
  // OwnerManager overrides - handle the single / multi owner storage
  // gas optimization.
  //

  /**
   * When isSingleOwner is false simply call OwnerManager.addOwner.
   * When isSingleOwner is true upgrade the wallet to multi owner storage with
   * singleToMulti.
   * 
   * NOTE: use 'at inheritdoc OwnerManager' here once upgraded to Solidity >= 0.6.12
   */
  function addOwner(
    address _walletAddress,
    address _owner,
    uint8 _threshold
  )
    public
    override
    onlyActiveWallet(_walletAddress)
    onlyWalletOrAdministrator(_walletAddress)
  {
    if (isSingleOwner(_walletAddress)) {
      address[] memory owners = new address[](2);
      owners[0] = luws[_walletAddress].owner;
      owners[1] = _owner;
      singleToMulti(_walletAddress, owners, _threshold);
    } else {
      super.addOwner(_walletAddress, _owner, _threshold);
    }
  }


  //
  // Get, Set and Check functions
  //

  function walletExists(address _walletAddress)
    public
    view
    returns (bool)
  {
    return isEmptyString(luws[_walletAddress].originalName) == false;
  }

  function isSingleOwner(address _walletAddress)
    public
    view
    returns (bool)
  {
    return luws[_walletAddress].owner != address(0x0);
  }

  function isActiveWallet(address _walletAddress)
    public
    view
    returns (bool)
  {
    return luws[_walletAddress].active;
  }

  function getLicensedUser(address _walletAddress)
    public
    view
    returns (
      address[] memory owners,
      uint8 threshold,
      bool active,
      UserType userType,
      string memory englishName,
      string memory originalName
    )
  {
    if (walletExists(_walletAddress)) {
      LicensedUser storage wallet = luws[_walletAddress];
      owners = getOwners(_walletAddress);
      threshold = getThreshold(_walletAddress);
      active = wallet.active;
      userType = wallet.userType;
      englishName = wallet.englishName;
      originalName = wallet.originalName;
    }
  }

  function getThreshold(address _walletAddress)
    public
    override
    view
    returns (uint8)
  {
    return isSingleOwner(_walletAddress) ? 
      1 :
      super.getThreshold(_walletAddress);
  }

  function getOwners(address _walletAddress)
    public
    override
    view
    returns (address[] memory owners)
  {
    if (isSingleOwner(_walletAddress)) {
      owners = new address[](1);
      owners[0] = luws[_walletAddress].owner;
    } else {
      owners = super.getOwners(_walletAddress);
    }
  }

  function isOwner(address _walletAddress, address _owner)
    public
    override
    view
    returns (bool)
  {
    return isSingleOwner(_walletAddress) ?
      luws[_walletAddress].owner == _owner : 
      super.isOwner(_walletAddress, _owner);
  }

  function setOriginalName(address _walletAddress, string calldata _name)
    public
    onlyWalletOrAdministrator(_walletAddress)
    onlyActiveWallet(_walletAddress)
  {
    require(isEmptyString(_name) == false, "originalName must not be empty");
    luws[_walletAddress].originalName = _name;
    emit UpdateLicensedUserDetail(_walletAddress, "originalName", _name);
  }

  function setEnglishName(address _walletAddress, string calldata _name)
    public
    onlyWalletOrAdministrator(_walletAddress)
    onlyActiveWallet(_walletAddress)
  {
    require(isEmptyString(_name) == false, "englishName must not be empty");
    luws[_walletAddress].englishName = _name;
    emit UpdateLicensedUserDetail(_walletAddress, "englishName", _name);
  }


  //
  // Convert Wallet functions
  //

  /**
   * @dev Convert a single user LicensedUser to a multi user LicensedUser.
  *  This shifts storage of ownership details to the OwnerManager contract.
   * @param _walletAddress LicensedUser wallet address.
   * @param _owners List of signers.
   * @param _threshold Number of signatures required to confirm a transaction.
   */
  function singleToMulti(
    address _walletAddress,
    address[] memory _owners,
    uint8 _threshold
  )
    private
  {
    LicensedUser storage luw = luws[_walletAddress];
    luw.owner = address(0x0);
    setupOwners(_walletAddress, _owners, _threshold);
    emit UpgradeLicensedUserWalletToMulti(_walletAddress, _owners, _threshold);
  }


  /**
   * NOTE: this commented out function demonstrates the possibility of
   *       ejecting a LicensedUserManager wallet to it's own address.
   *
   *       At this stage there is no reason to do this however we leave
   *       leave this here as a possibility in a future release - an
   *       upgraded version of this contract could provide the code for
   *       this function.
   *
   *       If this feature is required ensure that the new version of this
   *       contract imports the EXACT version of WalletProxyMimnimal used by
   *       the first deployed version of this contract. This is essential to
   *       ensure the create2 addresses are the same. One difference is the
   *       SPDX license header should be changed back to UNLICENSED. Another
   *       will be the compiler version should go back to the original 0.6.11.
   *       These properties impact the deployedBytecode because a hash of
   *       contract metadata is included and that metadata includes these
   *       properties.
   *
   * "Eject" a wallet from this LicensedUser to it's own smart contract.
   *
   * Installs bytecode at the wallet address so transactions can be sent
   * directly to the wallet address instead of through this manager.
  *
   * Creates a contract at the _wallet address and migrates existing
   * ownership information and contract metadata to that new instance.
   */

  /*
    function ejectWallet(
        address _wallet,
        bytes32 _salt // resend the salt - alternatively it's stored at create time above
    )
        public
        // onlyWallet
    {
        // require: create2 with _salt still resolves to _wallet address

        // create the wallet at _wallet address:

        wallet = new WalletProxyMinimal{salt: salt}();
        wallet.initialize(wallets[_wallet]);

        wallets[_wallet].isExternal = true // or something like that
    }
    */

}
