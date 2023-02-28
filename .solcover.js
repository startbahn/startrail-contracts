module.exports = {
  silent: false,
  mocha: {
    grep: "@skip-on-coverage", // Find everything with this tag
    invert: true, // Run the grep's inverse set.
  },
  skipFiles: [
    // NOTE: can't use globs (yet): https://github.com/sc-forks/solidity-coverage/issues/291
    "./bulk/BulkIssueV1.sol",
    "./bulk/BulkIssueV2.sol",
    "./common/IStartrailRegistryV1.sol",
    "./common/IStartrailRegistryV2.sol",
    "./common/IStartrailRegistryV3.sol",
    "./common/IStartrailRegistryV4.sol",
    "./common/IStartrailRegistryV5.sol",
    "./common/IStartrailRegistryV6.sol",
    "./metaTx/IMetaTxForwarderV1.sol",
    "./metaTx/MetaTxForwarderV1.sol",
    "./startrailregistry/IStartrailRegistryMigrationV1.sol",
    "./startrailregistry/IStartrailRegistryMigrationV2.sol",
    "./startrailregistry/StartrailRegistryV1.sol",
    "./startrailregistry/StartrailRegistryV2.sol",
    "./startrailregistry/StartrailRegistryV3.sol",
    "./startrailregistry/StartrailRegistryV4.sol",
    "./startrailregistry/StartrailRegistryV5.sol",
    "./startrailregistry/StartrailRegistryV6.sol",
  ],
};
