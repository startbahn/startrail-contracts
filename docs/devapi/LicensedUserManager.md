# LicensedUserManager

## Title
LicensedUserManager - manages LicensedUser meta-tx proxy wallets.

## Description
A LicensedUser wallet is a single address controlled by one or more owners. The owners registers with StartBahn as known and KYC'd entities.  Each wallet is allocated an Ethereum address which is computed with create2. However no bytecode is stored at that address. This contract manages all LicensedUser wallets in Startrail with a level of security equal to a proxy with bytecode. This is because the  LicensedUserManager checks signatures are correct and n of m signature  thresholds are reached before each transaction is sent. The same checks that would be in place at a proxy with bytecode. This setup provides very cheap wallet creation (~90k gas) and transaction  proxying. Ownership of Startrail Registry Record NFT tokens (SRRs) is bound to these  LicensedUser wallet addresses and any transfers of ownership or  modifications require signatures from the owners of the wallets. The owners are in complete control of these wallets. If for some reason an independent contract is required. ie. a contract with it's own bytecode, then a theoretical ejectWallet function can be called to install bytecode (a tx proxy, LU management functions, etc.) and store state (owner lists, LU names, etc.) at the wallet address. An example, commented out implementation is provided and could be added by upgrade in the future. Wallets can be single owner or multiple owner and a single owner can be  upgraded to a multiple owner if required. This separation was done to make creation of a single owner wallets as cheap as possible. The types of meta transactions that can be sent are limited to those  registered with the MetaTxRequestManager contract. The destination of these transactions will be one of the Startrail contracts or this LicensedUserManager itself.

## Author
Chris Hatch - <chris.hatch@startbahn.jp>

## Methods


