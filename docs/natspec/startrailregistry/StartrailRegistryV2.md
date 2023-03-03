# StartrailRegistryV2









## Methods

### HASH_ALGORITHM

```solidity
function HASH_ALGORITHM() external view returns (string)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | string | undefined |

### _tokenOwner

```solidity
function _tokenOwner(uint256) external view returns (address)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined |

### addCustomHistoryType

```solidity
function addCustomHistoryType(string historyTypeName) external nonpayable returns (uint256 id)
```



*add history type before creating history ig: exhibithion*

#### Parameters

| Name | Type | Description |
|---|---|---|
| historyTypeName | string | name of the custom history type |

#### Returns

| Name | Type | Description |
|---|---|---|
| id | uint256 | representing custom history type into mapping |

### approve

```solidity
function approve(address to, uint256 tokenId) external nonpayable
```



*Approves another address to transfer the given token ID The zero address indicates there is no approved address. There can only be one approved address per token at a given time. Can only be called by the token owner or an approved operator.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| to | address | address to be approved for the given token ID |
| tokenId | uint256 | uint256 ID of the token to be approved |

### approveSRRByCommitment

```solidity
function approveSRRByCommitment(uint256 tokenId, bytes32 commitment, string historyMetadataDigest) external nonpayable
```



*Approves the given commitment hash to transfer the SRR*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | uint256 ID of the SRR |
| commitment | bytes32 | bytes32 of the commitment hash |
| historyMetadataDigest | string | string of the history metadata digest |

### approveSRRByCommitment

```solidity
function approveSRRByCommitment(uint256 tokenId, bytes32 commitment, string historyMetadataDigest, uint256 customHistoryId) external nonpayable
```



*Approves the given commitment hash to transfer the SRR with custom history id*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | uint256 ID of the SRR |
| commitment | bytes32 | bytes32 of the commitment hash |
| historyMetadataDigest | string | string of the history metadata digest |
| customHistoryId | uint256 | to map with custom history |

### approveSRRByCommitmentFromBulk

```solidity
function approveSRRByCommitmentFromBulk(uint256 tokenId, bytes32 commitment, string historyMetadataDigest, uint256 customHistoryId) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | undefined |
| commitment | bytes32 | undefined |
| historyMetadataDigest | string | undefined |
| customHistoryId | uint256 | undefined |

### balanceOf

```solidity
function balanceOf(address owner) external view returns (uint256)
```



*Gets the balance of the specified address.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| owner | address | address to query the balance of |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | uint256 representing the amount owned by the passed address |

### baseURI

```solidity
function baseURI() external view returns (string)
```



*Returns the base URI set via {_setBaseURI}. This will be automatically added as a prefix in {tokenURI} to each token&#39;s URI, or to the token ID if no specific URI is set for that token ID.*


#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | string | undefined |

### cancelSRRCommitment

```solidity
function cancelSRRCommitment(uint256 tokenId) external nonpayable
```



*Cancels the current commitment of a given SRR*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | uint256 ID of the SRR |

### createSRR

```solidity
function createSRR(bool isPrimaryIssuer, address artistAddress, bytes32 metadataDigest) external nonpayable
```



*Creates a registryRecord of an artwork*

#### Parameters

| Name | Type | Description |
|---|---|---|
| isPrimaryIssuer | bool | boolean whether the user is a primary issuer |
| artistAddress | address | address of the artist contract |
| metadataDigest | bytes32 | bytes32 of metadata hash |

### createSRRFromBulk

```solidity
function createSRRFromBulk(bool isPrimaryIssuer, address artistAddress, bytes32 metadataDigest, address issuerAddress) external nonpayable returns (uint256)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| isPrimaryIssuer | bool | undefined |
| artistAddress | address | undefined |
| metadataDigest | bytes32 | undefined |
| issuerAddress | address | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined |

### createSRRFromLicensedUser

