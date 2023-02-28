#!/bin/sh

H="npx hardhat"
S="npx surya"

OUT=artifacts/flattened
mkdir -p $OUT

echo "\nGenerating flattened Solidity files [$OUT] ...\n"

generateFlattened() {
  CONTRACT_PATH=$1
  CONTRACT_NAME=`echo $CONTRACT_PATH | sed -e 's/.*\/\(.*\)\.sol/\1/'`
  FLATTENED_FILE=$OUT/$CONTRACT_NAME.flattened.sol

  $H flatten $CONTRACT_PATH 2>/dev/null > $FLATTENED_FILE

  echo "Generated $FLATTENED_FILE"
}

generateFlattened contracts/licensedUser/LicensedUserManager.sol
generateFlattened contracts/startrailregistry/StartrailRegistryV7.sol
generateFlattened contracts/bulk/BulkIssueV3.sol
generateFlattened contracts/bulk/BulkTransfer.sol
generateFlattened contracts/proxyAdmin/StartrailProxy.sol
generateFlattened contracts/name/NameRegistry.sol
generateFlattened contracts/metaTx/MetaTxForwarderV2.sol
