#!/bin/sh

export HARDHAT_NETWORK=localhost
export NODE="npx ts-node"
export TS_NODE_TRANSPILE_ONLY=1

createLu() {
  LUW_JSON=$1
  LUW_ADDRESS_FILE=/tmp/lu-address-`date +%s`.txt
  $NODE scripts/lum-create-wallet $LUW_JSON $LUW_ADDRESS_FILE || exit $?
  LUW_ADDRESS=`cat $LUW_ADDRESS_FILE`
  rm $LUW_ADDRESS_FILE
}
