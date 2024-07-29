// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.21;

import "../proxy/utils/InitializableWithGap.sol";
import "../common/INameRegistry.sol";
import "../metaTx/eip2771/EIP2771BaseRecipient.sol";

/**
 * @title OwnerManager - Manages a set of owners and a threshold to perform actions.
 * @author Stefan George - <stefan@gnosis.pm>
 * @author Richard Meissner - <richard@gnosis.pm>
 * @dev Adapted from GnosisSafe codebase OwnerManager.sol.
 *
 * Modified:
 *  - support multiple wallets in the one contract (wallet param added to
 *    events and functions)
 *  - support wallet modifying it's own properties (eg. ownerlist, threshold)
 *    using new onlyWallet modifier (replaces SelfAuthorized.sol check)
 *  - use EIP2771 to receive calls from a Forwarder contract
 */
contract OwnerManager is InitializableWithGap, EIP2771BaseRecipient {

  event AddedOwner(address indexed wallet, address owner);
  event RemovedOwner(address indexed wallet, address owner);
  event ChangedThreshold(address indexed wallet, uint8 threshold);

  address internal constant SENTINEL_OWNERS = address(0x1);

  struct Wallet {
    mapping(address => address) owners; // owner => next owner
    uint8 ownerCount;
    uint8 threshold;
  }

  //
  // State
  //

  mapping(address => Wallet) internal wallets;

  address public nameRegistryAddress;

  //
  // Modifiers
  //

  modifier onlyAdministrator() {
      require(
          isFromAdministrator(),
          "Caller is not the Startrail Administrator"
      );
      _;
  }

  /**
   * @dev onlyWallet calls must be forwarded from this wallet contract itself.
   * They must also be from the given wallet address _wallet.
   */
  modifier onlyWallet(address _wallet) {
    string memory errorMsg = isFromWallet(_wallet);
    require(isEmptyString(errorMsg), errorMsg);
    _;
  }

  /**
   * @dev Call must be from either the Administrator OR the given LUW.
   *      (STARTRAIL-798)
   */
  modifier onlyWalletOrAdministrator(address _wallet) {
    // If it's not the administrator then it must be a forwarded LUW
    if (isFromAdministrator() == false) {
      // NOTE: the following line duplicates a check inside isFromWallet but
      //       it's checked here in order to display an appropriate error 
      //       message that includes "or admin"
      // NOTE: eventually the admin privilege will be removed or replaced by 
      //       a governance contract privilege
      require(
        isTrustedForwarder(msg.sender), 
        "Wallet function can only be called from trusted forwarder or admin"
      );

      // Now verify the forwarded LU request
      string memory errorMsg = isFromWallet(_wallet);
      require(isEmptyString(errorMsg), errorMsg);
    }
    _;
  }

  //
  // Functions
  //

  /**
   * @dev Determine if the caller is the administrator wallet
   */
  function isFromAdministrator() internal view returns (bool) {
    return INameRegistry(nameRegistryAddress).administrator() == msg.sender;
  }

  /**
   * @dev Determine if the call is from forwarder with a the given LicensedUser
   *      EIP2771 forwarded.
   *
   * The caller must be the trusted forwarding contract and the given wallet
   * address must be the last bytes of the call data (an EIP2771 forward).
   *
   * @return "" if valid call with _wallet or "<specific error message>" if not
   *   a valid call with _wallet
   */
  function isFromWallet(address _wallet)
    internal
    view
    returns (string memory)
  {
    if (isTrustedForwarder(msg.sender) == false) {
      return "Wallet function can only be called from the trusted forwarder";
    }

    if (msg.data.length < 24) {
      return "Wallet address must be appended to calldata (EIP2771 forward)";
    }

    // At this point we know that the sender is the Forwarder,
    // So we trust that the last bytes of msg.data are the verified
    // wallet address.
    // Extract sender address from the end of msg.data
    address sendingWallet;
    assembly {
      sendingWallet := shr( // shr = logical shift right operation
        96, calldataload(sub(calldatasize(), 20))
      )
    }

    if (sendingWallet != _wallet) {
      return "Sending wallet attempted to modify a different wallet";
    }

    return "";
  }

  /**
   * @dev Initilize the contract
   */
  function initialize(
    address _nameRegistryAddress,
    address _trustedForwarder
  )
    external
    initializer
  {
    nameRegistryAddress = _nameRegistryAddress;
    _setTrustedForwarder(_trustedForwarder);
  }

  /**
   * @dev Setup function sets initial storage of contract.
   * @param _wallet Wallet address.
   * @param _owners List of Wallet owners.
   * @param _threshold Number of required confirmations for a Wallet transaction.
   */
  function setupOwners(
    address _wallet,
    address[] memory _owners,
    uint8 _threshold
  ) internal {
    Wallet storage wallet = wallets[_wallet];

    // Threshold can only be 0 at initialization.
    // Check ensures that setup function can only be called once.
    require(wallet.threshold == 0, "Owners have already been setup");

    // Validate that threshold is smaller than number of added owners.
    require(
      _threshold <= _owners.length,
      "Threshold cannot exceed owner count"
    );

    // There has to be at least one Wallet owner.
    require(_threshold >= 1, "Threshold needs to be greater than 0");

    // Initializing Wallet owners.
    address currentOwner = SENTINEL_OWNERS;
    for (uint256 i = 0; i < _owners.length; i++) {
      // Owner address cannot be null.
      address owner = _owners[i];
      require(
        owner != address(0) && owner != SENTINEL_OWNERS,
        "Invalid owner address provided"
      );

      // No duplicate owners allowed.
      require(
        wallet.owners[owner] == address(0),
        "Duplicate owner address provided"
      );

      wallet.owners[currentOwner] = owner;
      currentOwner = owner;
    }

    wallet.owners[currentOwner] = SENTINEL_OWNERS;
    wallet.ownerCount = uint8(_owners.length);
    wallet.threshold = _threshold;
  }

  /**
   * @dev Allows to add a new owner to the Wallet and update the threshold at the same time.
   *      This can only be done via a Wallet transaction.
   * @notice Adds the owner `owner` to the Wallet and updates the threshold to `_threshold`.
   * @param _wallet Wallet address.
   * @param _owner New owner address.
   * @param _threshold New threshold.
   */
  function addOwner(
    address _wallet,
    address _owner,
    uint8 _threshold
  )
    public
    virtual
    onlyWalletOrAdministrator(_wallet)
  {
    // Owner address cannot be null.
    require(
      _owner != address(0) && _owner != SENTINEL_OWNERS,
      "Invalid owner address provided"
    );

    Wallet storage wallet = wallets[_wallet];

    // No duplicate owners allowed.
    require(
      wallet.owners[_owner] == address(0),
      "Address is already an owner"
    );

    wallet.owners[_owner] = wallet.owners[SENTINEL_OWNERS];
    wallet.owners[SENTINEL_OWNERS] = _owner;
    wallet.ownerCount++;
    emit AddedOwner(_wallet, _owner);

    // Change threshold if threshold was changed.
    if (wallet.threshold != _threshold) {
      changeThreshold(_wallet, _threshold);
    }
  }

  /**
   * @dev Allows to remove an owner from the Wallet and update the threshold at the same time.
   *      This can only be done via a Wallet transaction.
   * @notice Removes the owner `owner` from the Wallet and updates the threshold to `_threshold`.
   * @param _wallet Wallet address.
   * @param _prevOwner Owner that pointed to the owner to be removed in the linked list
   * @param _owner Owner address to be removed.
   * @param _threshold New threshold.
   */
  function removeOwner(
    address _wallet,
    address _prevOwner,
    address _owner,
    uint8 _threshold
  ) public onlyWalletOrAdministrator(_wallet) {
    Wallet storage wallet = wallets[_wallet];

    // Only allow to remove an owner, if threshold can still be reached.
    require(
      wallet.ownerCount - 1 >= _threshold,
      "New owner count needs to be larger than new threshold"
    );

    // Reject zero or sentinal owner address
    require(
      _owner != address(0) && _owner != SENTINEL_OWNERS,
      "Invalid owner address provided"
    );

    // Validate owner address and check that it corresponds to owner index.
    require(
      wallet.owners[_prevOwner] == _owner,
      "Invalid prevOwner, owner pair provided"
    );

    wallet.owners[_prevOwner] = wallet.owners[_owner];
    wallet.owners[_owner] = address(0);
    wallet.ownerCount--;
    emit RemovedOwner(_wallet, _owner);

    // Change threshold if threshold was changed.
    if (wallet.threshold != _threshold) {
      changeThreshold(_wallet, _threshold);
    }
  }

  /**
   * @dev Allows to swap/replace an owner from the Wallet with another address.
   *      This can only be done via a Wallet transaction.
   * @notice Replaces the owner `oldOwner` in the Wallet with `newOwner`.
   * @param _wallet Wallet address.
   * @param _prevOwner Owner that pointed to the owner to be replaced in the linked list
   * @param _oldOwner Owner address to be replaced.
   * @param _newOwner New owner address.
   */
  function swapOwner(
    address _wallet,
    address _prevOwner,
    address _oldOwner,
    address _newOwner
  ) public onlyWalletOrAdministrator(_wallet) {
    // Owner address cannot be null.
    require(
      _newOwner != address(0) && _newOwner != SENTINEL_OWNERS,
      "Invalid owner address provided"
    );

    Wallet storage wallet = wallets[_wallet];

    // No duplicate owners allowed.
    require(
      wallet.owners[_newOwner] == address(0),
      "Address is already an owner"
    );

    // Validate oldOwner address and check that it corresponds to owner index.
    require(
      _oldOwner != address(0) && _oldOwner != SENTINEL_OWNERS,
      "Invalid owner address provided"
    );
    require(
      wallet.owners[_prevOwner] == _oldOwner,
      "Invalid _prevOwner, owner pair provided"
    );

    wallet.owners[_newOwner] = wallet.owners[_oldOwner];
    wallet.owners[_prevOwner] = _newOwner;
    wallet.owners[_oldOwner] = address(0);

    emit RemovedOwner(_wallet, _oldOwner);
    emit AddedOwner(_wallet, _newOwner);
  }

  /**
   * @dev Allows to update the number of required confirmations by Wallet owners.
   *      This can only be done via a Wallet transaction.
   * @notice Changes the threshold of the Wallet to `_threshold`.
   * @param _wallet Wallet address.
   * @param _threshold New threshold.
   */
  function changeThreshold(address _wallet, uint8 _threshold)
    public
    onlyWalletOrAdministrator(_wallet)
  {
    Wallet storage wallet = wallets[_wallet];

    // Validate that threshold is smaller than number of owners.
    require(
      _threshold <= wallet.ownerCount,
      "Threshold cannot exceed owner count"
    );

    // There has to be at least one Wallet owner.
    require(_threshold >= 1, "Threshold needs to be greater than 0");

    wallet.threshold = _threshold;

    emit ChangedThreshold(_wallet, _threshold);
  }

  function getThreshold(address _wallet)
    public
    virtual
    view
    returns (uint8)
  {
    return wallets[_wallet].threshold;
  }

  function isOwner(address _wallet, address _owner)
    public
    virtual
    view
    returns (bool)
  {
    return _owner != SENTINEL_OWNERS && 
      wallets[_wallet].owners[_owner] != address(0);
  }

  /**
   * @dev Returns array of owners.
   * @param _wallet Wallet address.
   * @return Array of Wallet owners.
   */
  function getOwners(address _wallet)
    public
    virtual
    view
    returns (address[] memory)
  {
    Wallet storage wallet = wallets[_wallet];

    address[] memory owners = new address[](wallet.ownerCount);

    uint256 index = 0;
    address currentOwner = wallet.owners[SENTINEL_OWNERS];
    while (currentOwner != SENTINEL_OWNERS) {
      owners[index] = currentOwner;
      currentOwner = wallet.owners[currentOwner];
      index++;
    }
    return owners;
  }

  function isEmptyString(string memory _string) internal pure returns (bool) {
    return bytes(_string).length == 0;
  }

}