```solidity
function createSRRFromLicensedUser(bool isPrimaryIssuer, address artistAddress, bytes32 metadataDigest) external nonpayable returns (uint256)
```



*Creates a registryRecord of an artwork from LicensedUserLogic contract*

#### Parameters

| Name | Type | Description |
|---|---|---|
| isPrimaryIssuer | bool | address of the issuer user contract |
| artistAddress | address | address of the artist contract |
| metadataDigest | bytes32 | bytes32 of metadata hash |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | uint256 tokenId |

### customHistoryTypeIdByName

```solidity
function customHistoryTypeIdByName(string) external view returns (uint256)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| _0 | string | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined |

### customHistoryTypeNameById

```solidity
function customHistoryTypeNameById(uint256) external view returns (string)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | string | undefined |

### getApproved

```solidity
function getApproved(uint256 tokenId) external view returns (address)
```



*Gets the approved address for a token ID, or zero if no address set Reverts if the token ID does not exist.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | uint256 ID of the token to query the approval of |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | address currently approved for the given token ID |

### getCustomHistoryNameById

```solidity
function getCustomHistoryNameById(uint256 id) external view returns (string)
```



*Gets custom history name by id*

#### Parameters

| Name | Type | Description |
|---|---|---|
| id | uint256 | uint256 of customHistoryId |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | string | custom history name |

### getSRR

```solidity
function getSRR(uint256 tokenId) external view returns (struct IStartrailRegistryV2.SRR registryRecord, bytes32 metadataDigest)
```



*Gets the registryRecord related with the tokenId*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | uint256 ID of StartrailRegistry |

#### Returns

| Name | Type | Description |
|---|---|---|
| registryRecord | IStartrailRegistryV2.SRR | dataset / metadataDigest |
| metadataDigest | bytes32 | undefined |

### getSRRCommitment

```solidity
function getSRRCommitment(uint256 tokenId) external view returns (bytes32 commitment, string historyMetadataDigest, uint256 customHistoryId)
```



*Gets the given commitment hash to transfer the SRR*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | uint256 ID of StartrailRegistry |

#### Returns

| Name | Type | Description |
|---|---|---|
| commitment | bytes32 | details |
| historyMetadataDigest | string | undefined |
| customHistoryId | uint256 | undefined |

### getSRROwner

```solidity
function getSRROwner(uint256 tokenId) external view returns (address)
```



*Gets the owner address of the SRR*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | uint256 of the SRR ID |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | owner address |

### getTokenId

```solidity
function getTokenId(bytes32 metadataDigest, address artistAddress) external pure returns (uint256)
```



*Gets the tokenID from ID Generator using metadataDigest.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| metadataDigest | bytes32 | bytes32 metadata digest of token |
| artistAddress | address | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | tokenId from metadataDigest |

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
function initialize(address nameRegistry, address trustedForwarder, string name, string symbol, string URIPrefix, string URIPostfix) external nonpayable
```



*Initializes the address of the nameRegistry contract*

#### Parameters

| Name | Type | Description |
|---|---|---|
| nameRegistry | address | address of the NameRegistry |
| trustedForwarder | address | address of the EIP2771 forwarder which will be the LUM contract |
| name | string | token name eg. &#39;Startrail Registry Record&#39; |
| symbol | string | token code eg. SRR |
| URIPrefix | string | string of the URI prefix of the scheme where SRR metadata is saved |
| URIPostfix | string | string of the URI postfix of the scheme |

### isApprovedForAll

```solidity
function isApprovedForAll(address owner, address operator) external view returns (bool)
```



*Tells whether an operator is approved by a given owner.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| owner | address | owner address which you want to query the approval of |
| operator | address | operator address which you want to query the approval of |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | bool whether the given operator is approved by the given owner |

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

### migrateCustomHistory

```solidity
function migrateCustomHistory(uint256 _id, string _name, uint256 _customHistoryTypeId, bytes32 _metadataDigest, string _originChain, uint256 _originTimestamp, bytes32 _originTxHash) external nonpayable
```

Migrate CustomHistory from other chain



#### Parameters

| Name | Type | Description |
|---|---|---|
| _id | uint256 | undefined |
| _name | string | undefined |
| _customHistoryTypeId | uint256 | undefined |
| _metadataDigest | bytes32 | undefined |
| _originChain | string | undefined |
| _originTimestamp | uint256 | undefined |
| _originTxHash | bytes32 | undefined |

### migrateSRR

```solidity
function migrateSRR(uint256 _tokenId, string _historyMetadataDigest, string _originChain, bytes _stateData, bytes _eventsData) external nonpayable
```

Migrate SRR from other chain



#### Parameters

| Name | Type | Description |
|---|---|---|
| _tokenId | uint256 | undefined |
| _historyMetadataDigest | string | undefined |
| _originChain | string | undefined |
| _stateData | bytes | undefined |
| _eventsData | bytes | undefined |

### name

```solidity
function name() external view returns (string)
```



*Gets the token name.*


#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | string | string representing the token name |

### nameRegistryAddress

```solidity
function nameRegistryAddress() external view returns (address)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined |

