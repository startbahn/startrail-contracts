// SPDX-License-Identifier: GPL-3.0-only

pragma solidity 0.8.28;

import "@openzeppelin/contracts/utils/Create2.sol";
import "@openzeppelin/contracts/proxy/beacon/BeaconProxy.sol";

import "../common/INameRegistry.sol";
import "./OwnerManagerV02.sol";
import "./SignatureChecker.sol";

/**
 * @title LicensedUserManagerV03 - manages LicensedUser wallets v3.
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
contract LicensedUserManagerV03 is SignatureChecker, OwnerManagerV02 {
    //
    // Types
    //

    enum UserType {
        HANDLER,
        ARTIST
    }

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
    // Errors
    //

    error UnexpectedWalletAddress(address computed, address deployed);
    error InvalidEntryPoint();
    error UnexistentWallet(address walletAddress);

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

    event DeployLicensedUserWallet(address indexed walletAddress, bytes32 salt);
    event DeployLicensedUserWallet(
        address indexed walletAddress,
        bytes32 salt,
        address aliasAddressFrom
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
    address public entryPoint;
    mapping(address => address) internal aliases; // old address to new one
    mapping(address => address) internal aliasesBackward; // opposite of aliases

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

    function initializeV3(
        address _upgradeableBeacon,
        address _entryPoint
    ) external reinitializer(3) {
        upgradeableBeacon = _upgradeableBeacon;
        entryPoint = _entryPoint;
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
    ) public onlyAdministrator returns (address walletAddress) {
        walletAddress = Create2.computeAddress(_salt, walletInitCodeHash());

        isValidCreateWalletRequest(_details, walletAddress);

        bool singleOwner = _details.owners.length == 1;
        address owner = singleOwner ? _details.owners[0] : address(0x0);
        luws[walletAddress] = LicensedUser(
            owner,
            true, // active
            _details.userType,
            _details.englishName,
            _details.originalName
        );

        if (!singleOwner) {
            setupOwners(walletAddress, _details.owners, _details.threshold);
        }

        emitCreateLicensedUserWallet(walletAddress, _salt);
    }

    function isValidCreateWalletRequest(
        LicensedUserDto calldata _details,
        address _walletAddress
    ) private view {
        require(
            walletExists(_walletAddress) == false,
            "A wallet already exists for this address"
        );
        require(_details.owners[0] != address(0), "Invalid owner address");
        require(
            isEmptyString(_details.englishName) == false,
            "englishName must not be empty"
        );
        require(
            isEmptyString(_details.originalName) == false,
            "originalName must not be empty"
        );
    }

    /*
     * use a separate function to workaround "stack too deep"
     */
    function emitCreateLicensedUserWallet(
        address _walletAddress,
        bytes32 _salt
    ) private {
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
    ) external view onlyActiveWallet(_walletAddress) returns (bytes4) {
        address walletAddress = walletAddressGivenAlias(_walletAddress);
        if (isSingleOwner(walletAddress)) {
            uint8 v;
            bytes32 r;
            bytes32 s;
            (v, r, s) = signatureSplit(_signatures, 0);

            require(
                ecrecover(_hash, v, r, s) == luws[walletAddress].owner,
                "Signer in signatures is not an owner of this wallet"
            );
        } else {
            checkSignatures(
                wallets[walletAddress].owners,
                wallets[walletAddress].threshold,
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

    function walletExists(address _walletAddress) public view returns (bool) {
        return isEmptyString(luws[_walletAddress].originalName) == false;
    }

    /**
     * @return If the wallet exists, return the wallet address. If it's outdated and has an alias, return the alias address. Otherwise, returns 0x0.
     */
    function walletAddressGivenAlias(
        address _walletAddress
    ) public view returns (address) {
        return
            walletExists(_walletAddress)
                ? _walletAddress
                : aliases[_walletAddress];
    }

    /**
     * @return return the address of the wallet that was aliased from the given address.
     */
    function walletAddressAliasBackward(
        address _walletAddress
    ) public view returns (address) {
        return aliasesBackward[_walletAddress];
    }

    function isSingleOwner(address _walletAddress) public view returns (bool) {
        address walletAddress = walletAddressGivenAlias(_walletAddress);
        return luws[walletAddress].owner != address(0x0);
    }

    function isActiveWallet(address _walletAddress) public view returns (bool) {
        address walletAddress = walletAddressGivenAlias(_walletAddress);
        return luws[walletAddress].active;
    }

    function getLicensedUser(
        address _walletAddress
    )
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
        address walletAddress = walletAddressGivenAlias(_walletAddress);
        if (walletAddress == address(0)) {
            revert UnexistentWallet(_walletAddress);
        } else {
            LicensedUser storage wallet = luws[walletAddress];
            owners = getOwners(walletAddress);
            threshold = getThreshold(walletAddress);
            active = wallet.active;
            userType = wallet.userType;
            englishName = wallet.englishName;
            originalName = wallet.originalName;
        }
    }

    function getThreshold(
        address _walletAddress
    ) public view override returns (uint8) {
        address walletAddress = walletAddressGivenAlias(_walletAddress);
        if (walletAddress == address(0)) {
            revert UnexistentWallet(_walletAddress);
        }
        return
            isSingleOwner(walletAddress)
                ? 1
                : super.getThreshold(walletAddress);
    }

    function getOwners(
        address _walletAddress
    ) public view override returns (address[] memory owners) {
        address walletAddress = walletAddressGivenAlias(_walletAddress);
        if (walletAddress == address(0)) {
            revert UnexistentWallet(_walletAddress);
        }
        if (isSingleOwner(walletAddress)) {
            owners = new address[](1);
            owners[0] = luws[walletAddress].owner;
        } else {
            owners = super.getOwners(walletAddress);
        }
    }

    function isOwner(
        address _walletAddress,
        address _owner
    ) public view override returns (bool) {
        address walletAddress = walletAddressGivenAlias(_walletAddress);
        if (walletAddress == address(0)) {
            revert UnexistentWallet(_walletAddress);
        }
        return
            isSingleOwner(walletAddress)
                ? luws[walletAddress].owner == _owner
                : super.isOwner(walletAddress, _owner);
    }

    function setOriginalName(
        address _walletAddress,
        string calldata _name
    )
        public
        onlyWalletOrAdministrator(_walletAddress)
        onlyActiveWallet(_walletAddress)
    {
        address walletAddress = walletAddressGivenAlias(_walletAddress);
        require(
            isEmptyString(_name) == false,
            "originalName must not be empty"
        );
        luws[walletAddress].originalName = _name;
        emit UpdateLicensedUserDetail(walletAddress, "originalName", _name);
    }

    function setEnglishName(
        address _walletAddress,
        string calldata _name
    )
        public
        onlyWalletOrAdministrator(_walletAddress)
        onlyActiveWallet(_walletAddress)
    {
        address walletAddress = walletAddressGivenAlias(_walletAddress);
        require(isEmptyString(_name) == false, "englishName must not be empty");
        luws[walletAddress].englishName = _name;
        emit UpdateLicensedUserDetail(walletAddress, "englishName", _name);
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
    ) private {
        LicensedUser storage luw = luws[_walletAddress];
        luw.owner = address(0x0);
        setupOwners(_walletAddress, _owners, _threshold);
        emit UpgradeLicensedUserWalletToMulti(
            _walletAddress,
            _owners,
            _threshold
        );
    }

    /*
     * @dev It is strongly preferred to use the same salt for the wallet creation and the deployment.
     * If it is different, as salt is part of the address computation,
     * it will change and unnecessary migration will be triggered.
     */
    function deploy(
        bytes32 salt,
        address aliasAddressFrom
    )
        public
        onlyAdministrator
        onlyActiveWallet(aliasAddressFrom)
        returns (address accountAddress)
    {
        bytes memory bytecode = _walletInitCode();
        accountAddress = Create2.deploy(0, salt, bytecode);

        aliases[aliasAddressFrom] = accountAddress;
        aliasesBackward[accountAddress] = aliasAddressFrom;
        if (aliasAddressFrom == accountAddress) {
            emit DeployLicensedUserWallet(accountAddress, salt);
        } else {
            // Migrate storage entries from the old key to the new key
            _migrateWalletStorage(aliasAddressFrom, accountAddress);

            emit DeployLicensedUserWallet(
                accountAddress,
                salt,
                aliasAddressFrom
            );
        }
    }

    function createAndDeploy(
        LicensedUserDto calldata details,
        bytes32 salt
    ) public onlyAdministrator returns (address accountAddress) {
        address computedAddress = createWallet(details, salt);

        bytes memory bytecode = _walletInitCode();
        accountAddress = Create2.deploy(0, salt, bytecode);
        if (accountAddress != computedAddress) {
            revert UnexpectedWalletAddress(computedAddress, accountAddress);
        }
        emit DeployLicensedUserWallet(accountAddress, salt);
    }

    function setEntryPoint(address _entryPoint) external onlyAdministrator {
        if (_entryPoint == address(0)) {
            revert InvalidEntryPoint();
        }
        entryPoint = _entryPoint;
    }

    function walletInitCodeHash() public view returns (bytes32) {
        return keccak256(_walletInitCode());
    }

    function _walletInitCode() internal view returns (bytes memory) {
        return
            abi.encodePacked(
                type(BeaconProxy).creationCode,
                abi.encode(
                    upgradeableBeacon,
                    abi.encodeWithSignature(
                        "initialize(address)",
                        address(this)
                    )
                )
            );
    }

    /**
     * @dev Migrate LUW details and ownership storage from an old key to a new key.
     *      - Moves `luws[from]` to `luws[to]` and clears the old entry.
     *      - Rebuilds OwnerManager ownership list at `to` if multi-owner, and clears the old list.
     */
    function _migrateWalletStorage(address from, address to) internal {
        if (from == address(0) || to == address(0) || from == to) {
            return;
        }

        // If there is no wallet data at the old key, nothing to migrate
        if (!walletExists(from)) {
            return;
        }

        // Ensure we don't overwrite an existing wallet at the new key
        require(walletExists(to) == false, "Destination wallet already exists");

        // Copy LicensedUser details
        LicensedUser memory oldLuw = luws[from];
        luws[to] = oldLuw;
        delete luws[from];

        // If single owner, owner is stored in LUW struct and nothing in OwnerManager mapping
        bool wasSingleOwner = oldLuw.owner != address(0);
        if (wasSingleOwner) {
            return;
        }

        // Multi-owner: rebuild owners list at the new key and clear the old key
        address[] memory owners = super.getOwners(from);
        uint8 threshold = super.getThreshold(from);
        if (owners.length > 0) {
            // Initialize at the new key
            setupOwners(to, owners, threshold);

            // Clear the old key's owner list and metadata using base helper
            _deleteWallet(from);
        }
    }
}