[addOwner(address,address,uint8)](#addOwner(address,address,uint8))

[changeThreshold(address,uint8)](#changeThreshold(address,uint8))

[createUserMulti(address[],uint8,uint8,string,string,bytes32)](#createUserMulti(address[],uint8,uint8,string,string,bytes32))

[createUserMultiFromMigration(address[],uint8,uint8,string,string,address)](#createUserMultiFromMigration(address[],uint8,uint8,string,string,address))

[createUserSingle(address,uint8,string,string,bytes32)](#createUserSingle(address,uint8,string,string,bytes32))

[createUserSingleFromMigration(address,uint8,string,string,address)](#createUserSingleFromMigration(address,uint8,string,string,address))

[encodeRequest((bytes32,address,uint256,bytes))](#encodeRequest((bytes32,address,uint256,bytes)))

[executeTransactionFromMulti((bytes32,address,uint256,bytes),bytes)](#executeTransactionFromMulti((bytes32,address,uint256,bytes),bytes))

[executeTransactionFromSingle((bytes32,address,uint256,bytes),uint8,bytes32,bytes32)](#executeTransactionFromSingle((bytes32,address,uint256,bytes),uint8,bytes32,bytes32))

[getNonce(address,uint128)](#getNonce(address,uint128))

[getOwners(address)](#getOwners(address))

[initialize(address)](#initialize(address))

[packNonce(uint128,uint128)](#packNonce(uint128,uint128))

[registerRequestType(string,string,address,bytes4)](#registerRequestType(string,string,address,bytes4))

[removeOwner(address,address,address,uint8)](#removeOwner(address,address,address,uint8))

[singleToMulti(address,address[],uint8)](#singleToMulti(address,address[],uint8))

[swapOwner(address,address,address,address)](#swapOwner(address,address,address,address))

[unregisterRequestType(bytes32)](#unregisterRequestType(bytes32))



### addOwner(address,address,uint8)

Allows to add a new owner to the Safe and update the threshold at the same time.      This can only be done via a Safe transaction.


   
Params:
    
- **_owner**: New owner address.
    
- **_threshold**: New threshold.
    
- **_wallet**: Wallet address.
    
  


  


### changeThreshold(address,uint8)

Allows to update the number of required confirmations by Safe owners.      This can only be done via a Safe transaction.


   
Params:
    
- **_threshold**: New threshold.
    
- **_wallet**: Wallet address.
    
  


  


### createUserMulti(address[],uint8,uint8,string,string,bytes32)

Create LicensedUser wallet with multiple owners.


   
Params:
    
- **_englishName**: User name in English language.
    
- **_originalName**: User name in native language.
    
- **_owners**: List of signers.
    
- **_salt**: Salt for the create2 address creation.
    
- **_threshold**: Number of signatures required to confirm a transaction.
    
- **_userType**: UserType
    
  


   
Returns:
    
- **walletAddress**: Address of created wallet.
    
  


### createUserMultiFromMigration(address[],uint8,uint8,string,string,address)

Create LicensedUser multi wallet migrating legacy wallet with known address.


   
Params:
    
- **_englishName**: User name in English language.
    
- **_originalName**: User name in native language.
    
- **_owners**: List of signers.
    
- **_threshold**: Number of signatures required to confirm a transaction.
    
- **_userType**: UserType
    
- **_walletAddress**: Known legacy wallet address.
    
  


  


### createUserSingle(address,uint8,string,string,bytes32)

Create LicensedUser wallet with single owner.


   
Params:
    
- **_englishName**: User name in English language.
    
- **_originalName**: User name in native language.
    
- **_owner**: Wallet signer.
    
- **_salt**: Salt for the create2 address creation.
    
- **_userType**: UserType
    
  


   
Returns:
    
- **walletAddress**: Address of created wallet.
    
  


### createUserSingleFromMigration(address,uint8,string,string,address)

Create LicensedUser single wallet migrating legacy wallet with known address.


   
Params:
    
- **_englishName**: User name in English language.
    
- **_originalName**: User name in native language.
    
- **_owner**: Wallet signer.
    
- **_userType**: UserType
    
- **_walletAddress**: Known legacy wallet address.
    
  


  


### encodeRequest((bytes32,address,uint256,bytes))

Encodes request details into EIP712 spec encoding format.


   
Params:
    
- **_request**: ExecutionRequest - transaction details
    
  


   
Returns:
    
- **_0**: Transaction hash bytes.
    
  


### executeTransactionFromMulti((bytes32,address,uint256,bytes),bytes)

Execute a transaction from the given wallet given authorizing signatures.


   
Params:
    
- **_request**: ExecutionRequest - transaction details
    
- **_signatures**: List of signatures authorizing the transaction.
    
  


   
Returns:
    
- **success**: Success or failure
    
  


### executeTransactionFromSingle((bytes32,address,uint256,bytes),uint8,bytes32,bytes32)

Execute a transaction from the given wallet given authorizing signature.


   
Params:
    
- **_r**: signature.r
    
- **_request**: ExecutionRequest - transaction details
    
- **_s**: signature.s
    
- **_v**: signature.v
    
  


   
Returns:
    
- **success**: Success or failure
    
  


### getNonce(address,uint128)

Get next nonce given the wallet and nonce1 / batchId to use.  The contract stores a 2D nonce per wallet:   wallet =>      nonce 1 => nonce 2 Transaction sender should first choose the value of nonce1. In most cases this can be 0. However if sending multiple streams of transactions in parallel then another nonce 1 will be chosen for the additional parallel streams of transactions. Nonce 2 is simply the next available nonce in the mapping by nonce 1.


   
Params:
    
- **_nonce1**: List of signatures authorizing the transaction.
    
- **_wallet**: ExecutionRequest - transaction details
    
  


   
Returns:
    
- **_0**: Next nonce
    
  


### getOwners(address)

Returns array of owners.


   
Params:
    
- **_wallet**: Wallet address.
    
  


   
Returns:
    
- **_0**: Array of Safe owners.
    
  


### initialize(address)

Setup the contract


   
Params:
    
- **_nameRegistry**: NameRegistry address.
    
  


  


### packNonce(uint128,uint128)

Packs nonce 1 and 2 into a single uint256. Clients send the 2D nonce packed into a single uint256. This function is a helper to pack the nonce. It can also of course be done client side. For example with ethers.BigNumber:  ```  nonce = ethers.BigNumber.from(nonce1).            shl(128).            add(ethers.BigNumber.from(nonce2)) ```


   
Params:
    
- **_nonce1**: Nonce 1 of Packed 2D nonce
    
- **_nonce2**: Nonce 2 of Packed 2D nonce
    
  


   
Returns:
    
- **noncePacked**: Packed uint256 nonce
    
  


### registerRequestType(string,string,address,bytes4)

Add a new request type to the register. _typeSuffix defines the parameters that follow the GENERIC_PARAMS (defined above). The format should follow the EIP712 spec. Where the full type hash is:   name ‖ "(" ‖ member₁ ‖ "," ‖ member₂ ‖ "," ‖ … ‖ memberₙ ")" _typeSuffix format can be defined as:   memberₘ ‖ "," ‖ … ‖ memberₙ


   
Params:
    
- **_destinationContract**: Single fixed destination of this request
    
- **_functionSignature**: 4 byte Solidity function signature to call
    
- **_typeName**: Request type name
    
- **_typeSuffix**: Defines parameters specific to the request
    
  


  


### removeOwner(address,address,address,uint8)

Allows to remove an owner from the Safe and update the threshold at the same time.      This can only be done via a Safe transaction.


   
Params:
    
- **_owner**: Owner address to be removed.
    
- **_prevOwner**: Owner that pointed to the owner to be removed in the linked list
    
- **_threshold**: New threshold.
    
- **_wallet**: Wallet address.
    
  


  


### singleToMulti(address,address[],uint8)

Convert a single user LicensedUser to a multi user LicensedUser.


   
Params:
    
- **_owners**: List of signers.
    
- **_threshold**: Number of signatures required to confirm a transaction.
    
- **_wallet**: LicensedUser wallet address.
    
  


  


### swapOwner(address,address,address,address)

Allows to swap/replace an owner from the Safe with another address.      This can only be done via a Safe transaction.


   
Params:
    
- **_newOwner**: New owner address.
    
- **_oldOwner**: Owner address to be replaced.
    
- **_prevOwner**: Owner that pointed to the owner to be replaced in the linked list
    
- **_wallet**: Wallet address.
    
  


  


### unregisterRequestType(bytes32)

Remove a new request type from the register.


   
Params:
    
- **_typeHash**: Request type hash
    
  


  



