import { HardhatRuntimeEnvironment } from 'hardhat/types'
import {
  assertContractDeployed,
  getAdministratorInstance
} from '../hardhat-helpers'
import { loadDeployJSON } from './deploy-json'
import {
  deployBeacon,
  deployLUM
} from './deploy-licensed-user-manager'

const deployLicensedUserManagerV2 = async (hre: HardhatRuntimeEnvironment) => {
  console.log('\n=====   deployLicensedUserManagerV2 invoked    ======\n')

  const { lumProxy, lumProxyAddress } = await deployLUM(hre, 'LicensedUserManagerV02')
  const licensedUserBeacon = await deployBeacon(hre)
  const { data: initializeV2Data } = await lumProxy.populateTransaction.initializeV2(
    licensedUserBeacon.address
  )
  const adminContract = await getAdministratorInstance(hre)
  await adminContract.execTransaction({
    to: lumProxyAddress,
    data: initializeV2Data,
    waitConfirmed: true,
  })
}

export { deployLicensedUserManagerV2 }