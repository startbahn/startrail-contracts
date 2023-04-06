/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-console */
/**
 * Generates a subgraph.yaml file specificly for a network deployment.
 *
 * Uses deployments.json for contract addresses etc.
 */
const fs = require('fs')
const path = require('path')
const yaml = require('js-yaml')
const _ = require('lodash')

const rootDir = path.dirname(path.dirname(require.main.filename))
const rootPath = (rootFile) => path.join(rootDir, rootFile)
const startrailPackagePath = rootPath(`..`)

if (process.argv.length !== 4 && process.argv.length !== 7) {
  console.log(`
  Usage: node ${process.argv[1]} <deployment name> [ <deploy.json path> <abis folder path> <startBlock> collection=disabled/enabled]
    
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

let enableCollectionFeature = false

//
// Collect and validate input arguments
//
const isStartrailPackageDeployment = process.argv.length === 4

let deploymentFilePath
if (isStartrailPackageDeployment) {
  deploymentFilePath = path.join(
    startrailPackagePath,
    'deployments',
    deploymentName === `local` ? `localhost` : deploymentName,
    `deploy.json`
  )
  enableCollectionFeature = process.argv[3] === 'collection=enabled'
} else {
  deploymentFilePath = process.argv[3]
  enableCollectionFeature = process.argv[6] === 'collection=enabled'
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

subgraphYamlTemplate.dataSources.forEach((ds, index) => {
  const contractName = ds.name

  const isCollectionFeature = contractName.toLowerCase().includes('collection')
  if (isCollectionFeature && !enableCollectionFeature) {
    // don't include collection
    delete subgraphYamlTemplate.dataSources[index]
    return
  }

  //
  // Get contractAddress
  //
  const addressKey = `${_.lowerFirst(contractName)}ProxyAddress`

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
  // ABI file path
  //
  const abiFilename = `${contractName}.json`
  let abiFilePath = path.join(abisPath, abiFilename)

  // Patch Bulk.json and BulkIssue.json for 2d array workaround
  if (contractName === 'Bulk' || contractName === 'BulkIssue') {
    // graph-cli does not support Solidity 2d arrays
    // see https://github.com/graphprotocol/graph-cli/issues/342
    // so here, strip out the ABI for the function using the 2d array.
    // it's not required by the subgraph.
    const bulkABI = JSON.parse(fs.readFileSync(abiFilePath))
    const bulkABIModified = bulkABI.filter(
      (e) => e.name !== 'createSRRWithProofMulti'
    )
    // abiFilePath = path.join(os.tmpdir(), `BulkIssue.json`)
    abiFilePath = path.join(`modifyBuild/abi/`, abiFilename)
    fs.writeFileSync(abiFilePath, JSON.stringify(bulkABIModified, null, 2))
  }

  //
  // Set dataSource properties
  //
  ds.mapping.abis[0].file = abiFilePath
  ds.network = network
  ds.source.startBlock = startBlock
  ds.source.address = contractAddress
})

if (enableCollectionFeature) {
  subgraphYamlTemplate.templates.forEach((template) => {
    const contractName = template.name
    const abiFilename = `${
      contractName === `Collection`
        ? `CollectionProxyFeaturesAggregate`
        : contractName
    }.json`

    template.mapping.abis[0].file = path.join(abisPath, abiFilename)
    template.network = network
  })
} else {
  // TODO: remove when enable/disable flag removed
  delete subgraphYamlTemplate.templates
}

// delete empty items
subgraphYamlTemplate.dataSources = _.filter(
  subgraphYamlTemplate.dataSources,
  (ds) => !!ds
)

fs.writeFileSync(
  rootPath(`subgraph.${deploymentName}.yaml`),
  yaml.safeDump(subgraphYamlTemplate)
)
