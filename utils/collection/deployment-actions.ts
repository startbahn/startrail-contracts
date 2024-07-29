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
import featureSelectors from './feature-selectors'
import { deployFeature, upgradeFeature } from './utils'

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
  featureRegistry: StartrailCollectionFeatureRegistry
): Promise<Contract> => {
  const featureFactory = await getContractFactory(hre, 'ERC721Feature')
  const initData = featureFactory.interface.encodeFunctionData(
    featureFactory.interface.functions[
      `__ERC721Feature_initialize(string,string)`
    ],
    ['IMPLEMENTATION_ONLY', 'IMPL']
  )
  return deployFeature({
    featureRegistry,
    featureName: `ERC721Feature`,
    selectors: await featureSelectors.erc721(),
    supportedInterfaceIds: [ercInterfaces.ERC721, ercInterfaces.ERC721Metadata],
    initData,
  })
}

const deployLockExternalTransferFeature = async (
  featureRegistry: StartrailCollectionFeatureRegistry
): Promise<Contract> =>
  deployFeature({
    featureRegistry,
    featureName: `LockExternalTransferFeature`,
    selectors: await featureSelectors.lockExternalTransfer(),
  })

const deploySRRFeature = async (
  featureRegistry: StartrailCollectionFeatureRegistry
): Promise<Contract> => {
  const { idGeneratorLibraryAddress } = loadDeployJSON(hre)
  return deployFeature({
    featureRegistry,
    featureName: `SRRFeature`,
    selectors: await featureSelectors.srr(),
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
    selectors: await featureSelectors.srrApproveTransfer(),
  })
}

const deploySRRMetadataFeature = async (
  featureRegistry: StartrailCollectionFeatureRegistry
): Promise<Contract> => {
  return deployFeature({
    featureRegistry,
    featureName: `SRRMetadataFeature`,
    selectors: await featureSelectors.srrMetadata(),
  })
}

const deploySRRHistoryFeature = async (
  featureRegistry: StartrailCollectionFeatureRegistry
): Promise<Contract> => {
  return deployFeature({
    featureRegistry,
    featureName: `SRRHistoryFeature`,
    selectors: await featureSelectors.srrHistory(),
  })
}

const deployERC2981RoyaltyFeature = async (
  featureRegistry: StartrailCollectionFeatureRegistry
): Promise<Contract> => {
  return deployFeature({
    featureRegistry,
    featureName: `ERC2981RoyaltyFeature`,
    selectors: await featureSelectors.erc2981Royalty(),
    supportedInterfaceIds: [ercInterfaces.ERC2981],
  })
}

const deployBulkFeature = async (
  featureRegistry: StartrailCollectionFeatureRegistry
): Promise<Contract> => {
  const { idGeneratorLibraryAddress } = loadDeployJSON(hre)
  return deployFeature({
    featureRegistry,
    featureName: `BulkFeature`,
    selectors: await featureSelectors.bulk(),
    linkLibraries: {
      IDGeneratorV3: idGeneratorLibraryAddress,
    },
  })
}

/*
 * NOTE: temporary implementation for a manual upgrade in QA
 * Needs to be replaced by an implementation that takes a version parameter
 * and upgrades from for example V01 to V02.
 */
const upgradeERC721Feature = async (
  hre: HardhatRuntimeEnvironment
): Promise<Contract> => {
  const featureRegistry = await getContract(
    hre,
    `StartrailCollectionFeatureRegistry`
  )
  return upgradeFeature({
    featureRegistry: featureRegistry as StartrailCollectionFeatureRegistry,
    featureName: `ERC721Feature`,
    selectors: await featureSelectors.erc721(),
  })
}

const upgradeSRRFeature = async (
  hre: HardhatRuntimeEnvironment
): Promise<Contract> => {
  const featureRegistry = await getContract(
    hre,
    `StartrailCollectionFeatureRegistry`
  )
  const { idGeneratorLibraryAddress } = loadDeployJSON(hre)
  return upgradeFeature({
    featureRegistry: featureRegistry as StartrailCollectionFeatureRegistry,
    featureName: `SRRFeature`,
    selectors: await featureSelectors.srr(),
    linkLibraries: {
      IDGeneratorV3: idGeneratorLibraryAddress,
    },
  })
}

