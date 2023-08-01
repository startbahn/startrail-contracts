import { Command } from 'commander'
import hre from 'hardhat'
import { HardhatRuntimeEnvironment } from 'hardhat/types'

import { updateImplJSON } from '../../utils/deployment/impl-json'
import {
  getAdministratorInstance,
  getContract,
} from '../../utils/hardhat-helpers'

/**
 * This script upgrades contracts deployed with UUPSUpgradeable implementations.
 *
 * At this stage CollectionFactory is the only one but all new contracts
 * going forward will also use this.
 *
 * All other contracts were previously deployed manualy with a custom proxy and should use the script
 * upgrade-contract.js
 *
 * @param hre HardhatRuntimeEnvironment
 * @param proxyName Name of proxy contract to upgrade (eg. CollectionFactory)
 * @param newImplementationName Name of the new implementation contract (eg. CollectionFactoryV03)
 * @returns
 */
const upgradeContract = async (
  hre: HardhatRuntimeEnvironment,
  proxyName: string,
  newImplementationName: string
) => {
  console.log(
    `\nUpgrading ${proxyName} with implementation ${newImplementationName}:\n`
  )
  const administratorContract = await getAdministratorInstance(hre)
  const proxyContract = await getContract(hre, proxyName)

  const newImplFactory = await hre.ethers.getContractFactory(
    newImplementationName
  )
  const newImpl = await newImplFactory.deploy().then((tx) => tx.deployed())
  console.log(
    `Deployed implementation to ${JSON.stringify(newImpl.address, null, 2)}`
  )

  const { data: upgradeToCalldata } =
    await proxyContract.populateTransaction.upgradeTo(newImpl.address)

  const txReceipt = await administratorContract.execTransaction({
    to: proxyContract.address,
    data: upgradeToCalldata,
    waitConfirmed: true,
  })
  console.log(`txReceipt: ${JSON.stringify(txReceipt, null, 2)}`)

  updateImplJSON(hre, {
    collectionFactoryImplementationAddress: newImpl.address,
  })
}

const program = new Command()
program
  .requiredOption('-p, --proxy <proxyName>', 'Name of the proxy to upgrade')
  .requiredOption(
    '-i, --implementation [implementation]',
    'Name of the implementation contract to upgrade to'
  )
program.parse(process.argv)

const programOpts = program.opts()
const { implementation: newImplementationName, proxy: proxyName } = programOpts

upgradeContract(hre, proxyName, newImplementationName).catch((error) => {
  console.error(error)
  process.exit(1)
})
