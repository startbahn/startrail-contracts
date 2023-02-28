# OpenZeppelinUpgradesOwnable



> Ownable



*The Ownable contract has an owner address, and provides basic authorization control functions, this simplifies the implementation of &quot;user permissions&quot;. Source https://raw.githubusercontent.com/OpenZeppelin/openzeppelin-solidity/v2.1.3/contracts/ownership/Ownable.sol This contract is copied here and renamed from the original to avoid clashes in the compiled artifacts when the user imports a zos-lib contract (that transitively causes this contract to be compiled and added to the build/artifacts folder) as well as the vanilla Ownable implementation from an openzeppelin version.*

## Methods

### isOwner

```solidity
function isOwner() external view returns (bool)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | true if `msg.sender` is the owner of the contract. |

### owner

```solidity
function owner() external view returns (address)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | the address of the owner. |

### renounceOwnership

```solidity
function renounceOwnership() external nonpayable
```

Renouncing to ownership will leave the contract without an owner. It will not be possible to call the functions with the `onlyOwner` modifier anymore.

*Allows the current owner to relinquish control of the contract.*


### transferOwnership

```solidity
function transferOwnership(address newOwner) external nonpayable
```



*Allows the current owner to transfer control of the contract to a newOwner.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| newOwner | address | The address to transfer ownership to. |



## Events

### OwnershipTransferred

```solidity
event OwnershipTransferred(address indexed previousOwner, address indexed newOwner)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| previousOwner `indexed` | address | undefined |
| newOwner `indexed` | address | undefined |