const upgradeERC2981RoyaltyFeature = async (
  hre: HardhatRuntimeEnvironment
): Promise<Contract> => {
  const featureRegistry = await getContract(
    hre,
    `StartrailCollectionFeatureRegistry`
  )
  const { idGeneratorLibraryAddress } = loadDeployJSON(hre)
  return upgradeFeature({
    featureRegistry: featureRegistry as StartrailCollectionFeatureRegistry,
    featureName: `ERC2981RoyaltyFeature`,
    selectors: await featureSelectors.erc2981Royalty(),
  })
}

const upgradeSRRMetadataFeature = async (
  hre: HardhatRuntimeEnvironment
): Promise<Contract> => {
  const featureRegistry = await getContract(
    hre,
    `StartrailCollectionFeatureRegistry`
  )
  return upgradeFeature({
    featureRegistry: featureRegistry as StartrailCollectionFeatureRegistry,
    featureName: `SRRMetadataFeature`,
    selectors: await featureSelectors.srrMetadata(),
  })
}

const upgradeSRRApproveTransferFeature = async (
  hre: HardhatRuntimeEnvironment
): Promise<Contract> => {
  const featureRegistry = await getContract(
    hre,
    `StartrailCollectionFeatureRegistry`
  )
  return upgradeFeature({
    featureRegistry: featureRegistry as StartrailCollectionFeatureRegistry,
    featureName: `SRRApproveTransferFeature`,
    selectors: await featureSelectors.srrApproveTransfer(),
  })
}

const upgradeLockExternalTransferFeature = async (
  hre: HardhatRuntimeEnvironment
): Promise<Contract> => {
  const featureRegistry = await getContract(
    hre,
    `StartrailCollectionFeatureRegistry`
  )
  return upgradeFeature({
    featureRegistry: featureRegistry as StartrailCollectionFeatureRegistry,
    featureName: `LockExternalTransferFeature`,
    selectors: await featureSelectors.lockExternalTransfer(),
  })
}

const upgradeSRRHistoryFeature = async (
  hre: HardhatRuntimeEnvironment
): Promise<Contract> => {
  const featureRegistry = await getContract(
    hre,
    `StartrailCollectionFeatureRegistry`
  )
  return upgradeFeature({
    featureRegistry: featureRegistry as StartrailCollectionFeatureRegistry,
    featureName: `SRRHistoryFeature`,
    selectors: await featureSelectors.srrHistory(),
  })
}

const upgradeBulkFeature = async (
  hre: HardhatRuntimeEnvironment
): Promise<Contract> => {
  const featureRegistry = await getContract(
    hre,
    `StartrailCollectionFeatureRegistry`
  )
  const { idGeneratorLibraryAddress } = loadDeployJSON(hre)
  
  return upgradeFeature({
    featureRegistry: featureRegistry as StartrailCollectionFeatureRegistry,
    featureName: `BulkFeature`,
    selectors: await featureSelectors.bulk(),
    linkLibraries: {
      IDGeneratorV3: idGeneratorLibraryAddress,
    },
  })
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

  const srrMetadataFeature = await deploySRRMetadataFeature(featureRegistry)
  loggingOn &&
    console.log(`SRRMetadataFeature deployed to: ${srrMetadataFeature.address}`)

  const srrHistoryFeature = await deploySRRHistoryFeature(featureRegistry)
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
  deployBulkFeature,
  deployERC721Feature,
  deployFeature,
  upgradeERC721Feature,
  upgradeSRRFeature,
  upgradeERC2981RoyaltyFeature,
  upgradeSRRMetadataFeature,
  upgradeLockExternalTransferFeature,
  upgradeSRRApproveTransferFeature,
  upgradeSRRHistoryFeature,
  upgradeBulkFeature,
}
