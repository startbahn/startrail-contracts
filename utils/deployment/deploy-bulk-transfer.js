
const { ContractKeys } = require('../../startrail-common-js/contracts/types')

const { nameRegistrySet } = require('../name-registry-set')

const { deployContract } = require('./deploy-contract')
const { updateDeployJSON, loadDeployJSON } = require('./deploy-json')
const { updateImplJSON } = require('./impl-json')
const { deployProxy } = require('./deploy-proxy')

const {
  suppressLoggerWarnings,
  getContract,
  upgradeFromAdmin,
} = require("../hardhat-helpers");

const deployBulkTransfer = async (hre, newImplementationName) => {
  const isUpgrade = newImplementationName !== undefined
  const implementationContractName = isUpgrade
    ? newImplementationName
    : 'BulkTransferV1'

  const {
    metaTxForwarderProxyAddress,
    nameRegistryProxyAddress,
    proxyAdminAddress,
  } = loadDeployJSON(hre)

  suppressLoggerWarnings(hre.ethers)
  const bulkTransferImpl = await deployContract(hre, implementationContractName)
  updateImplJSON(hre, {
    bulkTransferImplementationAddress: bulkTransferImpl.address,
  })
  console.log(
    `${implementationContractName} (implementation) deployed: ${bulkTransferImpl.address}`
  )

  //
  // Deploy Proxy
  // If this is not the initial release, upgrade the implementation in the proxy.
  //
  let bulkTransferProxy
  if (!isUpgrade) {
    console.log(
      `\nDeploying the ${implementationContractName} implementation:\n`
    )
    const bulkTransferImpl = await deployContract(
      hre,
      implementationContractName
    )
    updateImplJSON(hre, {
      bulkTransferImplementationAddress: bulkTransferImpl.address,
    })
    console.log(
      `${implementationContractName} (implementation) deployed: ${bulkTransferImpl.address}`
    )

    console.log(`\nDeploying the BulkTransfer proxy:\n`)
    bulkTransferProxy = await deployProxy({
      hre,
      implContract: bulkTransferImpl,
      proxyAdminAddress: proxyAdminAddress,
      initializerArgs: [
        nameRegistryProxyAddress,
        metaTxForwarderProxyAddress, // EIP2771 trusted forwarder
      ],
    })
    updateDeployJSON(hre, {
      bulkTransferProxyAddress: bulkTransferProxy.address,
    })
    console.log(`BulkTransfer (proxy) deployed: ${bulkTransferImpl.address}`)

    //
    // Set address in NameRegistry
    //

    await nameRegistrySet(
      hre,
      ContractKeys.BulkTransfer,
      bulkTransferProxy.address
    )
  } else {
    console.log(
      `\nUpgrading the BulkTransfer proxy to ` +
        `${implementationContractName}:\n`
    )
    bulkTransferProxy = await getContract(hre, 'BulkTransfer')
    await upgradeFromAdmin(
      hre,
      bulkTransferProxy.address,
      bulkTransferImpl.address
    )

    console.log(
      `BulkTransfer (proxy) updated with implementation ` +
        bulkTransferImpl.address
    )
  }

  return bulkTransferProxy.address
}

module.exports = { deployBulkTransfer }
