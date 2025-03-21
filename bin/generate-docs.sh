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
npx sol2uml -o $UML_DIR/LicensedUserManager.uml.svg -b LicensedUserManagerV02 contracts/licensedUser 2>/dev/null
npx sol2uml -o $UML_DIR/StartrailRegistry.uml.svg -b StartrailRegistryV25 contracts/startrailregistry 2>/dev/null
npx sol2uml -o $UML_DIR/MetaTxForwarder.uml.svg -b MetaTxForwarderV3 contracts/metaTx 2>/dev/null
npx sol2uml -o $UML_DIR/Bulk.uml.svg -b BulkV6 contracts/bulk 2>/dev/null
npx sol2uml -o $UML_DIR/CollectionFactory.uml.svg -b CollectionFactoryV01 contracts/collection 2>/dev/null
npx sol2uml -o $UML_DIR/CollectionProxy.uml.svg -b CollectionProxy contracts/collection 2>/dev/null
npx sol2uml -o $UML_DIR/StartrailCollectionFeatureRegistry.uml.svg -b StartrailCollectionFeatureRegistry contracts/collection/registry 2>/dev/null
npx sol2uml -o $UML_DIR/CollectionFeatures.uml.svg contracts/collection/features 2>/dev/null
npx sol2uml -o $UML_DIR/All.uml.svg contracts/ 2>/dev/null

CALLGRAPH_DIR=$OUT/callgraph
mkdir -p $CALLGRAPH_DIR
echo "\nGenerating function call graphs [$CALLGRAPH_DIR] ...\n"
npx surya graph `find contracts/licensedUser/ -name "*.sol"` 2>/dev/null | dot -Tpng > $CALLGRAPH_DIR/LicensedUserManager.callgraph.png 
npx surya graph `find contracts/startrailregistry/ -name "*.sol"` 2>/dev/null | dot -Tpng > $CALLGRAPH_DIR/StartrailRegistry.callgraph.png 
npx surya graph `find contracts/metaTx/ -name "*.sol"` 2>/dev/null | dot -Tpng > $CALLGRAPH_DIR/MetaTxForwarder.callgraph.png 
npx surya graph `find contracts/bulk/ -name "*.sol"` 2>/dev/null | dot -Tpng > $CALLGRAPH_DIR/Bulk.callgraph.png 
npx surya graph `find contracts/collection/ -name "*.sol"` 2>/dev/null | dot -Tpng > $CALLGRAPH_DIR/Collection.callgraph.png 
npx surya graph `find contracts/collection/features -name "*.sol"` 2>/dev/null | dot -Tpng > $CALLGRAPH_DIR/CollectionFeatures.callgraph.png 
npx surya graph `find contracts -name "*.sol"` 2>/dev/null | dot -Tpng > $CALLGRAPH_DIR/All.callgraph.png 

INHERIT_DIR=$OUT/inheritance
mkdir -p $INHERIT_DIR
echo "Generating inheritance graphs [$INHERIT_DIR] ...\n"
npx surya inheritance `find contracts/licensedUser/ -name "*.sol"` 2>/dev/null | dot -Tpng > $INHERIT_DIR/LicensedUserManager.inheritance.png 
npx surya inheritance `find contracts/startrailregistry/ -name "*.sol"` 2>/dev/null | dot -Tpng > $INHERIT_DIR/StartrailRegistry.inheritance.png 
npx surya inheritance `find contracts/metaTx/ -name "*.sol"` 2>/dev/null | dot -Tpng > $INHERIT_DIR/MetaTxForwarder.inheritance.png 
npx surya inheritance `find contracts/bulk/ -name "*.sol"` 2>/dev/null | dot -Tpng > $INHERIT_DIR/BulkIssue.inheritance.png 
npx surya inheritance `find contracts/collection/ -name "*.sol"` 2>/dev/null | dot -Tpng > $INHERIT_DIR/Collection.inheritance.png 
npx surya inheritance `find contracts/ -name "*.sol"` 2>/dev/null | dot -Tpng > $INHERIT_DIR/All.inheritance.png 

NATSPEC_DIR=$OUT/natspec
echo "Generating Natspec markdown with dodoc hardhat plugin [$NATSPEC_DIR] ...\n"
npx hardhat dodoc

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
