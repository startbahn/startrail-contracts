import { Contract } from 'ethers'
import { BytesLike, Interface, id } from 'ethers/lib/utils'
import hre, { ethers } from 'hardhat'
import { ZERO_ADDRESS } from '../../test/helpers/utils'
import { StartrailCollectionFeatureRegistry } from '../../typechain-types'
import { getContract, getContractFactory } from '../hardhat-helpers'
import {
  StartrailFeature,
  StartrailFeatureEnum,
  StartrailUpgradeVersion,
} from '../types'
import { FacetCutAction, FacetCutDefinition } from './types'
import _ from 'lodash'
import { CollectionFeatureSelectors } from './feature-selectors'
import { HardhatRuntimeEnvironment } from 'hardhat/types'

const registerSelectors = async (
  featureRegistry: StartrailCollectionFeatureRegistry,
  featureContractAddress: string,
  functionSelectors: string[],
  initData?: BytesLike
): Promise<void> => {
  const cut: FacetCutDefinition = {
    target: featureContractAddress,
    action: FacetCutAction.Add,
    selectors: functionSelectors,
  }

  console.log('Register selectors input:', JSON.stringify(cut, null, 2))

  const tx = await featureRegistry.diamondCut(
    [cut],
    initData ? cut.target : ethers.constants.AddressZero,
    initData || `0x`
  )

  const receipt = await tx.wait()
  if (!receipt.status) {
    throw Error(`Register selectors tx failed: ${tx.hash}`)
  }

  console.log('Registered selectors:', JSON.stringify(cut, null, 2))
}

const getSelectors = (contract: Contract): string[] => {
  const iface = contract.interface || new Interface(contract.abi)
  const signatures = Object.keys(iface.functions)
  return signatures.reduce((acc: string[], val) => {
    if (val !== 'supportsInterface(bytes4)') {
      acc.push(iface.getSighash(val))
    }
    return acc
  }, [])
}

/**
 * Replace the contract address of a list of already registered selectors.
 * This is required when a feature contract is upgraded. All selectors
 * should point to the new contract.
 * @param featureRegistry Contract with the registry of selectors
 * @param featureContractAddress New feature contract to point to
 * @param functionSelectors Selectors to replace the target contract on
 */
const replaceSelectors = async (
  featureRegistry: StartrailCollectionFeatureRegistry,
  featureContractAddress: string,
  functionSelectors: string[]
): Promise<void> => {
  const cut: FacetCutDefinition = {
    target: featureContractAddress,
    action: FacetCutAction.Replace,
    selectors: functionSelectors,
  }
  console.log('Replace selectors input:', JSON.stringify(cut, null, 2))

  const tx = await featureRegistry.diamondCut(
    [cut],
    ethers.constants.AddressZero,
    `0x`
  )

  const receipt = await tx.wait()
  if (!receipt.status) {
    throw Error(`Replace selectors tx failed: ${tx.hash}`)
  }

  console.log('Replaced selectors:', JSON.stringify(cut, null, 2))
}

/**
 * Remove selectors registered with a contract address in the feature registry.
 * @param featureRegistry Contract with the registry of selectors
 * @param functionSelectors Selectors to remove
 */
const removeSelectors = async (
  featureRegistry: StartrailCollectionFeatureRegistry,
  functionSelectors: string[]
): Promise<void> => {
  const cut: FacetCutDefinition = {
    target: ZERO_ADDRESS,
    action: FacetCutAction.Remove,
    selectors: functionSelectors,
  }
  console.log('Remove selectors input:', JSON.stringify(cut, null, 2))

  const tx = await featureRegistry.diamondCut(
    [cut],
    ethers.constants.AddressZero,
    `0x`
  )

  const receipt = await tx.wait()
  if (!receipt.status) {
    throw Error(`Remove selectors tx failed: ${tx.hash}`)
  }

  console.log('Removed selectors:', JSON.stringify(cut, null, 2))
}

/**
 * Deploy a Collection feature contract.
 *
 * @param featureRegistry - The feature registry contract instance.
 * @param feature - The type of feature to be deployed.
 * @param supportedInterfaceIds - Optional list of supported interface IDs.
 * @param initData - Optional initialization data for the feature contract.
 * @param linkLibraries - Optional object specifying additional libraries to link during deployment.
 * @returns A Promise resolving to the deployed feature contract instance.
 */