### ownerOf

```solidity
function ownerOf(uint256 tokenId) external view returns (address)
```



*Gets the owner of the specified token ID.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | uint256 ID of the token to query the owner of |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | address currently marked as the owner of the given token ID |

### safeTransferFrom

```solidity
function safeTransferFrom(address from, address to, uint256 tokenId) external nonpayable
```



*Safely transfers the ownership of a given token ID to another address If the target address is a contract, it must implement {IERC721Receiver-onERC721Received}, which is called upon a safe transfer, and return the magic value `bytes4(keccak256(&quot;onERC721Received(address,address,uint256,bytes)&quot;))`; otherwise, the transfer is reverted. Requires the msg.sender to be the owner, approved, or operator*

#### Parameters

| Name | Type | Description |
|---|---|---|
| from | address | current owner of the token |
| to | address | address to receive the ownership of the given token ID |
| tokenId | uint256 | uint256 ID of the token to be transferred |

### safeTransferFrom

```solidity
function safeTransferFrom(address from, address to, uint256 tokenId, bytes _data) external nonpayable
```



*Safely transfers the ownership of a given token ID to another address If the target address is a contract, it must implement {IERC721Receiver-onERC721Received}, which is called upon a safe transfer, and return the magic value `bytes4(keccak256(&quot;onERC721Received(address,address,uint256,bytes)&quot;))`; otherwise, the transfer is reverted. Requires the _msgSender() to be the owner, approved, or operator*

#### Parameters

| Name | Type | Description |
|---|---|---|
| from | address | current owner of the token |
| to | address | address to receive the ownership of the given token ID |
| tokenId | uint256 | uint256 ID of the token to be transferred |
| _data | bytes | bytes data to send along with a safe transfer check |

### setApprovalForAll

```solidity
function setApprovalForAll(address operator, bool approved) external nonpayable
```



*Sets or unsets the approval of a given operator An operator is allowed to transfer all tokens of the sender on their behalf.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| operator | address | operator address to set the approval |
| approved | bool | representing the status of the approval to be set |

### setNameRegistryAddress

```solidity
function setNameRegistryAddress(address nameRegistry) external nonpayable
```



*Sets the addresses of the reference*

#### Parameters

| Name | Type | Description |
|---|---|---|
| nameRegistry | address | address of the NameRegistry |

### setTokenURIParts

```solidity
function setTokenURIParts(string URIPrefix, string URIPostfix) external nonpayable
```



*Sets the URI info of the scheme where SRR metadata is saved*

#### Parameters

| Name | Type | Description |
|---|---|---|
| URIPrefix | string | string of the URI prefix of the scheme |
| URIPostfix | string | string of the URI postfix of the scheme |

### setTrustedForwarder

