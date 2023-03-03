#!/bin/sh

. `dirname $0`/seed-library.sh

echo "\n\n==============  Seed Extended Data  ================\n\n"

createLu scripts/__data__/lum-create-handler.json

sendMetaTx() {
  META_TX_INPUT_NAME=$1
  
  FROM_ADDRESS=$2
  if [ -z "$FROM_ADDRESS" ]; then
    FROM_ADDRESS_OPTION="-a $LUW_ADDRESS"
  else
    FROM_ADDRESS_OPTION="-a $FROM_ADDRESS"
  fi
  
  PRIVATE_KEY=$3
  if [ -z "$PRIVATE_KEY" ]; then
    PRIVATE_KEY_OPTION=
  else
    PRIVATE_KEY_OPTION="-k $PRIVATE_KEY"
  fi
  
  FROM_EOA=$4
  if [ -z "$FROM_EOA" ]; then
    FROM_EOA_OPTION=
  else
    FROM_EOA_OPTION="-e $FROM_EOA"
  fi

  $NODE scripts/meta-tx-send \
    -m scripts/__data__/meta-tx-${META_TX_INPUT_NAME}.json \
    ${FROM_ADDRESS_OPTION} \
    ${PRIVATE_KEY_OPTION} \
    ${FROM_EOA_OPTION} || exit $?
}

sendMetaTx sr-issue
sendMetaTx sr-approve-by-commit
$NODE scripts/srr-transfer-by-reveal scripts/__data__/sr-transfer-by-reveal.json || exit $?

# remove the createSRRWithProof from bulk issue
# sendMetaTx bulk-prepare 
# $NODE scripts/bulk-create-srr scripts/__data__/bulk-create-srr.json || exit $?

sendMetaTx lum-set-english-name 
sendMetaTx lum-set-original-name 

$NODE scripts/sr-write-custom-history "GOMA Australia" 2 0xcc3b6344b207c582bd727005be2a5de5bbca7b46b590d9e9189f3a9a7ea8283e || exit $?
sendMetaTx sr-emit-history

# second transfer(send to LUM)
sendMetaTx sr-issue-for-intermediary
sendMetaTx sr-approve-by-commit-for-intermediary
$NODE scripts/srr-transfer-by-reveal scripts/__data__/sr-transfer-by-reveal-for-intermediary.json || exit $?

# second transfer(from EOA to EOA)
sendMetaTx sr-approve-by-commit 0xf1dbd215d72d99422693ca61f7bbecfcd0edb16f 0x173a37746c8efe3302af01617d0a493295165b2fb7e0b5045d616ecc39ee2aac true
$NODE scripts/srr-transfer-by-reveal scripts/__data__/sr-transfer-by-reveal-from-eoa-to-eoa.json || exit $?

# add and remove a user
# (verifies the add and remove scripts work and 
#  that the AddOwner/RemoveOwner events are indexed)
AN_OWNER=0x1030496192316950406F0a4d6C90DAF1B12DAfD4
$NODE scripts/lum-add-owner $LUW_ADDRESS $AN_OWNER
$NODE scripts/lum-remove-owner $LUW_ADDRESS $AN_OWNER

# admin-multi-send updateSRR
$NODE scripts/admin-multi-send -b 2 -i scripts/__data__/admin-multi-send-update-srr.json || exit $?

# approve and transfer for marketplaces
$NODE scripts/sr-approve.js 3 4 762614211005 # approve Account #4 with signer Account #3
$NODE scripts/sr-safe-transfer-from.js 4 3 4 762614211005 # transfer Account #3 -> Account #4 with signer Account #4

# setApprovalForAll and transfer for marketplace
$NODE scripts/sr-set-approval-for-all.js 4 3 true # setApprovalForAll Account #4 with signer Account #5
$NODE scripts/sr-safe-transfer-from.js 3 4 5 762614211005 # transfer Account #5 -> Account #3 with signer Account #3

# setLockExternalTransfer
$NODE scripts/sr-set-lock-external-transfer.js 762614211005 true
$NODE scripts/sr-set-lock-external-transfer.js 762614211005 false

# transferFromWithProvenance
sendMetaTx sr-issue3
sendMetaTx sr-transfer-from-with-provenance

# ownable
$NODE scripts/sr-transfer-ownership.js 0x6a36eb43496f23eed13636823a8288d28613a874

# generalized bulk
# 482308692111
sendMetaTx sr-issue4
# 129020582412
sendMetaTx sr-issue5
sendMetaTx generalized-bulk-prepare
$NODE scripts/generalized-bulk-approve-by-commitment scripts/__data__/generalized-bulk-approve-by-commitment.json || exit $?
$NODE scripts/generalized-bulk-transfer-from-with-provenance scripts/__data__/generalized-bulk-transfer-from-with-provenance.json || exit $?

# srr issue with recipient address
sendMetaTx sr-issue-to-another-recipient

# update custom history
$NODE scripts/sr-update-custom-history 1 "GOMA Australia" 0x001c7d6fdb9885b02689d0d76b34fe73e7706b3e9e841c16a8f8264077d197cd || exit $?

# enable ipfs
sendMetaTx sr-issue6-with-cid
sendMetaTx sr-transfer-from-with-provenance-with-cid
sendMetaTx sr-issue7-with-cid-to-another-recipient
$NODE scripts/sr-write-custom-history-with-cid "GOMA China" 2 bafkreibue6ax5qbviaq6rdcac3s3tjt7ihcgforfyf4wnl25tilcyoftsq || exit $?
$NODE scripts/sr-update-custom-history-with-cid 1  "GOMA Japan" bafkreibue6ax5qbviaq6rdcac3s3tjt7ihcgforfyf4wnl25tilcyoftsq || exit $?

# create collection with an SRR
sendMetaTx collection-create
sendMetaTx collection-sr-issue
