import hre from 'hardhat'

import { Interface } from '@ethersproject/abi'

import { CollectionFunctionSignatures } from './feature-signatures'
import { StartrailFeature, StartrailFeatureEnum, StartrailFeatureSelectorsType } from '../types'

const getContractInterface = async (
  feature: StartrailFeature
): Promise<Interface> => {
  const artifact = await hre.artifacts.readArtifact(
    `${feature.name}${feature.version}`
  )
  return new Interface(artifact.abi)
}

/**
 * Compute the 4-byte selectors for a list of function signatures.
 *
 * @param feature - The feature contract on which the function signatures are defined.
 * @param functionSignatures List of function signatures (eg. exists(uint256)) to get selectors for.
 * @returns List of 4-byte selectors (eg. 0xabcd1234) corresponding to the functionSignatures.
 */
export const getSelectors = async (
  feature: StartrailFeature,
  functionSignatures: ReadonlyArray<string>
): Promise<string[]> => {
  const contractInterface = await getContractInterface(feature)
  return functionSignatures.map((sig) => contractInterface.getSighash(sig))
}

const CollectionFeatureSelectors: StartrailFeatureSelectorsType = {
  BulkFeature: async (version: string) =>
    getSelectors(
      {
        name: StartrailFeatureEnum.BulkFeature,
        version,
      },
      CollectionFunctionSignatures[StartrailFeatureEnum.BulkFeature][version]
    ),
  ERC721Feature: async (version: string) =>
    getSelectors(
      {
        name: StartrailFeatureEnum.ERC721Feature,
        version,
      },
      CollectionFunctionSignatures[StartrailFeatureEnum.ERC721Feature][version]
    ),
  LockExternalTransferFeature: async (version: string) =>
    getSelectors(
      {
        name: StartrailFeatureEnum.LockExternalTransferFeature,
        version,
      },
      CollectionFunctionSignatures[
        StartrailFeatureEnum.LockExternalTransferFeature
      ][version]
    ),
  SRRFeature: async (version: string) =>
    getSelectors(
      {
        name: StartrailFeatureEnum.SRRFeature,
        version,
      },
      CollectionFunctionSignatures[StartrailFeatureEnum.SRRFeature][version]
    ),
  SRRApproveTransferFeature: async (version: string) =>
    getSelectors(
      {
        name: StartrailFeatureEnum.SRRApproveTransferFeature,
        version,
      },
      CollectionFunctionSignatures[
        StartrailFeatureEnum.SRRApproveTransferFeature
      ][version]
    ),
  ERC2981RoyaltyFeature: async (version: string) =>
    getSelectors(
      {
        name: StartrailFeatureEnum.ERC2981RoyaltyFeature,
        version,
      },
      CollectionFunctionSignatures[StartrailFeatureEnum.ERC2981RoyaltyFeature][
        version
      ]
    ),
  SRRMetadataFeature: async (version: string) =>
    getSelectors(
      {
        name: StartrailFeatureEnum.SRRMetadataFeature,
        version,
      },
      CollectionFunctionSignatures[StartrailFeatureEnum.SRRMetadataFeature][
        version
      ]
    ),
  SRRHistoryFeature: async (version: string) =>
    getSelectors(
      {
        name: StartrailFeatureEnum.SRRHistoryFeature,
        version,
      },
      CollectionFunctionSignatures[StartrailFeatureEnum.SRRHistoryFeature][
        version
      ]
    ),
}

export { StartrailFeature, CollectionFeatureSelectors }
