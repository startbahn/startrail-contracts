# Proxy



> Base proxy contract modified from the @solidstate/contracts Proxy.sol Modification simply moves the body of the fallback() into a separate internal function called handleFallback. This enables the child contract to call it with super.







## Errors

### Proxy__ImplementationIsNotContract

```solidity
error Proxy__ImplementationIsNotContract()
```







