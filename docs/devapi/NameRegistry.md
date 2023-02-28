# NameRegistry

## Title
undefined

## Description
undefined

## Author
undefined

## Methods


[administrator()](#administrator())

[get(uint8)](#get(uint8))

[getInstantiationCount(address)](#getInstantiationCount(address))

[initialize()](#initialize())

[instantiation(address)](#instantiation(address))

[owner()](#owner())

[renounceOwnership()](#renounceOwnership())

[set(uint8,address)](#set(uint8,address))

[transferOwnership(address)](#transferOwnership(address))



### administrator()

Gets the Startrail admin address


  


   
Returns:
    
- **_0**: address
    
  


### get(uint8)

Gets the address associated with the key name


  


   
Returns:
    
- **_0**: address
    
  


### getInstantiationCount(address)

Gets the creator's instantiation count


   
Params:
    
- **creator**: creator address
    
  


   
Returns:
    
- **_0**: count
    
  


### initialize()

Initializes the contract with setting the owner address


  


  


### instantiation(address)

Gets whether or not the contract address has been created


   
Params:
    
- **target**: address of LUW
    
  


   
Returns:
    
- **_0**: boolean
    
  


### owner()

Returns the address of the current owner.


  


  


### renounceOwnership()

Leaves the contract without owner. It will not be possible to call `onlyOwner` functions anymore. Can only be called by the current owner. NOTE: Renouncing ownership will leave the contract without an owner, thereby removing any functionality that is only available to the owner.


  


  


### set(uint8,address)

Sets the name as an address you want to conbine with


   
Params:
    
- **key**: string of the name
    
- **value**: address you want to register
    
  


  


### transferOwnership(address)

Transfers ownership of the contract to a new account (`newOwner`). Can only be called by the current owner.


  


  



