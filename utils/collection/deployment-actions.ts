import { Contract, utils as ethersUtils } from 'ethers'
import hre, { ethers, upgrades } from 'hardhat'
import { HardhatRuntimeEnvironment } from 'hardhat/types'
import stripHexPrefix from 'strip-hex-prefix'

import {
  CollectionFactoryV01,
  MetaTxForwarderV3,
  StartrailCollectionFeatureRegistry,
} from '../../typechain-types'
import {
  loadDeployJSON,
  updateContractsInitCodeHashJSON,
  updateDeployJSON,
} from '../deployment/deploy-json'
import { updateImplJSON } from '../deployment/impl-json'
import {
  getAdministratorInstance,
  getContract,
  getContractFactory,
} from '../hardhat-helpers'
import ercInterfaces from './erc-interfaces'
import { deployFeature, upgradeFeature } from './utils'
import {
  StartrailUpgradeVersion,
  StartrailFeatureEnum,
  StartrailFeature,
} from '../types'

const loggingOn = true

const setCollectionRegistryOnCollectionFactory = async (
  hre: HardhatRuntimeEnvironment,
  cf: CollectionFactoryV01,
  metaTxForwarder: MetaTxForwarderV3
) => {
  const crAddress = await cf.collectionRegistry()
  const adminContract = await getAdministratorInstance(hre)
  const { data: setCREncoded } =
    await metaTxForwarder.populateTransaction.setCollectionRegistry(crAddress)

  console.log(`\nSending MetaTxForwarder.setCollectionRegistry`)
  await adminContract.execTransaction({
    to: metaTxForwarder.address,
    data: setCREncoded,
    waitConfirmed: true,
  })

  if (crAddress != (await metaTxForwarder.collectionRegistry())) {
    throw new Error(`MetaTxForwarder.setCollectionRegistry failed`)
  }
}

const deployERC721Feature = async (
  featureRegistry: StartrailCollectionFeatureRegistry,
  version: string
): Promise<Contract> => {
  const contractName = `${StartrailFeatureEnum.ERC721Feature}${version}`
  const featureFactory = await getContractFactory(hre, contractName)
  const initData = featureFactory.interface.encodeFunctionData(
    featureFactory.interface.functions[
      `__ERC721Feature_initialize(string,string)`
    ],
    ['IMPLEMENTATION_ONLY', 'IMPL']
  )
  return deployFeature({
    featureRegistry,
    feature: {
      name: StartrailFeatureEnum.ERC721Feature,
      version,
    },
    supportedInterfaceIds: [ercInterfaces.ERC721, ercInterfaces.ERC721Metadata],
    initData,
  })
}

const deployLockExternalTransferFeature = async (
  featureRegistry: StartrailCollectionFeatureRegistry,
  version: string
): Promise<Contract> =>
  deployFeature({
    featureRegistry,
    feature: {
      name: StartrailFeatureEnum.LockExternalTransferFeature,
      version,
    },
  })

const deploySRRFeature = async (
  featureRegistry: StartrailCollectionFeatureRegistry,
  version: string
): Promise<Contract> => {
  const { idGeneratorLibraryAddress } = loadDeployJSON(hre)
  return deployFeature({
    featureRegistry,
    feature: {
      name: StartrailFeatureEnum.SRRFeature,
      version,
    },
    linkLibraries: {
      IDGeneratorV3: idGeneratorLibraryAddress,
    },
  })
}

const deploySRRApproveTransferFeature = async (
  featureRegistry: StartrailCollectionFeatureRegistry,
  version: string
): Promise<Contract> => {
  return deployFeature({
    featureRegistry,
    feature: {
      name: StartrailFeatureEnum.SRRApproveTransferFeature,
      version,
    },
  })
}

const deploySRRMetadataFeature = async (
  featureRegistry: StartrailCollectionFeatureRegistry,
  version: string
): Promise<Contract> => {
  return deployFeature({
    featureRegistry,
    feature: {
      name: StartrailFeatureEnum.SRRMetadataFeature,
      version,
    },
  })
}

const deploySRRHistoryFeature = async (
  featureRegistry: StartrailCollectionFeatureRegistry,
  version: string
): Promise<Contract> => {
  return deployFeature({
    featureRegistry,
    feature: {
      name: StartrailFeatureEnum.SRRHistoryFeature,
      version,
    },
  })
}

const deployERC2981RoyaltyFeature = async (
  featureRegistry: StartrailCollectionFeatureRegistry,
  version: string
): Promise<Contract> => {
  return deployFeature({
    featureRegistry,
    feature: {
      name: StartrailFeatureEnum.ERC2981RoyaltyFeature,
      version,
    },
    supportedInterfaceIds: [ercInterfaces.ERC2981],
  })
}

