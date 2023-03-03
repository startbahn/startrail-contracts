# LicensedUserManager

*Chris Hatch - &lt;chris.hatch@startbahn.jp&gt;*

> LicensedUserManager - manages LicensedUser wallets.



*A LicensedUser wallet is a single address controlled by one or more owners. The owners registers with Startbahn as known and KYC&#39;d entities.  Each wallet is allocated an Ethereum address which is computed with create2. However no bytecode is stored at that address. This contract manages all LicensedUser wallets in Startrail with a level of security equal to a proxy with bytecode. This is because the  LicensedUserManager checks signatures are correct and n of m signature  thresholds are reached before each transaction is sent. The same checks that would be in place at a proxy with bytecode. This setup provides very cheap wallet creation (~110k gas) and transaction  relaying. Ownership of Startrail Registry Record NFT tokens (SRRs) is bound to these  LicensedUser wallet addresses and any transfers of ownership or  modifications require signatures from the owners of the wallets. The owners are in complete control of these wallets. If for some reason an independent contract is required. ie. a contract with it&#39;s own bytecode, then a theoretical ejectWallet function can be called to install bytecode (a tx proxy, LU management functions, etc.) and store state (owner lists, LU names, etc.) at the wallet address. An example, commented out implementation is provided and could be added by upgrade in the future. Wallets can be single owner or multiple owner and a single owner is upgraded  to a multiple owner if a second owner is added. This separation was done to make creation of single owner wallets as cheap as possible.*

## Methods

### PROXY_CODEHASH

```solidity
function PROXY_CODEHASH() external view returns (bytes32)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bytes32 | undefined |

### addOwner

```solidity
function addOwner(address _walletAddress, address _owner, uint8 _threshold) external nonpayable
```

When isSingleOwner is false simply call OwnerManager.addOwner. When isSingleOwner is true upgrade the wallet to multi owner storage with singleToMulti.  NOTE: use &#39;at inheritdoc OwnerManager&#39; here once upgraded to Solidity &gt;= 0.6.12



#### Parameters

| Name | Type | Description |
|---|---|---|
| _walletAddress | address | undefined |
| _owner | address | undefined |
| _threshold | uint8 | undefined |

### changeThreshold

```solidity
function changeThreshold(address _wallet, uint8 _threshold) external nonpayable
```

Changes the threshold of the Wallet to `_threshold`.

*Allows to update the number of required confirmations by Wallet owners.      This can only be done via a Wallet transaction.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _wallet | address | Wallet address. |
| _threshold | uint8 | New threshold. |

### createWallet

```solidity
function createWallet(LicensedUserManager.LicensedUserDto _details, bytes32 _salt) external nonpayable returns (address walletAddress)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| _details | LicensedUserManager.LicensedUserDto | undefined |
| _salt | bytes32 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| walletAddress | address | undefined |

### createWalletFromMigration

```solidity
function createWalletFromMigration(LicensedUserManager.LicensedUserDto _details, address _walletAddress, string _originChain, uint256 _originTimestamp) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| _details | LicensedUserManager.LicensedUserDto | undefined |
| _walletAddress | address | undefined |
| _originChain | string | undefined |
| _originTimestamp | uint256 | undefined |

### getLicensedUser

```solidity
function getLicensedUser(address _walletAddress) external view returns (address[] owners, uint8 threshold, bool active, enum LicensedUserManager.UserType userType, string englishName, string originalName)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| _walletAddress | address | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| owners | address[] | undefined |
| threshold | uint8 | undefined |
| active | bool | undefined |
| userType | enum LicensedUserManager.UserType | undefined |
| englishName | string | undefined |
| originalName | string | undefined |

### getOwners

```solidity
function getOwners(address _walletAddress) external view returns (address[] owners)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| _walletAddress | address | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| owners | address[] | undefined |

### getThreshold

```solidity
function getThreshold(address _walletAddress) external view returns (uint8)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| _walletAddress | address | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint8 | undefined |

### getTrustedForwarder

```solidity
function getTrustedForwarder() external view returns (address trustedForwarder)
```



*return address of the trusted forwarder.*


#### Returns

| Name | Type | Description |
|---|---|---|
| trustedForwarder | address | undefined |

### initialize

```solidity
function initialize(address _nameRegistryAddress, address _trustedForwarder) external nonpayable
```



*Initilize the contract*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _nameRegistryAddress | address | undefined |
| _trustedForwarder | address | undefined |

### isActiveWallet

```solidity
function isActiveWallet(address _walletAddress) external view returns (bool)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| _walletAddress | address | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | undefined |

### isOwner

```solidity
function isOwner(address _walletAddress, address _owner) external view returns (bool)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| _walletAddress | address | undefined |
| _owner | address | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | undefined |

