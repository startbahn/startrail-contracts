import hre from 'hardhat'

import { deployCollections } from '../../utils/deployment/024-deploy-collections'

deployCollections(hre).catch((error) => {
  console.error(error)
  process.exit(1)
})
