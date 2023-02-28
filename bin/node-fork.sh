#!/bin/sh

#
# Start Hardhat node in forking mode:
#   https://hardhat.org/guides/mainnet-forking.html
#
# The node will still have localhost properties but uses forked chain data:
#
#   hre.network.name                      =>  'localhost'
#   hre.ethers.provider.network.chainId   =>  31337
#   hre.ethers.provider.connection.url    => 'http://localhost:8545'
#

POLYGON_PROVIDER_FULL_ARCHIVE="https://matic-mainnet-archive-rpc.bwarelabs.com"
MUMBAI_PROVIDER_FULL_ARCHIVE="https://matic-testnet-archive-rpc.bwarelabs.com"

read -p "Which network do you want to fork? (polygon or mumbai-release): " NETWORK

if [ "$NETWORK" = "polygon" ]; then
  PROVIDER_URL=$POLYGON_PROVIDER_FULL_ARCHIVE
elif [ "$NETWORK" = "mumbai-release" ]; then
  PROVIDER_URL=$MUMBAI_PROVIDER_FULL_ARCHIVE
else
  echo "Network not supported"
  exit 1
fi

# Fork from the configured endBlock - this means we have transactions up to
# this block and our local network forks from there - all new blocks are 
# created on top of this block
read -p "Which block do you want to fork from?: " FORK_BLOCK

echo "\nFORK_BLOCK=$FORK_BLOCK"
echo "PROVIDER=$PROVIDER_URL\n"

read -p "Continue with the above properties (y or n)?: " CONFIRM
if [ "$CONFIRM" != "y" ]; then
  exit 1
fi

# Node network will be 'localhost' so copy the network deploy.json to there
ROOT=$(dirname $0)/..
DEPLOYMENTS=$ROOT/deployments
FORK_DEPLOY=$DEPLOYMENTS/fork-polygon
if [ ! -d "$FORK_DEPLOY" ]; then
  mkdir $FORK_DEPLOY
fi
cp $DEPLOYMENTS/$NETWORK/deploy.json $FORK_DEPLOY/.

echo "\nStarting $NETWORK fork node"
echo "\nFORK BLOCK = $FORK_BLOCK\n"
npx hardhat node \
  --fork $PROVIDER_URL \
  --fork-block-number $FORK_BLOCK
