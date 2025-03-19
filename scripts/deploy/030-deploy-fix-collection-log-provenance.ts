import hre from 'hardhat'

import { deployFixCollectionLogProvenance } from '../../utils/deployment/030-deploy-fix-collection-log-provenance'

deployFixCollectionLogProvenance(hre).catch((error) => {
  console.error(error)
  process.exit(1)
})
