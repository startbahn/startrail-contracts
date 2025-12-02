#!/bin/sh

export TS_NODE_TRANSPILE_ONLY=1 # skip type checks to speed up script

# Run a single Hardhat process for faster execution
npx hardhat run --network localhost scripts/deploy/dev/000-deploy-all.ts || exit $?