const deployBulkFeature = async (
  featureRegistry: StartrailCollectionFeatureRegistry,
  version: string
): Promise<Contract> => {
  const { idGeneratorLibraryAddress } = loadDeployJSON(hre)
  return deployFeature({
    featureRegistry,
    feature: {
      name: StartrailFeatureEnum.BulkFeature,
      version,
    },
    linkLibraries: {
      IDGeneratorV3: idGeneratorLibraryAddress,
    },
  })
}

const upgradeERC721Feature = async (
  hre: HardhatRuntimeEnvironment,
  upgradeVersion: StartrailUpgradeVersion
): Promise<Contract> => {
  return upgradeFeature({
    hre,
    featureName: StartrailFeatureEnum.ERC721Feature,
    upgradeVersion,
  })
}

const upgradeSRRFeature = async (
  hre: HardhatRuntimeEnvironment,
  upgradeVersion: StartrailUpgradeVersion
): Promise<Contract> => {
  const { idGeneratorLibraryAddress } = loadDeployJSON(hre)
  return upgradeFeature({
    hre,
    featureName: StartrailFeatureEnum.SRRFeature,
    upgradeVersion,
    linkLibraries: {
      IDGeneratorV3: idGeneratorLibraryAddress,
    },
  })
}

const upgradeERC2981RoyaltyFeature = async (
  hre: HardhatRuntimeEnvironment,
  upgradeVersion: StartrailUpgradeVersion
): Promise<Contract> => {
  return upgradeFeature({
    hre,
    featureName: StartrailFeatureEnum.ERC2981RoyaltyFeature,
    upgradeVersion,
  })
}

const upgradeSRRMetadataFeature = async (
  hre: HardhatRuntimeEnvironment,
  upgradeVersion: StartrailUpgradeVersion
): Promise<Contract> => {
  return upgradeFeature({
    hre,
    featureName: StartrailFeatureEnum.SRRMetadataFeature,
    upgradeVersion,
  })
}

const upgradeSRRApproveTransferFeature = async (
  hre: HardhatRuntimeEnvironment,
  upgradeVersion: StartrailUpgradeVersion
): Promise<Contract> => {
  return upgradeFeature({
    hre,
    featureName: StartrailFeatureEnum.SRRApproveTransferFeature,
    upgradeVersion,
  })
}

const upgradeLockExternalTransferFeature = async (
  hre: HardhatRuntimeEnvironment,
  upgradeVersion: StartrailUpgradeVersion
): Promise<Contract> => {
  return upgradeFeature({
    hre,
    featureName: StartrailFeatureEnum.LockExternalTransferFeature,
    upgradeVersion,
  })
}

const upgradeSRRHistoryFeature = async (
  hre: HardhatRuntimeEnvironment,
  upgradeVersion: StartrailUpgradeVersion
): Promise<Contract> => {
  return upgradeFeature({
    hre,
    featureName: StartrailFeatureEnum.SRRHistoryFeature,
    upgradeVersion,
  })
}

const upgradeBulkFeature = async (
  hre: HardhatRuntimeEnvironment,
  upgradeVersion: StartrailUpgradeVersion
): Promise<Contract> => {
  const { idGeneratorLibraryAddress } = loadDeployJSON(hre)
  return upgradeFeature({
    hre,
    featureName: StartrailFeatureEnum.BulkFeature,
    upgradeVersion,
    linkLibraries: {
      IDGeneratorV3: idGeneratorLibraryAddress,
    },
  })
}

/**
 * Deploys a Startrail feature contract based on the specified feature information.
 * @param params - An object containing the feature registry and feature details.
 * @param params.featureRegistry - The Startrail feature registry contract instance.
 * @param params.feature - The Startrail feature to be deployed.
 * @returns A promise that resolves when the deployment is completed.
 * @throws Will throw an error if the deployment function for the specified feature is not found.
 */