const deployFeature = async ({
  featureRegistry,
  feature,
  supportedInterfaceIds = [],
  initData,
  linkLibraries = {},
}: {
  featureRegistry: StartrailCollectionFeatureRegistry
  feature: StartrailFeature
  supportedInterfaceIds?: string[]
  initData?: BytesLike
  linkLibraries?: Record<string, string>
}): Promise<Contract> => {
  const contractName = `${feature.name}${feature.version}`
  console.log(`Deploy ${contractName}`)

  const featureFactory = await getContractFactory(hre, contractName, {
    libraries: linkLibraries,
  })

  const args =
    hre.network.name === 'polygon'
      ? {
          gasLimit: 29_000_000, // its needed to deploy the contract into polygon mainnet
        }
      : {}

  const featureContract = await featureFactory.deploy(args)
  await featureContract.deployed()
  console.log(`${contractName} deployed: ${featureContract.address}`)

  await registerSelectors(
    featureRegistry,
    featureContract.address,
    getSelectors(featureContract),
    initData
  )

  for (const interfaceId of supportedInterfaceIds) {
    await featureRegistry.setSupportedInterface(interfaceId, true)
  }

  console.log(`Deployed ${contractName}`)

  return featureContract
}

/**
 * Upgrade a Collection feature to a specified version.
 *
 * @param params - An object containing the Hardhat runtime environment, feature name,
 * upgrade version, and optional link libraries.
 * @param params.hre - The Hardhat runtime environment.
 * @param params.featureName - The name of the feature to be upgraded.
 * @param params.upgradeVersion - The version to upgrade the feature to.
 * @param params.linkLibraries - Optional object specifying additional libraries to link during deployment.
 * @returns A Promise resolving to the upgraded feature contract instance.
 */
const upgradeFeature = async ({
  hre,
  featureName,
  upgradeVersion,
  linkLibraries = {},
}: {
  hre: HardhatRuntimeEnvironment
  featureName: StartrailFeatureEnum
  upgradeVersion: StartrailUpgradeVersion
  linkLibraries?: Record<string, string>
}): Promise<Contract> => {
  const toContractName = `${featureName}${upgradeVersion.to}`
  const fromContractName = `${featureName}${upgradeVersion.from}`

  const featureRegistry = (await getContract(
    hre,
    `StartrailCollectionFeatureRegistry`
  )) as StartrailCollectionFeatureRegistry

  console.log(`Upgrade ${toContractName} from ${fromContractName}`)

  const featureFactory = await getContractFactory(hre, toContractName, {
    libraries: linkLibraries,
  })

  const feature = await featureFactory.deploy()
  await feature.deployed()

  console.log(`${toContractName} deployed: ${feature.address}`)

  const fromSelectors = await CollectionFeatureSelectors[featureName](
    upgradeVersion.from
  )
  const toSelectors = getSelectors(feature)

  const fromSelectorsSet = new Set(fromSelectors)
  const toSelectorsSet = new Set(toSelectors)

  const commonSelectors = Array.from(fromSelectorsSet).filter((item) =>
    toSelectorsSet.has(item)
  )

  const legacySelectors = Array.from(fromSelectorsSet).filter(
    (item) => !toSelectorsSet.has(item)
  )

  const newSelectors = Array.from(toSelectorsSet).filter(
    (item) => !fromSelectorsSet.has(item)
  )

  if (!_.isEmpty(newSelectors)) {
    await registerSelectors(featureRegistry, feature.address, newSelectors)
  }

  if (!_.isEmpty(commonSelectors)) {
    await replaceSelectors(featureRegistry, feature.address, commonSelectors)
  }

  if (!_.isEmpty(legacySelectors)) {
    await removeSelectors(featureRegistry, legacySelectors)
  }

  console.log(`Upgraded ${toContractName} from ${fromContractName}`)

  return feature
}

export {
  getSelectors,
  registerSelectors,
  removeSelectors,
  deployFeature,
  upgradeFeature,
  replaceSelectors,
}
