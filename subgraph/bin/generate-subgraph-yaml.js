/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-console */
/**
 * Generates a subgraph.yaml file specificly for a network deployment.
 *
 * Uses deployments.json for contract addresses etc.
 */
const fs = require('fs')
const os = require('os')
const path = require('path')
const yaml = require('js-yaml')

const rootDir = path.dirname(path.dirname(require.main.filename))
const rootPath = (rootFile) => path.join(rootDir, rootFile)
const startrailPackagePath = rootPath(`..`)

if (process.argv.length !== 3 && process.argv.length !== 6) {
  console.log(`
  Usage: node ${process.argv[1]} <deployment name> [ <deploy.json path> <abis folder path> <startBlock> ]
    
  Script can be run in one of 2 ways:

  1) Pass a single argument which is the name of a deployment under 
     'startrail/deployments'.

     In this case all contract address information and ABIs are available under
     the startrail package and startBlock information in ./deployments.json so
     no extra arguments are required.

  2) Pass in all the information explicitly including a logical name for the
     deployment.
`)
  process.exit(1)
}

const deploymentName = process.argv[2]
let network
if (['local', 'mainnet'].indexOf(deploymentName) !== -1) {
  network = deploymentName
} else if (deploymentName === 'polygon') {
  network = 'matic'
} else if (deploymentName.startsWith('mumbai')) {
  network = 'mumbai'
} else {
  throw new Error(`network unknown for deployment [${deploymentName}]`)
}

//
// Collect and validate input arguments
//
const isStartrailPackageDeployment = process.argv.length === 3

let deploymentFilePath
if (isStartrailPackageDeployment) {
  deploymentFilePath = path.join(
    startrailPackagePath,
    'deployments',
    deploymentName === `local` ? `localhost` : deploymentName,
    `deploy.json`
  )
} else {
  deploymentFilePath = process.argv[3]
}

const contractAddresses = JSON.parse(fs.readFileSync(deploymentFilePath))

let abisPath
if (isStartrailPackageDeployment) {
  abisPath = path.join(startrailPackagePath, 'abi')
} else {
  abisPath = process.argv[4]
}

if (!fs.existsSync(abisPath)) {
  console.error(`ERROR: abisPath not found at [${abisPath}]\n`)
  process.exit(2)
}

let startBlockArgument
if (!isStartrailPackageDeployment) {
  startBlockArgument = Number.parseInt(process.argv[5])
  if (!Number.isInteger(startBlockArgument)) {
    console.error(
      `ERROR: A startBlock MUST be given when specifiying a deployment path\n`
    )
    process.exit(3)
  }
}

const subgraphDeployments = JSON.parse(
  fs.readFileSync(rootPath('deployments.json')).toString()
)
const subgraphYamlTemplate = yaml.safeLoad(
  fs.readFileSync(rootPath('subgraph.template.yaml'), 'utf8')
)

subgraphYamlTemplate.dataSources.forEach((ds) => {
  //
  // Get contractAddress
  //
  const contractName = ds.name
  const addressKey = `${contractName[0].toLowerCase()}${contractName.substring(
    1
  )}ProxyAddress`
  const contractAddress = contractAddresses[addressKey]
  if (!contractAddress) {
    console.error(
      `ERROR: contract address not set for contract '${contractName}'\n`
    )
    process.exit(4)
  }

  //
  // Get and set startBlock
  //
  let startBlock
  if (isStartrailPackageDeployment) {
    startBlock = subgraphDeployments[deploymentName][contractName]?.startBlock
    if (!startBlock) {
      console.error(
        `ERROR: startBlock not set for contract '${contractName}' in ./deployments.json`
      )
      process.exit(5)
    }
  } else {
    startBlock = startBlockArgument
  }

  //
  // ABI file path AND BulkIssue.json and Bulk.json 2d array workaround
  //
  let abiFilePath = path.join(abisPath, `${contractName}.json`)
  if (contractName === 'BulkIssue') {
    // graph-cli does not support Solidity 2d arrays
    // see https://github.com/graphprotocol/graph-cli/issues/342
    // so here, strip out the ABI for the function using the 2d array.
    // it's not required by the subgraph.
    const bulkIssueABI = JSON.parse(fs.readFileSync(abiFilePath))
    const bulkissueABIModified = bulkIssueABI.filter(
      (e) => e.name !== 'createSRRWithProofMulti'
    )
    abiFilePath = path.join(os.tmpdir(), `BulkIssue.json`)
    fs.writeFileSync(abiFilePath, JSON.stringify(bulkissueABIModified, null, 2))
  }
  if (contractName === 'Bulk') {
    const bulkABI = JSON.parse(fs.readFileSync(abiFilePath))
    const bulkABIModified = bulkABI.filter(
      (e) => e.name !== 'createSRRWithProofMulti'
    )
    abiFilePath = path.join(os.tmpdir(), `Bulk.json`)
    fs.writeFileSync(abiFilePath, JSON.stringify(bulkABIModified, null, 2))
  }

  //
  // Set dataSource properties
  //
  ds.network = network
  ds.source.address = contractAddress
  ds.source.startBlock = startBlock
  ds.mapping.abis[0].file = abiFilePath
})

fs.writeFileSync(
  rootPath(`subgraph.${deploymentName}.yaml`),
  yaml.safeDump(subgraphYamlTemplate)
)
