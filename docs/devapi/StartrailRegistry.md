# StartrailRegistry

## Title
undefined

## Description
undefined

## Author
undefined

## Methods


[addCustomHistoryType(string)](#addCustomHistoryType(string))

[approve(address,uint256)](#approve(address,uint256))

[approveSRRByCommitment(uint256,bytes32,string)](#approveSRRByCommitment(uint256,bytes32,string))

[approveSRRByCommitment(uint256,bytes32,string,uint256)](#approveSRRByCommitment(uint256,bytes32,string,uint256))

[balanceOf(address)](#balanceOf(address))

[baseURI()](#baseURI())

[cancelSRRCommitment(uint256)](#cancelSRRCommitment(uint256))

[createSRR(bool,address,bytes32,(bytes32,uint8,bytes32,bytes32,address))](#createSRR(bool,address,bytes32,(bytes32,uint8,bytes32,bytes32,address)))

[createSRRFromLicensedUser(bool,address,bytes32)](#createSRRFromLicensedUser(bool,address,bytes32))

[getApproved(uint256)](#getApproved(uint256))

[getCustomHistoryNameById(uint256)](#getCustomHistoryNameById(uint256))

[getHistoryMetadataDigest(uint256)](#getHistoryMetadataDigest(uint256))

[getSRR(uint256)](#getSRR(uint256))

[getSRRCommitment(uint256)](#getSRRCommitment(uint256))

[getSRROwner(uint256)](#getSRROwner(uint256))

[getTokenId(bytes32,address)](#getTokenId(bytes32,address))

[initialize(address,string,string,bytes32)](#initialize(address,string,string,bytes32))

[isApprovedForAll(address,address)](#isApprovedForAll(address,address))

[isTrustedForwarder(address)](#isTrustedForwarder(address))

[name()](#name())

[owner()](#owner())

[ownerOf(uint256)](#ownerOf(uint256))

[renounceOwnership()](#renounceOwnership())

[safeTransferFrom(address,address,uint256)](#safeTransferFrom(address,address,uint256))

[safeTransferFrom(address,address,uint256,bytes)](#safeTransferFrom(address,address,uint256,bytes))

[setApprovalForAll(address,bool)](#setApprovalForAll(address,bool))

[setNameRegistryAddress(address)](#setNameRegistryAddress(address))

[setTokenURIParts(string,string)](#setTokenURIParts(string,string))

[setTokenURISchemaIntegrityDigest(bytes32)](#setTokenURISchemaIntegrityDigest(bytes32))

[symbol()](#symbol())

[tokenURI(string)](#tokenURI(string))

[tokenURI(uint256)](#tokenURI(uint256))

[tokenURIIntegrity(uint256)](#tokenURIIntegrity(uint256))

[tokenURISchemaIntegrity(uint256)](#tokenURISchemaIntegrity(uint256))

[transferFrom(address,address,uint256)](#transferFrom(address,address,uint256))

[transferOwnership(address)](#transferOwnership(address))

[transferSRRByReveal(address,bytes32,uint256)](#transferSRRByReveal(address,bytes32,uint256))

[transferSRRFrom(address,address,uint256)](#transferSRRFrom(address,address,uint256))

[updateSRRFromLicensedUser(uint256,bool,address)](#updateSRRFromLicensedUser(uint256,bool,address))

[updateSRRMetadata(uint256,bytes32)](#updateSRRMetadata(uint256,bytes32))

[writeCustomHistory(string,uint256,bytes32)](#writeCustomHistory(string,uint256,bytes32))



### addCustomHistoryType(string)

add history type before creating history ig: exhibithion


   
Params:
    
- **historyTypeName**: name of the custom history type
    
  


   
Returns:
    
- **id**: representing custom history type into mapping
    
  


### approve(address,uint256)

Approves another address to transfer the given token ID The zero address indicates there is no approved address. There can only be one approved address per token at a given time. Can only be called by the token owner or an approved operator.


   
Params:
    
- **to**: address to be approved for the given token ID
    
- **tokenId**: uint256 ID of the token to be approved
    
  


  


### approveSRRByCommitment(uint256,bytes32,string)

Approves the given commitment hash to transfer the SRR


   
Params:
    
- **commitment**: bytes32 of the commitment hash
    
- **historyMetadataDigest**: string of the history metadata digest
    
- **tokenId**: uint256 ID of the SRR
    
  


  


### approveSRRByCommitment(uint256,bytes32,string,uint256)

Approves the given commitment hash to transfer the SRR with custom history id


   
Params:
    
- **commitment**: bytes32 of the commitment hash
    
- **customHistoryId**: to map with custom history
    
- **historyMetadataDigest**: string of the history metadata digest
    
- **tokenId**: uint256 ID of the SRR
    
  


  


### balanceOf(address)

Gets the balance of the specified address.


   
Params:
    
- **owner**: address to query the balance of
    
  


   
Returns:
    
- **_0**: uint256 representing the amount owned by the passed address
    
  


### baseURI()

Returns the base URI set via {_setBaseURI}. This will be automatically added as a prefix in {tokenURI} to each token's URI, or to the token ID if no specific URI is set for that token ID.


  


  


### cancelSRRCommitment(uint256)

Cancels the current commitment of a given SRR


   
Params:
    
- **tokenId**: uint256 ID of the SRR
    
  


  


### createSRR(bool,address,bytes32,(bytes32,uint8,bytes32,bytes32,address))

Creates a registryRecord of an artwork


   
Params:
    
- **artistAddress**: address of the artist contract
    
- **isPrimaryIssuer**: boolean whether the user is a primary issuer
    
- **metadataDigest**: bytes32 of metadata hash
    
- **sig**: signature
    
  


   
Returns:
    
- **_0**: uint256 tokenId
    
  


### createSRRFromLicensedUser(bool,address,bytes32)

Creates a registryRecord of an artwork from LicensedUserLogic contract


   
Params:
    
- **artistAddress**: address of the artist contract
    
- **isPrimaryIssuer**: address of the issuer user contract
    
- **metadataDigest**: bytes32 of metadata hash
    
  


   
Returns:
    
- **_0**: uint256 tokenId
    
  


### getApproved(uint256)

Gets the approved address for a token ID, or zero if no address set Reverts if the token ID does not exist.


   
Params:
    
- **tokenId**: uint256 ID of the token to query the approval of
    
  


   
Returns:
    
- **_0**: address currently approved for the given token ID
    
  


### getCustomHistoryNameById(uint256)

Gets custom history name by id


   
Params:
    
- **id**: uint256 of customHistoryId
    
  


   
Returns:
    
- **_0**: custom history name
    
  


### getHistoryMetadataDigest(uint256)

Gets metadata digests


   
Params:
    
- **tokenId**: uint256 of StartrailRegistryRecordID
    
  


   
Returns:
    
- **_0**: history metadata digest
    
  


### getSRR(uint256)

Gets the registryRecord related with the tokenId


   
Params:
    
- **tokenId**: uint256 ID of StartrailRegistry
    
  


   
Returns:
    
- **registryRecord**: dataset / metadataDigest
    
  


### getSRRCommitment(uint256)

Gets the given commitment hash to transfer the SRR


   
Params:
    
- **tokenId**: uint256 ID of StartrailRegistry
    
  


   
Returns:
    
- **_0**: commitment hash
    
  


### getSRROwner(uint256)

Gets the owner address of the SRR


   
Params:
    
- **tokenId**: uint256 of the SRR ID
    
  


   
Returns:
    
- **_0**: owner address
    
  


### getTokenId(bytes32,address)

Gets the tokenID from ID Generator using metadataDigest.


   
Params:
    
- **metadataDigest**: bytes32 metadata digest of token
    
  


   
Returns:
    
- **_0**: tokenId from metadataDigest
    
  


### initialize(address,string,string,bytes32)

Initializes the address of the nameRegistry contract


   
Params:
    
- **URIPostfix**: string of the URI postfix of the scheme
    
- **URIPrefix**: string of the URI prefix of the scheme where SRR metadata is saved
    
- **nameRegistry**: address of the NameRegistry
    
- **schemaURIIntegrityDigest**: bytes32 of the URI digest of the scheme
    
  


  


### isApprovedForAll(address,address)

Tells whether an operator is approved by a given owner.


   
Params:
    
- **operator**: operator address which you want to query the approval of
    
- **owner**: owner address which you want to query the approval of
    
  


   
Returns:
    
- **_0**: bool whether the given operator is approved by the given owner
    
  


### isTrustedForwarder(address)

return if the forwarder is trusted to forward relayed transactions to us. the forwarder is required to verify the sender's signature, and verify the call is not a replay.


  


  


### name()

Gets the token name.


  


   
Returns:
    
- **_0**: string representing the token name
    
  


### owner()

Returns the address of the current owner.


  


  


### ownerOf(uint256)

Gets the owner of the specified token ID.


   
Params:
    
- **tokenId**: uint256 ID of the token to query the owner of
    
  


   
Returns:
    
- **_0**: address currently marked as the owner of the given token ID
    
  


### renounceOwnership()

Leaves the contract without owner. It will not be possible to call `onlyOwner` functions anymore. Can only be called by the current owner. NOTE: Renouncing ownership will leave the contract without an owner, thereby removing any functionality that is only available to the owner.


  


  


### safeTransferFrom(address,address,uint256)

Safely transfers the ownership of a given token ID to another address If the target address is a contract, it must implement {IERC721Receiver-onERC721Received}, which is called upon a safe transfer, and return the magic value `bytes4(keccak256("onERC721Received(address,address,uint256,bytes)"))`; otherwise, the transfer is reverted. Requires the msg.sender to be the owner, approved, or operator


   
Params:
    
- **from**: current owner of the token
    
- **to**: address to receive the ownership of the given token ID
    
- **tokenId**: uint256 ID of the token to be transferred
    
  


  


### safeTransferFrom(address,address,uint256,bytes)

Safely transfers the ownership of a given token ID to another address If the target address is a contract, it must implement {IERC721Receiver-onERC721Received}, which is called upon a safe transfer, and return the magic value `bytes4(keccak256("onERC721Received(address,address,uint256,bytes)"))`; otherwise, the transfer is reverted. Requires the _msgSender() to be the owner, approved, or operator


   
Params:
    
- **_data**: bytes data to send along with a safe transfer check
    
- **from**: current owner of the token
    
- **to**: address to receive the ownership of the given token ID
    
- **tokenId**: uint256 ID of the token to be transferred
    
  


  


### setApprovalForAll(address,bool)

Sets or unsets the approval of a given operator An operator is allowed to transfer all tokens of the sender on their behalf.


   
Params:
    
- **approved**: representing the status of the approval to be set
    
- **operator**: operator address to set the approval
    
  


  


### setNameRegistryAddress(address)

Sets the addresses of the reference


   
Params:
    
- **nameRegistry**: address of the NameRegistry
    
  


  


### setTokenURIParts(string,string)

Sets the URI info of the scheme where SRR metadata is saved


   
Params:
    
- **URIPostfix**: string of the URI postfix of the scheme
    
- **URIPrefix**: string of the URI prefix of the scheme
    
  


  


### setTokenURISchemaIntegrityDigest(bytes32)

Sets the scheme URI digests of SRR metadata


   
Params:
    
- **digest**: bytes32 of the scheme URI digests
    
  


  


### symbol()

Gets the token symbol.


  


   
Returns:
    
- **_0**: string representing the token symbol
    
  


### tokenURI(string)

Gets URI where the matadata is saved


   
Params:
    
- **metadataDigest**: string of metadata digests
    
  


   
Returns:
    
- **_0**: URI
    
  


### tokenURI(uint256)

Returns the URI for a given token ID. May return an empty string. If a base URI is set (via {_setBaseURI}), it is added as a prefix to the token's own URI (via {_setTokenURI}). If there is a base URI but no token URI, the token's ID will be used as its URI when appending it to the base URI. This pattern for autogenerated token URIs can lead to large gas savings. .Examples |=== |`_setBaseURI()` |`_setTokenURI()` |`tokenURI()` | "" | "" | "" | "" | "token.uri/123" | "token.uri/123" | "token.uri/" | "123" | "token.uri/123" | "token.uri/" | "" | "token.uri/<tokenId>" |=== Requirements: - `tokenId` must exist.


  


  


### tokenURIIntegrity(uint256)

Gets the metadata digests of SRR and hash


   
Params:
    
- **tokenId**: uint256 ID of StartrailRegistry
    
  


  


### tokenURISchemaIntegrity(uint256)

Gets the scheme digests and hash


   
Params:
    
- **tokenId**: uint256 ID of StartrailRegistry
    
  


  


### transferFrom(address,address,uint256)

Transfers the ownership of a given token ID to another address. Usage of this method is discouraged, use {safeTransferFrom} whenever possible. Requires the msg.sender to be the owner, approved, or operator.


   
Params:
    
- **from**: current owner of the token
    
- **to**: address to receive the ownership of the given token ID
    
- **tokenId**: uint256 ID of the token to be transferred
    
  


  


### transferOwnership(address)

Transfers ownership of the contract to a new account (`newOwner`). Can only be called by the current owner.


  


  


### transferSRRByReveal(address,bytes32,uint256)

Transfers the ownership of a given SRR ID to another address.


   
Params:
    
- **reveal**: bytes32 of the reveal hash value to restore the commitment value
    
- **to**: address to receive the ownership
    
- **tokenId**: uint256 ID of the SRR to be transferred
    
  


  


### transferSRRFrom(address,address,uint256)

Transfers the ownership of a given SRR ID to another address.


   
Params:
    
- **from**: address of the current owner
    
- **to**: address to receive the ownership
    
- **tokenId**: uint256 ID of the SRR to be transferred
    
  


  


### updateSRRFromLicensedUser(uint256,bool,address)

Updates the registryRecord


   
Params:
    
- **isPrimaryIssuer**: boolean whether the user is a primary issuer
    
- **tokenId**: uint256 of StartrailRegistryRecordID
    
  


   
Returns:
    
- **_0**: uint256 tokenId
    
  


### updateSRRMetadata(uint256,bytes32)

Updates the SRR metadata


   
Params:
    
- **metadataDigest**: bytes32 of the metadata hash
    
- **tokenId**: uint256 of StartrailRegistryRecordID
    
  


  


### writeCustomHistory(string,uint256,bytes32)

Write custom history ig: exhibithion


   
Params:
    
- **customHistoryTypeId**: of the custom history
    
- **id**: to determine the history
    
- **metadataDigest**: representing custom history
    
- **name**: of the custom history
    
  


  



