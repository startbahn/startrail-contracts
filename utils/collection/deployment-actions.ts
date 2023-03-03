import hre, { ethers } from 'hardhat'
import { BytesLike, Contract } from 'ethers'
import {
  CollectionFactory,
  MetaTxForwarderV3,
  StartrailCollectionFeatureRegistry,
} from '../../typechain-types'
import { registerSelectors, getSelectors } from './utils'
import { ERC165_INTERFACES_ERC721 } from './erc165.interfaces'
import { ERC2981_INTERFACES } from './erc2981.interfaces'

import {
  erc721FeatureFunctionSelectors,
  erc721MetadataFunctionSelectors,
  erc721FunctionSelectors,
  lockExternalTransferFeatureFunctionSelectors,
  srrFeatureFunctionSelectors,
  srrApproveTransferFeatureFunctionSelectors,
  erc2981RoyaltyFeatureFunctionSelectors,
} from './feature-selectors'
import { getAdministratorInstance, getContract } from '../hardhat-helpers'
import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { loadDeployJSON, updateDeployJSON } from '../deployment/deploy-json'

const loggingOn = false

const setCollectionRegistryOnCollectionFactory = async (
  hre: HardhatRuntimeEnvironment,
  cf: CollectionFactory,
  metaTxForwarder: MetaTxForwarderV3
) => {
  const crAddress = await cf._collectionRegistry()
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

const deployFeature = async ({
  featureRegistry,
  featureName,
  selectors,
  supportedInterfaceIds = [],
  initData,
  linkLibraries = {},
}: {
  featureRegistry: StartrailCollectionFeatureRegistry
  featureName: string
  selectors?: string[]
  supportedInterfaceIds?: string[]
  initData?: BytesLike
  linkLibraries?: Record<string, string>
}): Promise<Contract> => {
  const featureFactory = await ethers.getContractFactory(featureName, {
    libraries: linkLibraries,
  })
  const feature = await featureFactory.deploy()
  await feature.deployed()
  // console.log(`${featureName} deployed: ${feature.address}`)

  await registerSelectors(
    featureRegistry,
    feature.address,
    selectors || getSelectors(feature),
    initData
  )

  for (const interfaceId of supportedInterfaceIds) {
    await featureRegistry.setSupportedInterface(interfaceId, true)
  }

  return feature
}

const deployERC721Feature = async (
  featureRegistry: StartrailCollectionFeatureRegistry
): Promise<Contract> => {
  const featureFactory = await ethers.getContractFactory('ERC721Feature')
  const initData = featureFactory.interface.encodeFunctionData(
    featureFactory.interface.functions[
      `__ERC721Feature_initialize(string,string)`
    ],
    ['IMPLEMENTATION_ONLY', 'IMPL']
  )
  return deployFeature({
    featureRegistry,
    featureName: `ERC721Feature`,
    selectors: [
      ...(await erc721FeatureFunctionSelectors()),
      ...(await erc721FunctionSelectors()),
      ...(await erc721MetadataFunctionSelectors()),
    ],
    supportedInterfaceIds: Object.values(ERC165_INTERFACES_ERC721),
    initData,
  })
}

const deployLockExternalTransferFeature = async (
  featureRegistry: StartrailCollectionFeatureRegistry
): Promise<Contract> =>
  deployFeature({
    featureRegistry,
    featureName: `LockExternalTransferFeature`,
    selectors: await lockExternalTransferFeatureFunctionSelectors(),
  })

const deploySRRFeature = async (
  featureRegistry: StartrailCollectionFeatureRegistry
): Promise<Contract> => {
  const { idGeneratorLibraryAddress } = loadDeployJSON(hre)
  return deployFeature({
    featureRegistry,
    featureName: `SRRFeature`,
    selectors: await srrFeatureFunctionSelectors(),
    linkLibraries: {
      IDGeneratorV3: idGeneratorLibraryAddress,
    },
  })
}

const deploySRRApproveTransferFeature = async (
  featureRegistry: StartrailCollectionFeatureRegistry
): Promise<Contract> => {
  return deployFeature({
    featureRegistry,
    featureName: `SRRApproveTransferFeature`,
    selectors: await srrApproveTransferFeatureFunctionSelectors(),
  })
}

const deployERC2981RoyaltyFeature = async (
  featureRegistry: StartrailCollectionFeatureRegistry
): Promise<Contract> => {
  return deployFeature({
    featureRegistry,
    featureName: `ERC2981RoyaltyFeature`,
    selectors: await erc2981RoyaltyFeatureFunctionSelectors(),
    supportedInterfaceIds: Object.values(ERC2981_INTERFACES),
  })
}

const deployCollectionsCore = async (
  hre: HardhatRuntimeEnvironment,
  trustedForwarder?: string
): Promise<{
  featureRegistry: StartrailCollectionFeatureRegistry
  collectionFactory: CollectionFactory
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
  const featureRegistry = await frFactory.deploy(
    trustedForwarder || metaTxForwarder.address,
    nameRegistryProxyAddress
  )
  await featureRegistry.deployed()
  loggingOn &&
    console.log(`FeatureRegistry deployed to: ${featureRegistry.address}`)

  updateDeployJSON(hre, {
    startrailCollectionFeatureRegistryAddress: featureRegistry.address,
  })

  const cfFactory = await hre.ethers.getContractFactory('CollectionFactory')
  const cf = await cfFactory.deploy(featureRegistry.address)
  await cf.deployed()
  loggingOn && console.log(`CollectionFactory deployed to: ${cf.address}`)

  updateDeployJSON(hre, {
    collectionFactoryAddress: cf.address,
  })

  await setCollectionRegistryOnCollectionFactory(hre, cf, metaTxForwarder)

  //
  // Deploy Feature Contracts
  //

  const erc721Feature = await deployERC721Feature(featureRegistry)
  loggingOn &&
    console.log(`ERC721Feature deployed to: ${erc721Feature.address}`)

  const lockExternalTransferFeature = await deployLockExternalTransferFeature(
    featureRegistry
  )
  loggingOn &&
    console.log(
      `LockExternalTransferFeature deployed to: ${lockExternalTransferFeature.address}`
    )

  const srrFeature = await deploySRRFeature(featureRegistry)
  loggingOn && console.log(`SRRFeature deployed to: ${srrFeature.address}`)

  const srrApprovalFeature = await deploySRRApproveTransferFeature(
    featureRegistry
  )
  loggingOn &&
    console.log(
      `SRRApproveTransferFeature deployed to: ${srrApprovalFeature.address}`
    )

  const erc2981RoyaltyFeature = await deployERC2981RoyaltyFeature(
    featureRegistry
  )
  loggingOn &&
    console.log(
      `ERC2981RoyaltyFeature deployed to: ${erc2981RoyaltyFeature.address}`
    )

  return { featureRegistry, collectionFactory: cf }
}

export { deployCollectionsCore, deployERC721Feature, deployFeature }
