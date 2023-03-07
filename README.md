# Startrail
[![npm version](https://img.shields.io/npm/v/@startbahn/startrail/master.svg)](https://www.npmjs.com/package/@startbahn/startrail/v/master)
[![Hacken Badge](https://hacken.io/wp-content/uploads/2023/02/ColorFullColorTypeSmartContractAuditBackFilled.png)](./audits/Hacken_Aug2022.pdf)

## :memo: Overview

The Startrail smart contracts repository.

### :file_folder: Directory

```text
(ProjectRoot)
├── abi                     // solc generated ABI JSON files
├── bin                     // utility shell scripts
├── contracts
│   ├── bulk
│   ├── common
│   ├── lib
│   ├── licensedUser
│   ├── metaTx
│   ├── name
│   ├── proxyAdmin
│   ├── startrailregistry
│   └── test                // contracts used in tests only
├── deployments             // deployed addresses registry [eg. polygon/deploy.json]
├── docs                    // documentation - diagrams, markdown, ...
├── hardhat.config.js
├── package.json
├── README.md
├── scripts                 // deployment and contract interaction scripts
├── startrail-common-js     // scripts shared with APIs
├── test                    // mocha test scripts
├── utils                   // shared logic - tests, scripts, deployment all use these
```

## :dizzy: Contracts

:page_with_curl: [StartrailRegistry](./contracts/startrailregistry)
The Startrail ERC721 contract. All SRRs are minted on this contract.

:page_with_curl: [LicensedUserManager](./contracts/licensedUser)
Manages Licensed User wallets.

:page_with_curl: [MetaTxForwarder](./contracts/metaTx/MetaTxForwarder.sol.head)
Forward meta transactions to the StartrailRegistry and all the Bulk contracts.

:page_with_curl: [MetaTxRequestManager](./contracts/metaTx/MetaTxRequestManager.sol)
Manages the set of Startrail meta transactions.

:page_with_curl: [Administrator](./node_modules/@gnosis.pm/safe-contracts/contracts/GnosisSafe.sol)
Administrator contract which is a GnosisSafe instance.

:page_with_curl: [Bulk](./contracts/bulk/Bulk.sol)
Manages bulk processing of SRR issuances, transfer approvals and transfer.

:page_with_curl: [BulkIssue](./contracts/bulk/BulkIssueV3.sol) [deprecated]
Manages bulk processing of SRR issuances. The Bulk contract supercedes this contract.

:page_with_curl: [BulkTransfer](./contracts/bulk/BulkTransfer.sol) [deprecated]
Manages bulk processing of SRR transfers. The Bulk contract supercedes this contract.

:page_with_curl: [NameRegistry](./contracts/name)
Registry of Startrail contract addresses.

## :minidisc: Setup local

### Prerequistites

- Git
- Yarn 1.22
- Node 16 (see package.json for latest version)

### Live networks (optional)

If you need to interact with live deployments (eg. polygon or mumbais) then set a provider in `.env` with the variable `<network>_PROVIDER_URL`.

If you need to send transactions to a live environment then set a private key in `.env` with the variable `<network>_PRIVATE_KEY`. This key will be the default key used for sending transactions from hardhat scripts or hardhat console commands.

Remember to use `--network <network>` with the hardhat cli. See the hardhat docs for information about using different networks https://hardhat.org/config/#networks-configuration

## :bulb: Tests

Tests are run using hardhat or foundry. See their docs for more information.

To run the tests use `yarn test` or `npx hardhat test` for hardhat ones, `yarn forge-test` for foundry ones.

CircleCI is configured to run all the tests also. See `.circleci/config.yml` for details.


## :bookmark: Contract Addresses

You can check the address of each deployed contract in `deploy.json` under [deployments/](./deployments). It is managed according to each network or network/deployment name pair such as `polygon` and `mumbai-staging`.

[polygon/deploy.json](./deployments/polygon/deploy.json)

[mumbai-staging/deploy.json](./deployments/mumbai-staging/deploy.json)

[mumbai-release/deploy.json](./deployments/mumbai-release/deploy.json) [QA]

[mumbai-develop/deploy.json](./deployments/mumbai-develop/deploy.json)
