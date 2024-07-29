import {
  upgradeERC2981RoyaltyFeature,
  upgradeERC721Feature,
  upgradeLockExternalTransferFeature,
  upgradeSRRApproveTransferFeature,
  upgradeSRRFeature,
  upgradeSRRHistoryFeature,
  upgradeSRRMetadataFeature,
  upgradeBulkFeature,
} from '../../utils/collection/deployment-actions'

export const upgradeFeatureContract = async (hre, contractName) => {
  console.log(`\nUpgrading feature contract ${contractName}:\n`)
  if (contractName === `ERC721Feature`) {
    await upgradeERC721Feature(hre)
  } else if (contractName === `SRRFeature`) {
    await upgradeSRRFeature(hre)
  } else if (contractName === `ERC2981RoyaltyFeature`) {
    await upgradeERC2981RoyaltyFeature(hre)
  } else if (contractName === `SRRMetadataFeature`) {
    await upgradeSRRMetadataFeature(hre)
  } else if (contractName === `SRRApproveTransferFeature`) {
    await upgradeSRRApproveTransferFeature(hre)
  } else if (contractName === `LockExternalTransferFeature`) {
    await upgradeLockExternalTransferFeature(hre)
  } else if (contractName === `SRRHistoryFeature`) {
    await upgradeSRRHistoryFeature(hre)
  } else if (contractName === `BulkFeature`) {
    await upgradeBulkFeature(hre)
  } else {
    throw new Error(`Upgrade of ${contractName} not yet supported`)
  }
}
