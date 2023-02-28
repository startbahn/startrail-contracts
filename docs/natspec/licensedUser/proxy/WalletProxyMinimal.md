# WalletProxyMinimal



> A minimal proxy to install at LicensedUserLogic proxies.



*Contract adapted from the OpenZeppelin Proxy.sol. Added logic from the EIP-1822 example pattern:  - PROXIABLE storage slot for the contractLogic  - a constructor to set contractLogic and call some init function Modified the fallback to handle on the fly check and upgrade of the contract logic. Delegates to upgrade function in the contractLogic.*



