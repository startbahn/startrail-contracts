import _ from 'lodash'
import { Contract, utils as ethersUtils } from 'ethers'
import hre, { ethers, upgrades } from 'hardhat'
import { HardhatRuntimeEnvironment } from 'hardhat/types'
import {
    getAdministratorInstance,
  upgradeFromAdmin,
} from '../hardhat-helpers'
import { StartrailFeatureEnum } from '../types'
import { deployBulk } from './deploy-bulk'
import { deployStartrailRegistry } from './deploy-startrail-registry'
import {
    deployBeacon,
    deployLUM
} from './deploy-licensed-user-manager'
import {
    upgradeFeatureContract,
    upgradeCollectionFactory
} from '../collection/deployment-actions'
import { loadDeployJSON, updateContractsInitCodeHashJSON, updateDeployJSON } from './deploy-json'
import { updateImplJSON } from './impl-json'
import { StartrailPaymasterV01 } from '../../typechain-types'

const deployLicensedUserManagerV3 = async (hre: HardhatRuntimeEnvironment) => {
  console.log('\n=====   deployLicensedUserManagerV3 invoked    ======\n')

  const { lumProxy } = await deployLUM(hre, 'LicensedUserManagerV03')
  
  // Deploy LicensedUserWallet implementation
  console.log('\nDeploying LicensedUserWallet implementation...')
  const licensedUserWalletFactory = await hre.ethers.getContractFactory('LicensedUserWallet')
  const licensedUserWallet = await licensedUserWalletFactory.deploy()
  await licensedUserWallet.deployed()
  console.log(`LicensedUserWallet deployed at: ${licensedUserWallet.address}`)
  
  const licensedUserBeacon = await deployBeacon(hre)
  await upgradeFromAdmin(
    hre,
    licensedUserBeacon.address,
    licensedUserWallet.address
  )
  console.log(`Beacon upgraded successfully to implementation: ${licensedUserWallet.address}`)

  let entryPointAddress
  if(_.includes(['localhost', 'hardhat'], hre.network.name)) {
    //deploy entrypoint
    const entryPointFactory = await hre.ethers.getContractFactory('EntryPoint')
    const entryPoint = await entryPointFactory.deploy()
    await entryPoint.deployed()
    entryPointAddress = entryPoint.address
    console.log(`EntryPoint deployed at: ${entryPointAddress}`)
  } else {
    entryPointAddress = '0x4337084d9e255ff0702461cf8895ce9e3b5ff108'
  }

  const { data: initializeV3Data } = await lumProxy.populateTransaction.initializeV3(
    licensedUserBeacon.address,
    entryPointAddress,
  )
  const adminContract = await getAdministratorInstance(hre)
  await adminContract.execTransaction({
    to: lumProxy.address,
    data: initializeV3Data,
    waitConfirmed: true,
  })
  // call walletInitCodeHash() to get the init code hash and update the json
  const walletInitCodeHash = await lumProxy.walletInitCodeHash()
  await updateContractsInitCodeHashJSON(hre, {
    licensedUserWalletProxy: walletInitCodeHash,
  })

  // Upgrade StartrailRegistry to V26 to enable LUW direct-call modifier
  await deployStartrailRegistry(
    hre,
    'StartrailRegistryV26',
    'IDGeneratorV3',
    'OpenSeaMetaTransactionLibrary',
    'StartrailRegistryLibraryV1'
  );
  await deployBulk(hre, 'BulkV7')
  await upgradeFeatureContract({
    hre,
    featureName: StartrailFeatureEnum.OwnableFeature,
    upgradeVersion: {
      from: 'V01',
      to: 'V02',
    },
  })
  await upgradeFeatureContract({
    hre,
    featureName: StartrailFeatureEnum.SRRFeature,
    upgradeVersion: {
      from: 'V02',
      to: 'V03',
    }
  })
  await upgradeFeatureContract({
    hre,
    featureName: StartrailFeatureEnum.BulkFeature,
    upgradeVersion: {
      from: 'V03',
      to: 'V04',
    }
  })
  await upgradeFeatureContract({
    hre,
    featureName: StartrailFeatureEnum.SRRApproveTransferFeature,
    upgradeVersion: {
      from: 'V04',
      to: 'V05',
    }
  })
  await upgradeFeatureContract({
    hre,
    featureName: StartrailFeatureEnum.SRRHistoryFeature,
    upgradeVersion: {
      from: 'V01',
      to: 'V02',
    },
  })
  await upgradeFeatureContract({
    hre,
    featureName: StartrailFeatureEnum.SRRMetadataFeature,
    upgradeVersion: {
      from: 'V01',
      to: 'V02',
    },
  })
  await upgradeFeatureContract({
    hre,
    featureName: StartrailFeatureEnum.LockExternalTransferFeature,
    upgradeVersion: {
      from: 'V01',
      to: 'V02',
    },
  })
  await upgradeFeatureContract({
    hre,
    featureName: StartrailFeatureEnum.ERC721Feature,
    upgradeVersion: {
      from: 'V04',
      to: 'V05',
    },
  })
  await upgradeCollectionFactory(hre, 'CollectionFactoryV02')
  await deployStartrailPaymaster(hre)

  console.log('\n=====   deployLicensedUserManagerV3 completed    ======\n')
}

const deployStartrailPaymaster = async (hre: HardhatRuntimeEnvironment) => {
  console.log('\n=====   deployStartrailPaymaster invoked    ======\n')

  const {
    nameRegistryProxyAddress,
    collectionFactoryProxyAddress
  } = loadDeployJSON(hre)

  // get collection registry address from collection factory
  const collectionFactory = await hre.ethers.getContractAt('CollectionFactoryV01', collectionFactoryProxyAddress)
  const collectionRegistry = await collectionFactory.collectionRegistry()

  const startrailPaymasterFactory = await hre.ethers.getContractFactory('StartrailPaymasterV01')
  const paymaster: Contract = await upgrades.deployProxy(
    startrailPaymasterFactory,
    [nameRegistryProxyAddress, collectionRegistry],
    {
      kind: 'uups',
    }
  )
  const txReceipt = await paymaster.deployTransaction.wait()
  const paymasterImplAddress = ethers.utils.getAddress(
    ethers.utils.hexDataSlice(txReceipt.logs[0].topics[1], 12)
  )

  const proxy = paymaster as StartrailPaymasterV01

  updateDeployJSON(hre, {
    startrailPaymasterProxyAddress: proxy.address
  })
  updateImplJSON(hre, {
    startrailPaymasterImplementationAddress: paymasterImplAddress
  })

  console.log('\n=====   deployStartrailPaymaster completed    ======\n')
}

export { deployLicensedUserManagerV3 }