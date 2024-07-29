import hre from 'hardhat'

import { deployBulkCollection } from '../../utils/deployment/026-deploy-bulk-collection'

deployBulkCollection(hre).catch((error) => {
  console.error(error)
  process.exit(1)
})
