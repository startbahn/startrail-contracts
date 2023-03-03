# CollectionProxy

*Chris Hatch - &lt;chris.hatch@startbahn.jp&gt;*

> A Startrail NFT Collection proxy contract.



*Collection contracts are CollectionProxy’s that lookup implementation      contracts at a shared FeatureRegistry. The shared registry, which is      essentially a Beacon to multiple implementation contracts, enables      all proxies to be upgraded at the same time.*



## Errors

### FeatureRegistryIsNotAContract

```solidity
error FeatureRegistryIsNotAContract()
```






### ImplementationAddressNotFound

```solidity
error ImplementationAddressNotFound()
```