const deployFeatureContract = async (params: {
  featureRegistry: StartrailCollectionFeatureRegistry
  feature: StartrailFeature
}) => {
  const {
    feature: { name, version },
    featureRegistry,
  } = params

  switch (name) {
    case StartrailFeatureEnum.BulkFeature:
      return deployBulkFeature(featureRegistry, version)
    case StartrailFeatureEnum.ERC2981RoyaltyFeature:
      return deployERC2981RoyaltyFeature(featureRegistry, version)
    case StartrailFeatureEnum.ERC721Feature:
      return deployERC721Feature(featureRegistry, version)
    case StartrailFeatureEnum.LockExternalTransferFeature:
      return deployLockExternalTransferFeature(featureRegistry, version)
    case StartrailFeatureEnum.SRRApproveTransferFeature:
      return deploySRRApproveTransferFeature(featureRegistry, version)
    case StartrailFeatureEnum.SRRFeature:
      return deploySRRFeature(featureRegistry, version)
    case StartrailFeatureEnum.SRRHistoryFeature:
      return deploySRRHistoryFeature(featureRegistry, version)
    case StartrailFeatureEnum.SRRMetadataFeature:
      return deploySRRMetadataFeature(featureRegistry, version)
    default:
      throw new Error(`Deploy of ${name} not supported yet`)
  }
}

/**
 * Upgrades a Startrail feature contract to the specified version.
 * @param params - An object containing the Hardhat runtime environment, feature name, and upgrade version.
 * @param params.hre - The Hardhat runtime environment.
 * @param params.featureName - The name of the Startrail feature to be upgraded.
 * @param params.upgradeVersion - The version to upgrade the feature contract to.
 * @returns - A promise that resolves when the upgrade is completed.
 * @throws Will throw an error if the upgrade function for the specified feature is not found.
 */
const upgradeFeatureContract = async (params: {
  hre: HardhatRuntimeEnvironment
  featureName: StartrailFeatureEnum
  upgradeVersion: StartrailUpgradeVersion
}) => {
  const { hre, featureName, upgradeVersion } = params

  switch (featureName) {
    case StartrailFeatureEnum.BulkFeature:
      return upgradeBulkFeature(hre, upgradeVersion)
    case StartrailFeatureEnum.ERC2981RoyaltyFeature:
      return upgradeERC2981RoyaltyFeature(hre, upgradeVersion)
    case StartrailFeatureEnum.ERC721Feature:
      return upgradeERC721Feature(hre, upgradeVersion)
    case StartrailFeatureEnum.LockExternalTransferFeature:
      return upgradeLockExternalTransferFeature(hre, upgradeVersion)
    case StartrailFeatureEnum.SRRApproveTransferFeature:
      return upgradeSRRApproveTransferFeature(hre, upgradeVersion)
    case StartrailFeatureEnum.SRRFeature:
      return upgradeSRRFeature(hre, upgradeVersion)
    case StartrailFeatureEnum.SRRHistoryFeature:
      return upgradeSRRHistoryFeature(hre, upgradeVersion)
    case StartrailFeatureEnum.SRRMetadataFeature:
      return upgradeSRRMetadataFeature(hre, upgradeVersion)
    default:
      throw new Error(`Upgrade of ${featureName} not supported yet`)
  }
}

/**
 * proxy init code prefixes from @solidstate/contracts/factory/MinimalProxyFactory.sol
 * (@solidstate/contracts": "0.0.40")
 */
const computeCollectionProxyInitCodeHash = async (
  collectionProxyImplementationAddress: string
): Promise<string> => {
  const MINIMAL_PROXY_INIT_CODE_PREFIX =
    '0x3d602d80600a3d3981f3363d3d373d3d3d363d73' // strip _

  const MINIMAL_PROXY_INIT_CODE_SUFFIX = '0x5af43d82803e903d91602b57fd5bf3'

  const encodedInput =
    stripHexPrefix(MINIMAL_PROXY_INIT_CODE_PREFIX) +
    stripHexPrefix(collectionProxyImplementationAddress) +
    stripHexPrefix(MINIMAL_PROXY_INIT_CODE_SUFFIX)

  console.log(
    `computeCollectionProxyInitCodeHash's encodedInput: ${encodedInput}`
  )

  const initCodeHash = ethersUtils.keccak256(Buffer.from(encodedInput, 'hex'))

  return initCodeHash
}

