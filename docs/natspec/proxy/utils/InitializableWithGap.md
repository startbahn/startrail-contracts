# InitializableWithGap





Startrail contracts were deployed with an older version of Initializable.sol from the package {at}openzeppelin/contracts-ethereum-package. It was a version from the semver &#39;^3.0.0&#39;.   That older version contained a storage gap however the new {at}openzeppelin/contracts-upgradeable version does not.  This contract inserts the storage gap so that storage aligns in the contracts that used that older version. 




## Events

### Initialized

```solidity
event Initialized(uint8 version)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| version  | uint8 | undefined |



