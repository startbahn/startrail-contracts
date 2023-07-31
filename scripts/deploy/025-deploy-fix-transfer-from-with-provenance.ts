import hre from 'hardhat'

import { deployFixTransferFromWithProvenance } from '../../utils/deployment/025-deploy-fix-transfer-from-with-provenance'
// import { upgradeFeatureContract } from './upgrade-feature-contract'

deployFixTransferFromWithProvenance(hre).catch((error) => {
  console.error(error)
  process.exit(1)
})

// This function is needed in the script, ERC721Feature is already deployed and registered in the feature registry.
// upgradeFeatureContract(hre, 'ERC721Feature').catch((error) => { 
//   console.error(error)
//   process.exit(1)
// })