```solidity
function setTrustedForwarder(address forwarder) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| forwarder | address | undefined |

### supportsInterface

```solidity
function supportsInterface(bytes4 interfaceId) external view returns (bool)
```



*See {IERC165-supportsInterface}.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| interfaceId | bytes4 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | undefined |

### symbol

```solidity
function symbol() external view returns (string)
```



*Gets the token symbol.*


#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | string | string representing the token symbol |

### tokenURI

```solidity
function tokenURI(string metadataDigest) external view returns (string)
```



*Gets URI where the matadata is saved*

#### Parameters

| Name | Type | Description |
|---|---|---|
| metadataDigest | string | string of metadata digests |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | string | URI |

### tokenURI

```solidity
function tokenURI(uint256 tokenId) external view returns (string)
```



*Returns the URI for a given token ID. May return an empty string. If a base URI is set (via {_setBaseURI}), it is added as a prefix to the token&#39;s own URI (via {_setTokenURI}). If there is a base URI but no token URI, the token&#39;s ID will be used as its URI when appending it to the base URI. This pattern for autogenerated token URIs can lead to large gas savings. .Examples |=== |`_setBaseURI()` |`_setTokenURI()` |`tokenURI()` | &quot;&quot; | &quot;&quot; | &quot;&quot; | &quot;&quot; | &quot;token.uri/123&quot; | &quot;token.uri/123&quot; | &quot;token.uri/&quot; | &quot;123&quot; | &quot;token.uri/123&quot; | &quot;token.uri/&quot; | &quot;&quot; | &quot;token.uri/&lt;tokenId&gt;&quot; |=== Requirements: - `tokenId` must exist.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | string | undefined |

### tokenURIIntegrity

```solidity
function tokenURIIntegrity(uint256 tokenId) external view returns (bytes digest, string hashAlgorithm)
```



*Gets the metadata digests of SRR and hash*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | uint256 ID of StartrailRegistry |

#### Returns

| Name | Type | Description |
|---|---|---|
| digest | bytes | Bytes returned from the hash algorithm, or &quot;&quot; if not available |
| hashAlgorithm | string | The name of the cryptographic hash algorithm, or &quot;&quot; if not available |

### tokenURISchemaIntegrity

```solidity
function tokenURISchemaIntegrity(uint256 tokenId) external view returns (bytes digest, string hashAlgorithm)
```

NOT USED - schema integrity is stored in the JSON document under $schemaIntegrity

*Gets the scheme digests and hash*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | uint256 ID of StartrailRegistry |

#### Returns

| Name | Type | Description |
|---|---|---|
| digest | bytes | Bytes returned from the hash algorithm, or &quot;&quot; if not available |
| hashAlgorithm | string | The name of the cryptographic hash algorithm, or &quot;&quot; if not available |

### transferFrom

```solidity
function transferFrom(address from, address to, uint256 tokenId) external nonpayable
```



*Transfers the ownership of a given token ID to another address. Usage of this method is discouraged, use {safeTransferFrom} whenever possible. Requires the msg.sender to be the owner, approved, or operator.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| from | address | current owner of the token |
| to | address | address to receive the ownership of the given token ID |
| tokenId | uint256 | uint256 ID of the token to be transferred |

### transferSRRByReveal

```solidity
function transferSRRByReveal(address to, bytes32 reveal, uint256 tokenId) external nonpayable
```



*Transfers the ownership of a given SRR ID to another address.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| to | address | address to receive the ownership |
| reveal | bytes32 | bytes32 of the reveal hash value to restore the commitment value |
| tokenId | uint256 | uint256 ID of the SRR to be transferred |

### updateSRRFromLicensedUser

```solidity
function updateSRRFromLicensedUser(uint256 tokenId, bool isPrimaryIssuer, address artistAddress) external nonpayable returns (uint256)
```



*Updates the registryRecord*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | uint256 of StartrailRegistryRecordID |
| isPrimaryIssuer | bool | boolean whether the user is a primary issuer |
| artistAddress | address | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | uint256 tokenId |

### updateSRRMetadata

```solidity
function updateSRRMetadata(uint256 tokenId, bytes32 metadataDigest) external nonpayable
```



*Updates the SRR metadata*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | uint256 of StartrailRegistryRecordID |
| metadataDigest | bytes32 | bytes32 of the metadata hash |

### writeCustomHistory

```solidity
function writeCustomHistory(string name, uint256 customHistoryTypeId, bytes32 metadataDigest) external nonpayable returns (uint256 id)
```



*Write custom history ig: exhibithion*

#### Parameters

| Name | Type | Description |
|---|---|---|
| name | string | of the custom history |
| customHistoryTypeId | uint256 | of the custom history |
| metadataDigest | bytes32 | representing custom history |

#### Returns

| Name | Type | Description |
|---|---|---|
| id | uint256 | undefined |



## Events

### Approval

```solidity
event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| owner `indexed` | address | undefined |
| approved `indexed` | address | undefined |
| tokenId `indexed` | uint256 | undefined |

