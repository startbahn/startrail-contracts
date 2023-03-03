import hre from 'hardhat'

//
// see hardhat plugin https://www.npmjs.com/package/hardhat-storage-layout
//
// This script will print to stdout a table of storage layouts for every contract.
//
// You can see the order and size of the slots in storage.
//
// NOTE on compile the storage layout plugin generates storageLayout entries
// to a file in `./artifacts/build-info/<spme digest>.json`.
// These can be inspected also but the main details are available in the report
// produced by this script.
//

async function main() {
  await hre.storageLayout.export()
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
