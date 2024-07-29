import { Contract } from 'ethers'

/**
 * Enumeration of supported features for the Startrail Contract.
 * Each feature corresponds to a specific functionality.
 */
export enum StartrailFeatureEnum {
  BulkFeature = 'BulkFeature',
  ERC721Feature = 'ERC721Feature',
  ERC2981RoyaltyFeature = 'ERC2981RoyaltyFeature',
  LockExternalTransferFeature = 'LockExternalTransferFeature',
  SRRFeature = 'SRRFeature',
  SRRApproveTransferFeature = 'SRRApproveTransferFeature',
  SRRMetadataFeature = 'SRRMetadataFeature',
  SRRHistoryFeature = 'SRRHistoryFeature',
}

/**
 * Represents the version information for upgrading a feature contract.
 *
 * @property from - The current version of the feature.
 * @property to - The target version to upgrade the feature to.
 */
export type StartrailUpgradeVersion = {
  from: string
  to: string
}

/**
 * Addresses of smart contracts on the Ethereum network. These are read from
 * deploy.json which is stored in the @startbahn/startrail/deployments folders.
 */
export interface StartrailContractAddresses {
  idGeneratorLibraryAddress: string
  multiSendAddress: string
  startrailAdministratorAddress: string
  proxyAdminAddress: string
  nameRegistryProxyAddress: string
  metaTxForwarderProxyAddress: string
  licensedUserManagerProxyAddress: string
  startrailRegistryProxyAddress: string
  bulkIssueProxyAddress: string
  bulkTransferProxyAddress: string
  openSeaMetaTransactionLibraryAddress: string
  bulkImplementationAddress: string
  bulkProxyAddress: string
  startrailRegistryLibraryAddress: string
  startrailCollectionFeatureRegistryAddress: string
  collectionFactoryProxyAddress: string
}

/**
 * Represents a Startrail feature with its name and version.
 */
export type StartrailFeature = {
  /** The name of the Startrail feature. */
  name: StartrailFeatureEnum

  /** The version of the Startrail feature. */
  version: string
}

/**
 * Represents a mapping of Startrail feature names to functions
 * that retrieve selectors based on the feature version.
 */
export type StartrailFeatureSelectorsType = {
  /**
   * Get the selectors for a specific version of the corresponding feature.
   * @param version The version of the feature.
   * @returns A promise resolving to an array of selectors.
   */
  [Key in StartrailFeatureEnum]: (version: string) => Promise<string[]>
}