### ApprovalForAll

```solidity
event ApprovalForAll(address indexed owner, address indexed operator, bool approved)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| owner `indexed` | address | undefined |
| operator `indexed` | address | undefined |
| approved  | bool | undefined |

### CreateCustomHistory

```solidity
event CreateCustomHistory(uint256 indexed id, string name, uint256 customHistoryTypeId, bytes32 metadataDigest)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| id `indexed` | uint256 | undefined |
| name  | string | undefined |
| customHistoryTypeId  | uint256 | undefined |
| metadataDigest  | bytes32 | undefined |

### CreateCustomHistoryFromMigration

```solidity
event CreateCustomHistoryFromMigration(uint256 indexed id, string name, uint256 customHistoryTypeId, bytes32 metadataDigest, string originChain, uint256 originTimestamp, bytes32 originTxHash)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| id `indexed` | uint256 | undefined |
| name  | string | undefined |
| customHistoryTypeId  | uint256 | undefined |
| metadataDigest  | bytes32 | undefined |
| originChain  | string | undefined |
| originTimestamp  | uint256 | undefined |
| originTxHash  | bytes32 | undefined |

### CreateCustomHistoryType

```solidity
event CreateCustomHistoryType(uint256 indexed id, string historyType)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| id `indexed` | uint256 | undefined |
| historyType  | string | undefined |

### CreateSRR

```solidity
event CreateSRR(uint256 indexed tokenId, IStartrailRegistryV2.SRR registryRecord, bytes32 metadataDigest)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId `indexed` | uint256 | undefined |
| registryRecord  | IStartrailRegistryV2.SRR | undefined |
| metadataDigest  | bytes32 | undefined |

### CreateSRRFromMigration

```solidity
event CreateSRRFromMigration(uint256 indexed tokenId, IStartrailRegistryV1.SRR registryRecord, bytes32 metadataDigest, uint256 originTimestamp, bytes32 originTxHash)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId `indexed` | uint256 | undefined |
| registryRecord  | IStartrailRegistryV1.SRR | undefined |
| metadataDigest  | bytes32 | undefined |
| originTimestamp  | uint256 | undefined |
| originTxHash  | bytes32 | undefined |

### Initialized

```solidity
event Initialized(uint8 version)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| version  | uint8 | undefined |

### MigrateSRR

```solidity
event MigrateSRR(uint256 indexed tokenId, string originChain)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId `indexed` | uint256 | undefined |
| originChain  | string | undefined |

### Provenance

