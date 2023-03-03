#!/bin/sh

RESULT=`command -v dot`

if [ -z "$RESULT" ]
then
  echo "ERROR: dot is not installed. \n" >&2
  echo "Please install graphviz with \"sudo apt install graphviz\".\n\n" >&2
  exit 1
fi

H="npx hardhat"
S="npx surya"

OUT=docs
mkdir -p $OUT

UML_DIR=$OUT/uml
mkdir -p $UML_DIR
echo "\nGenerating UML diagrams [$UML_DIR]...\n"
npx sol2uml -o $UML_DIR/LicensedUserManager.uml.svg -b LicensedUserManager contracts/licensedUser 2>/dev/null
npx sol2uml -o $UML_DIR/StartrailRegistry.uml.svg -b StartrailRegistryV9 contracts/startrailregistry 2>/dev/null
npx sol2uml -o $UML_DIR/MetaTxForwarder.uml.svg -b MetaTxForwarderV2 contracts/metaTx 2>/dev/null
npx sol2uml -o $UML_DIR/BulkIssue.uml.svg -b BulkIssueV3 contracts/bulk 2>/dev/null
npx sol2uml -o $UML_DIR/All.uml.svg contracts/ 2>/dev/null

CALLGRAPH_DIR=$OUT/callgraph
mkdir -p $CALLGRAPH_DIR
echo "\nGenerating function call graphs [$CALLGRAPH_DIR] ...\n"
npx surya graph `find contracts/licensedUser/ -name "*.sol"` 2>/dev/null | dot -Tpng > $CALLGRAPH_DIR/LicensedUserManager.callgraph.png 
npx surya graph `find contracts/startrailregistry/ -name "*.sol"` 2>/dev/null | dot -Tpng > $CALLGRAPH_DIR/StartrailRegistry.callgraph.png 
npx surya graph `find contracts/metaTx/ -name "*.sol"` 2>/dev/null | dot -Tpng > $CALLGRAPH_DIR/MetaTxForwarder.callgraph.png 
npx surya graph `find contracts/bulk/ -name "*.sol"` 2>/dev/null | dot -Tpng > $CALLGRAPH_DIR/BulkIssue.callgraph.png 
npx surya graph `find contracts -name "*.sol"` 2>/dev/null | dot -Tpng > $CALLGRAPH_DIR/All.callgraph.png 

INHERIT_DIR=$OUT/inheritance
mkdir -p $INHERIT_DIR
echo "Generating inheritance graphs [$INHERIT_DIR] ...\n"
npx surya inheritance `find contracts/licensedUser/ -name "*.sol"` 2>/dev/null | dot -Tpng > $INHERIT_DIR/LicensedUserManager.inheritance.png 
npx surya inheritance `find contracts/startrailregistry/ -name "*.sol"` 2>/dev/null | dot -Tpng > $INHERIT_DIR/StartrailRegistry.inheritance.png 
npx surya inheritance `find contracts/metaTx/ -name "*.sol"` 2>/dev/null | dot -Tpng > $INHERIT_DIR/MetaTxForwarder.inheritance.png 
npx surya inheritance `find contracts/bulk/ -name "*.sol"` 2>/dev/null | dot -Tpng > $INHERIT_DIR/BulkIssue.inheritance.png 
npx surya inheritance `find contracts/ -name "*.sol"` 2>/dev/null | dot -Tpng > $INHERIT_DIR/All.inheritance.png 

NATSPEC_DIR=$OUT/natspec
echo "Generating Natspec markdown with dodoc hardhat plugin [$NATSPEC_DIR] ...\n"
npx hardhat dodoc 2> /dev/null

# dodoc generate docs for openzeppelin contracts under node_modules
#  couldn't see a way to filter these out so remove the directory here
echo "Removing natspec generated for contracts under node_modules/ ($NATSPEC_DIR/elin,$NATSPEC_DIR/te) ...\n"
rm -rf $NATSPEC_DIR/elin $NATSPEC_DIR/te

#
# Storage Layouts - DISABLED because solc output JSON does not contain storageLayout information
#

# printStorageLayout() {
#   node -e "j=JSON.parse(fs.readFileSync(process.cwd()+'/.deployments/localhost/$1.json').toString());console.log(JSON.stringify(j.storageLayout,null,2))"
# }

# STORAGE_DIR=$OUT/storageLayout
# mkdir -p $STORAGE_DIR
# echo "Outputing storage layouts [$STORAGE_DIR]...\n"

# printStorageLayout StartrailRegistry > $STORAGE_DIR/StartrailRegistry.storageLayout.json
# printStorageLayout LicensedUserManager > $STORAGE_DIR/LicensedUserManager.storageLayout.json
# printStorageLayout MetaTxForwarder > $STORAGE_DIR/MetaTxForwarder.storageLayout.json
# printStorageLayout BulkIssue > $STORAGE_DIR/BulkIssue.storageLayout.json
