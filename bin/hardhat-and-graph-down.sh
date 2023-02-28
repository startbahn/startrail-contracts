#!/bin/sh
cd `dirname $0`/../subgraph
yarn graph-down

cd ..
yarn hardhat-down