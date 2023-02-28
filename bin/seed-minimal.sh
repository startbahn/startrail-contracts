#!/bin/sh

. `dirname $0`/seed-library.sh

echo "\n\n==============  Seed Minimal Data  ================\n\n"

createLu scripts/__data__/lum-create-artist.json

sendMetaTx() {
  META_TX_INPUT_NAME=$1
  $NODE scripts/meta-tx-send -m scripts/__data__/meta-tx-$META_TX_INPUT_NAME.json -a $LUW_ADDRESS || exit $?
}

sendMetaTx sr-issue2