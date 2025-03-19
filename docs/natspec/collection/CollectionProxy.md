# CollectionProxy

*Chris Hatch - &lt;chris.hatch@startbahn.jp&gt;*

> A Startrail NFT Collection proxy contract.



*Collection contracts are CollectionProxy’s that lookup implementation      contracts at a shared FeatureRegistry. The shared registry, which is      essentially a Beacon to multiple implementation contracts, enables      all proxies to be upgraded at the same time.*

## Methods

### __CollectionProxy_initialize

```solidity
function __CollectionProxy_initialize(address _featureRegistry) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| _featureRegistry | address | undefined |




## Errors

### CollectionProxyAlreadyInitialized

```solidity
error CollectionProxyAlreadyInitialized()
```






### ImplementationAddressNotFound

```solidity
error ImplementationAddressNotFound()
```






### Proxy__ImplementationIsNotContract

```solidity
error Proxy__ImplementationIsNotContract()
```