const deployCollectionsCore = async (
  hre: HardhatRuntimeEnvironment,
  trustedForwarder?: string
): Promise<{
  featureRegistry: StartrailCollectionFeatureRegistry
  collectionFactory: CollectionFactoryV01
}> => {
  const metaTxForwarder: MetaTxForwarderV3 = (await getContract(
    hre,
    'MetaTxForwarder'
  )) as MetaTxForwarderV3

  //
  // Deploy the core collection contracts
  //

  const frFactory = await hre.ethers.getContractFactory(
    'StartrailCollectionFeatureRegistry'
  )

  const { nameRegistryProxyAddress } = loadDeployJSON(hre)
  const featureRegistry = (await frFactory.deploy(
    trustedForwarder || metaTxForwarder.address,
    nameRegistryProxyAddress
  )) as StartrailCollectionFeatureRegistry
  await featureRegistry.deployed()
  loggingOn &&
    console.log(`FeatureRegistry deployed to: ${featureRegistry.address}`)

  updateDeployJSON(hre, {
    startrailCollectionFeatureRegistryAddress: featureRegistry.address,
  })

  const cpFactory = await hre.ethers.getContractFactory('CollectionProxy')
  const cpImpl = await cpFactory.deploy()
  await cpImpl.deployed()
  // TODO: the previous and the next tx's should be atomic - wrap them in a single tx
  await cpImpl.__CollectionProxy_initialize(
    `0x0000000000000000000000000000000000000001`
  )

  const cfFactory = await getContractFactory(hre, 'CollectionFactory')

  const cfContract: Contract = await upgrades.deployProxy(
    cfFactory,
    [featureRegistry.address, cpImpl.address],
    {
      kind: 'uups',
    }
  )

  const txReceipt = await cfContract.deployTransaction.wait()
  const cfImplAddress = ethers.utils.getAddress(
    ethers.utils.hexDataSlice(txReceipt.logs[0].topics[1], 12)
  )

  const cf = cfContract as CollectionFactoryV01
  loggingOn && console.log(`CollectionFactory deployed to: ${cf.address}`)

  updateDeployJSON(hre, {
    collectionFactoryProxyAddress: cf.address,
  })
  updateImplJSON(hre, {
    collectionFactoryImplementationAddress: cfImplAddress,
  })

  updateImplJSON(hre, {
    collectionProxyImplementationAddress: cpImpl.address,
  })

  const { startrailAdministratorAddress } = loadDeployJSON(hre)
  await cf.transferOwnership(startrailAdministratorAddress)

  await setCollectionRegistryOnCollectionFactory(hre, cf, metaTxForwarder)

  //
  // Deploy Feature Contracts
  //
  const erc721Feature = await deployFeatureContract({
    featureRegistry,
    feature: {
      name: StartrailFeatureEnum.ERC721Feature,
      version: 'V01',
    },
  })

  loggingOn &&
    console.log(`ERC721Feature deployed to: ${erc721Feature.address}`)

  const lockExternalTransferFeature = await deployFeatureContract({
    featureRegistry,
    feature: {
      name: StartrailFeatureEnum.LockExternalTransferFeature,
      version: 'V01',
    },
  })

  loggingOn &&
    console.log(
      `LockExternalTransferFeature deployed to: ${lockExternalTransferFeature.address}`
    )

  const srrFeature = await deployFeatureContract({
    featureRegistry,
    feature: {
      name: StartrailFeatureEnum.SRRFeature,
      version: 'V01',
    },
  })

  loggingOn && console.log(`SRRFeature deployed to: ${srrFeature.address}`)

  const srrApprovalFeature = await deployFeatureContract({
    featureRegistry,
    feature: {
      name: StartrailFeatureEnum.SRRApproveTransferFeature,
      version: 'V01',
    },
  })

  loggingOn &&
    console.log(
      `SRRApproveTransferFeature deployed to: ${srrApprovalFeature.address}`
    )

  const erc2981RoyaltyFeature = await deployFeatureContract({
    featureRegistry,
    feature: {
      name: StartrailFeatureEnum.ERC2981RoyaltyFeature,
      version: 'V01',
    },
  })

  loggingOn &&
    console.log(
      `ERC2981RoyaltyFeature deployed to: ${erc2981RoyaltyFeature.address}`
    )

  const srrMetadataFeature = await deployFeatureContract({
    featureRegistry,
    feature: {
      name: StartrailFeatureEnum.SRRMetadataFeature,
      version: 'V01',
    },
  })

  loggingOn &&
    console.log(`SRRMetadataFeature deployed to: ${srrMetadataFeature.address}`)

  const srrHistoryFeature = await deployFeatureContract({
    featureRegistry,
    feature: {
      name: StartrailFeatureEnum.SRRHistoryFeature,
      version: 'V01',
    },
  })

  loggingOn &&
    console.log(`SRRHistoryFeature deployed to: ${srrHistoryFeature.address}`)

  const collectionProxyInitCodeHash = await computeCollectionProxyInitCodeHash(
    cpImpl.address
  )

  await updateContractsInitCodeHashJSON(hre, {
    collectionProxy: collectionProxyInitCodeHash,
  })

  return { featureRegistry, collectionFactory: cf }
}

export {
  deployCollectionsCore,
  deployFeature,
  deployFeatureContract,
  upgradeFeatureContract,
}
