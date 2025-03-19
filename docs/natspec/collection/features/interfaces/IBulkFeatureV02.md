# IBulkFeatureV02







*Handlers for performing actions from the Bulk contract. These handlers trust the Bulk contract and perform the action if the call came from the bulk contract.*

## Methods

### approveSRRByCommitmentFromBulk

```solidity
function approveSRRByCommitmentFromBulk(address signer, uint256 tokenId, bytes32 commitment, string historyMetadataHash, uint256 customHistoryId) external nonpayable
```



*Register an approval to transfer ownership by commitment scheme      where the caller is a Bulk contract*

#### Parameters

| Name | Type | Description |
|---|---|---|
| signer | address | Bulk signer |
| tokenId | uint256 | Token Id |
| commitment | bytes32 | commitment hash |
| historyMetadataHash | string | history metadata digest or cid |
| customHistoryId | uint256 | custom history to link the transfer too |

### createSRRFromBulk

```solidity
function createSRRFromBulk(bool isPrimaryIssuer, address artistAddress, string metadataCID, address issuerAddress, bool lockExternalTransfer, address to, address royaltyReceiver, uint16 royaltyBasisPoints) external nonpayable returns (uint256)
```



*Issue an SRR where the caller is a Bulk contract*

#### Parameters

| Name | Type | Description |
|---|---|---|
| isPrimaryIssuer | bool | is issuer a primary issuer |
| artistAddress | address | artist address |
| metadataCID | string | ipfs cid of the metadata |
| issuerAddress | address | issuer address |
| lockExternalTransfer | bool | bool of |
| to | address | the address that the token will be transferred to after the creationbool of the flag to disable standard ERC721 transfer methods |
| royaltyReceiver | address | royalty receiver |
| royaltyBasisPoints | uint16 | royalty basis points |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined |

### transferFromWithProvenanceFromBulk

```solidity
function transferFromWithProvenanceFromBulk(address signer, address to, uint256 tokenId, string historyMetadataHash, uint256 customHistoryId, bool isIntermediary) external nonpayable
```



*Perform an ownership transfer to a given address. This function records the provenance at the same time as safeTransferFrom is executed.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| signer | address | Bulk signer |
| to | address | new owner |
| tokenId | uint256 | Token Id |
| historyMetadataHash | string | history metadata digest or cid |
| customHistoryId | uint256 | custom history to link the transfer too |
| isIntermediary | bool | was approve/transfer handled by an intermediary |