### isSingleOwner

```solidity
function isSingleOwner(address _walletAddress) external view returns (bool)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| _walletAddress | address | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | undefined |

### isTrustedForwarder

```solidity
function isTrustedForwarder(address forwarder) external view returns (bool)
```



*return if the forwarder is trusted to forward relayed transactions to us. the forwarder is required to verify the sender&#39;s signature, and verify the call is not a replay.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| forwarder | address | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | undefined |

### isValidSignatureSet

```solidity
function isValidSignatureSet(address _walletAddress, bytes32 _hash, bytes _signatures) external view returns (bytes4)
```



*Given a LUW address, a hash and list of signatures of the hash,       verify the signatures and check the number of signatures is &gt;=  the wallet threshold. REVERTs if not valid.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _walletAddress | address | Address of wallet to create. |
| _hash | bytes32 | Hash signed by the signatures. |
| _signatures | bytes | List of signatures of the hash in a flattened and      concatenated form. |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bytes4 | success Success or failure |

### nameRegistryAddress

```solidity
function nameRegistryAddress() external view returns (address)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined |

### removeOwner

```solidity
function removeOwner(address _wallet, address _prevOwner, address _owner, uint8 _threshold) external nonpayable
```

Removes the owner `owner` from the Wallet and updates the threshold to `_threshold`.

*Allows to remove an owner from the Wallet and update the threshold at the same time.      This can only be done via a Wallet transaction.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _wallet | address | Wallet address. |
| _prevOwner | address | Owner that pointed to the owner to be removed in the linked list |
| _owner | address | Owner address to be removed. |
| _threshold | uint8 | New threshold. |

### setEnglishName

```solidity
function setEnglishName(address _walletAddress, string _name) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| _walletAddress | address | undefined |
| _name | string | undefined |

### setOriginalName

```solidity
function setOriginalName(address _walletAddress, string _name) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| _walletAddress | address | undefined |
| _name | string | undefined |

### swapOwner

```solidity
function swapOwner(address _wallet, address _prevOwner, address _oldOwner, address _newOwner) external nonpayable
```

Replaces the owner `oldOwner` in the Wallet with `newOwner`.

*Allows to swap/replace an owner from the Wallet with another address.      This can only be done via a Wallet transaction.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _wallet | address | Wallet address. |
| _prevOwner | address | Owner that pointed to the owner to be replaced in the linked list |
| _oldOwner | address | Owner address to be replaced. |
| _newOwner | address | New owner address. |

### walletExists

```solidity
function walletExists(address _walletAddress) external view returns (bool)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| _walletAddress | address | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | undefined |



## Events

### AddedOwner

```solidity
event AddedOwner(address indexed wallet, address owner)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| wallet `indexed` | address | undefined |
| owner  | address | undefined |

### ChangedThreshold

```solidity
event ChangedThreshold(address indexed wallet, uint8 threshold)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| wallet `indexed` | address | undefined |
| threshold  | uint8 | undefined |

### CreateLicensedUserWallet

```solidity
event CreateLicensedUserWallet(address indexed walletAddress, address[] owners, uint8 threshold, string englishName, string originalName, enum LicensedUserManager.UserType userType, bytes32 salt)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| walletAddress `indexed` | address | undefined |
| owners  | address[] | undefined |
| threshold  | uint8 | undefined |
| englishName  | string | undefined |
| originalName  | string | undefined |
| userType  | enum LicensedUserManager.UserType | undefined |
| salt  | bytes32 | undefined |

### Initialized

```solidity
event Initialized(uint8 version)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| version  | uint8 | undefined |

### MigrateLicensedUserWallet

```solidity
event MigrateLicensedUserWallet(address indexed walletAddress, string originChain, uint256 originTimestamp)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| walletAddress `indexed` | address | undefined |
| originChain  | string | undefined |
| originTimestamp  | uint256 | undefined |

### RemovedOwner

```solidity
event RemovedOwner(address indexed wallet, address owner)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| wallet `indexed` | address | undefined |
| owner  | address | undefined |

### UpdateLicensedUserDetail

```solidity
event UpdateLicensedUserDetail(address indexed walletAddress, string key, string value)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| walletAddress `indexed` | address | undefined |
| key  | string | undefined |
| value  | string | undefined |

### UpgradeLicensedUserWalletToMulti

```solidity
event UpgradeLicensedUserWalletToMulti(address indexed walletAddress, address[] owners, uint8 threshold)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| walletAddress `indexed` | address | undefined |
| owners  | address[] | undefined |
| threshold  | uint8 | undefined |