```solidity
event Provenance(uint256 indexed tokenId, address indexed from, address indexed to, uint256 customHistoryId, string historyMetadataDigest, string historyMetadataURI)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId `indexed` | uint256 | undefined |
| from `indexed` | address | undefined |
| to `indexed` | address | undefined |
| customHistoryId  | uint256 | undefined |
| historyMetadataDigest  | string | undefined |
| historyMetadataURI  | string | undefined |

### ProvenanceFromMigration

```solidity
event ProvenanceFromMigration(uint256 indexed tokenId, address indexed from, address indexed to, uint256 timestamp, uint256 customHistoryId, string historyMetadataDigest, string historyMetadataURI, uint256 originTimestamp, bytes32 originTxHash)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId `indexed` | uint256 | undefined |
| from `indexed` | address | undefined |
| to `indexed` | address | undefined |
| timestamp  | uint256 | undefined |
| customHistoryId  | uint256 | undefined |
| historyMetadataDigest  | string | undefined |
| historyMetadataURI  | string | undefined |
| originTimestamp  | uint256 | undefined |
| originTxHash  | bytes32 | undefined |

### SRRCommitment

```solidity
event SRRCommitment(uint256 indexed tokenId, address owner, bytes32 commitment, uint256 customHistoryId)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId `indexed` | uint256 | undefined |
| owner  | address | undefined |
| commitment  | bytes32 | undefined |
| customHistoryId  | uint256 | undefined |

### SRRCommitmentCancelled

```solidity
event SRRCommitmentCancelled(uint256 indexed tokenId)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId `indexed` | uint256 | undefined |

### SRRCommitmentCancelledFromMigration

```solidity
event SRRCommitmentCancelledFromMigration(uint256 tokenId, uint256 originTimestamp, bytes32 originTxHash)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId  | uint256 | undefined |
| originTimestamp  | uint256 | undefined |
| originTxHash  | bytes32 | undefined |

### SRRCommitmentFromMigration

```solidity
event SRRCommitmentFromMigration(address owner, bytes32 commitment, uint256 tokenId, uint256 customHistoryId, uint256 originTimestamp, bytes32 originTxHash)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| owner  | address | undefined |
| commitment  | bytes32 | undefined |
| tokenId  | uint256 | undefined |
| customHistoryId  | uint256 | undefined |
| originTimestamp  | uint256 | undefined |
| originTxHash  | bytes32 | undefined |

### Transfer

```solidity
event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| from `indexed` | address | undefined |
| to `indexed` | address | undefined |
| tokenId `indexed` | uint256 | undefined |

### TransferFromMigration

```solidity
event TransferFromMigration(address indexed from, address indexed to, uint256 indexed tokenId, uint256 originTimestamp, bytes32 originTxHash)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| from `indexed` | address | undefined |
| to `indexed` | address | undefined |
| tokenId `indexed` | uint256 | undefined |
| originTimestamp  | uint256 | undefined |
| originTxHash  | bytes32 | undefined |

### UpdateSRR

```solidity
event UpdateSRR(uint256 indexed tokenId, IStartrailRegistryV2.SRR registryRecord)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId `indexed` | uint256 | undefined |
| registryRecord  | IStartrailRegistryV2.SRR | undefined |

### UpdateSRRFromMigration

```solidity
event UpdateSRRFromMigration(uint256 indexed tokenId, IStartrailRegistryV1.SRR registryRecord, uint256 originTimestamp, bytes32 originTxHash)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId `indexed` | uint256 | undefined |
| registryRecord  | IStartrailRegistryV1.SRR | undefined |
| originTimestamp  | uint256 | undefined |
| originTxHash  | bytes32 | undefined |

### UpdateSRRMetadataDigest

```solidity
event UpdateSRRMetadataDigest(uint256 indexed tokenId, bytes32 metadataDigest)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId `indexed` | uint256 | undefined |
| metadataDigest  | bytes32 | undefined |

### UpdateSRRMetadataDigestFromMigration

```solidity
event UpdateSRRMetadataDigestFromMigration(uint256 indexed tokenId, bytes32 metadataDigest, uint256 originTimestamp, bytes32 originTxHash)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId `indexed` | uint256 | undefined |
| metadataDigest  | bytes32 | undefined |
| originTimestamp  | uint256 | undefined |
| originTxHash  | bytes32 | undefined |



