#!/bin/sh

LOG=/tmp/startrail-local-`date +%s`.log
SUBGRAPH_DIR=`dirname $0`/../subgraph

exitWithMsg() {
  tput setaf 1
  echo "\nStartup has failed!\n"
  tput sgr0
  echo "Here are the last 10 lines of the log:\n"
  echo "---------------------------------------------------------------"
  tail $LOG
  echo "--------------------------------------------------------------\n"
  echo "Check the full log file @ $LOG for more details\n"
  exit 1
}

echo "\n=====   Starting Startrail   ====\n"
echo "Startup logfile: ${LOG}\n"

echo "Shutdown any running containers ...\n"
yarn down > $LOG 2>&1

echo "Starting servers ...\n"
yarn hardhat-up-bg >> $LOG 2>&1

cd $SUBGRAPH_DIR
yarn graph-up-bg >> $LOG 2>&1
cd - > /dev/null

`dirname $0`/../subgraph/bin/wait_for_subgraph
if test "$?" = "1"; then
  echo "Timeout waiting for subgraph!"
  exit 1
fi

echo "Deploying contracts ...\n"
yarn deploy-local >> $LOG 2>&1 || exitWithMsg

echo "Seeding contract data ...\n"
yarn seed-minimal >> $LOG 2>&1 || exitWithMsg

echo "Deploying subgraph ...\n"
cd $SUBGRAPH_DIR
yarn codegen >> $LOG 2>&1 || exitWithMsg
yarn build >> $LOG 2>&1 || exitWithMsg
yarn create-local >> $LOG 2>&1 || exitWithMsg
yarn deploy-local >> $LOG 2>&1 || exitWithMsg
cd - > /dev/null

echo "Stopping IPFS node - it's not needed after subgraph deployment and it sucks bandwidth all day ...\n"
docker stop subgraph-ipfs

echo ""
echo " _______ _______ _______  ______ _______ _______ ______ "
echo " |______    |    |_____| |_____/    |    |______ |     \\"
echo " ______|    |    |     | |    \\_    |    |______ |_____/\n\n"

echo "Hardhat JSONRPC: http://localhost:8545/"
echo "Hardhat Log: yarn hardhat-log"
echo "Hardhat Accounts: yarn accounts\n"

echo "Startrail Deployment Information: yarn run info"
echo "Startrail Seed Extra Data: yarn seed-extended"

echo "Subgraph iGraphQL: http://localhost:8000/subgraphs/name/startbahn/startrail-local"
echo "Subgraph Log: yarn graph-log\n"

echo "\nWhen your finished run 'yarn down' to tear it all down"
