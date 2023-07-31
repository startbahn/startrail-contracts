import {
  CollectionFactoryV01,
  StartrailCollectionFeatureRegistry,
} from '../typechain-types'

/* eslint-disable no-console */
const { green, red } = require('colors')
const hre = require('hardhat')
const chunk = require('lodash/chunk')
const {
  metaTxRequests,
} = require('../startrail-common-js/meta-tx/meta-tx-request-registry')

const { loadDeployJSON } = require('../utils/deployment/deploy-json')
const {
  getAdministratorInstance,
  getContract,
  suppressLoggerWarnings,
} = require('../utils/hardhat-helpers')

const deployment = loadDeployJSON(hre)
const { ethers } = hre

const nameRegistryInfo = async () => {
  const nr = await getContract(hre, 'NameRegistry')
  console.log(`address: ${nr.address}\n`)

  const callGet = (idx, label) =>
    nr.get(idx).then((addr) => ({ idx, label, addr }))

  const printGetResult = ({ idx, label, addr }) =>
    console.log(`get(${idx}) ${label}: ${addr}`)

  await Promise.all([
    callGet(1, 'Administrator'),
    callGet(2, 'AdminProxy'),
    callGet(3, 'LicensedUserManager'),
    callGet(4, 'StartrailRegistry'),
    callGet(5, 'BulkIssue'),
    callGet(6, 'MetaTxForwarder'),
    callGet(7, 'BulkTransfer'),
  ]).then((results) => results.forEach(printGetResult))
}

const adminInfo = async () => {
  const admin = await getAdministratorInstance(hre)
  console.log(`address: ${deployment.startrailAdministratorAddress}\n`)
  console.log(`getOwners:`)
  const owners = [...(await admin.contract.getOwners())]
  owners.sort().forEach((addr) => console.log(`  ${addr}`))
  console.log(`\nnonce: ${await admin.contract.nonce()}`)
}

const mtfInfo = async () => {
  const mtf = await getContract(hre, 'MetaTxForwarder')
  console.log(`address: ${mtf.address}\n`)

  console.log(
    `MetaTxRequestTypes (lookup all in meta-tx-request-registry.ts):\n`
  )
  // chunked to avoid rate limiting errors from some providers
  const mtrKeyChunks = chunk(Object.keys(metaTxRequests), 5)
  for (const mtrKeys of mtrKeyChunks) {
    const results = await Promise.all(
      mtrKeys.map((key) =>
        mtf
          .requestTypes(metaTxRequests[key].eip712TypeHash)
          .then((details) => ({ key, details }))
          .catch(() => console.warn(`lookup failed for ${key}`))
      )
    ).then((rArr) => rArr.filter((r) => r !== undefined))
    results.forEach((result) =>
      console.log(
        `\t${result.key}: ${
          result.details[1] !== `0x00000000`
            ? `${green('REGISTERED')} [destAddr: ${result.details[0].substring(
                0,
                7
              )} destFn: ${result.details[1]}]`
            : red('NOT REGISTERED')
        }`
      )
    )
  }
}

const srInfo = async () => {
  suppressLoggerWarnings(ethers)
  const sr = await getContract(hre, 'StartrailRegistry')
  console.log(`address: ${sr.address}\n`)

  console.log(`nameRegistryAddress: ${await sr.nameRegistryAddress()}`)
  console.log(`trustedForwarder: ${await sr.getTrustedForwarder()}`)
  console.log(`name: ${await sr.name()}`)
  console.log(`symbol: ${await sr.symbol()}`)
  console.log(
    `contractURI: ${await sr.contractURI().catch((err) => {
      // it's not yet implemented everywhere so catch this
    })}`
  )
  console.log(`owner: ${await sr.owner()}`)
  if (hre.network.name === 'polygon') {
    const tokenId = `36491769`
    console.log(
      `\ntokenURI('${tokenId}'): ${await sr['tokenURI(uint256)'](tokenId)}`
    )

    const metadataDigest =
      '0x9300d0065e82c9cde4763976f80e50389cedd185cd3bce390411df00f38ab5e5'
    console.log(
      `tokenURI('${metadataDigest}'): ${await sr['tokenURI(string)'](
        metadataDigest
      )}`
    )
  }

  console.log(`\nCustom History Types:\n`)
  let custHistFinished = false
  let custHistId = 1
  do {
    const custHistName = await sr.customHistoryTypeNameById(custHistId)
    if (!custHistName || custHistName === '') {
      custHistFinished = true
    } else {
      console.log(`${custHistId}: ${custHistName}`)
      custHistId++
    }
  } while (!custHistFinished)
}

const featureRegistryInfo = async () => {
  const fr: StartrailCollectionFeatureRegistry = await getContract(
    hre,
    'StartrailCollectionFeatureRegistry'
  )
  console.log(`address: ${fr.address}\n`)

  console.log(`facets: ${JSON.stringify(await fr.facets(), null, 2)}\n`)
}

const collectionFactoryInfo = async () => {
  const cf: CollectionFactoryV01 = await getContract(hre, 'CollectionFactory')
  console.log(`address: ${cf.address}`)
  console.log(`owner: ${await cf.owner()}\n`)
}

const main = async () => {
  console.log(`\n=======  Smart contract addresses (deploy.json)  =======\n`)
  console.log(deployment)

  console.log(`\n\n=======  NameRegistry properties  =======\n`)
  await nameRegistryInfo()
  console.log(`\n`)

  console.log(`=======  StartrailAdministrator  =======\n`)
  await adminInfo()

  console.log(`\n\n=======  MetaTxForwarder  =======\n`)
  await mtfInfo()

  console.log(`\n\n=======  StartrailCollectionFeatureRegistry  =======\n`)
  await featureRegistryInfo()

  console.log(`\n\n=======  StartrailRegistry properties  =======\n`)
  await srInfo()

  console.log(`\n\n=======  CollectionFactory properties  =======\n`)
  await collectionFactoryInfo()

  console.log(`\n`)
}

main()
