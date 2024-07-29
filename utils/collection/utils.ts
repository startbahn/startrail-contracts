import { Contract } from 'ethers'
import { BytesLike, Interface } from 'ethers/lib/utils'
import hre, { ethers } from 'hardhat'

import { ZERO_ADDRESS } from '../../test/helpers/utils'
import { StartrailCollectionFeatureRegistry } from '../../typechain-types'
import { getContractFactory } from '../hardhat-helpers'
import { FacetCutAction, FacetCutDefinition } from './types'

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
  // console.log('Register selectors input:', JSON.stringify(cut, null, 2))

  const tx = await featureRegistry.diamondCut(
    [cut],
    initData ? cut.target : ethers.constants.AddressZero,
    initData || `0x`
  )

  const receipt = await tx.wait()
  if (!receipt.status) {
    throw Error(`Register selectors tx failed: ${tx.hash}`)
  }
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
  // console.log('Replace selectors input:', JSON.stringify(cut, null, 2))

  const tx = await featureRegistry.diamondCut(
    [cut],
    ethers.constants.AddressZero,
    `0x`
  )

  const receipt = await tx.wait()
  if (!receipt.status) {
    throw Error(`Replace selectors tx failed: ${tx.hash}`)
  }
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
  // console.log('Remove selectors input:', JSON.stringify(cut, null, 2))

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
  const featureFactory = await getContractFactory(hre, featureName, {
    libraries: linkLibraries,
  })

  const args =
    hre.network.name === 'polygon'
      ? {
          gasLimit: 29_000_000, // its needed to deploy the contract into polygon mainnet
        }
      : {}

  const feature = await featureFactory.deploy(args)
  await feature.deployed()
  console.log(`${featureName} deployed: ${feature.address}`)

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

const upgradeFeature = async ({
  featureRegistry,
  featureName,
  selectors,
  linkLibraries = {},
}: {
  featureRegistry: StartrailCollectionFeatureRegistry
  featureName: string
  selectors?: string[]
  linkLibraries?: Record<string, string>
}): Promise<Contract> => {
  const featureFactory = await getContractFactory(hre, featureName, {
    libraries: linkLibraries,
  })
  const feature = await featureFactory.deploy()
  await feature.deployed()
  console.log(`${featureName} deployed: ${feature.address}`)

  // NOTE: The following is a very simple version for this release.
  //
  // In future we'll need to add and remove individual functions
  // and have separate lists for the previous and new versions of
  // the feature contract.
  await replaceSelectors(
    featureRegistry,
    feature.address,
    selectors || getSelectors(feature)
  )

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
