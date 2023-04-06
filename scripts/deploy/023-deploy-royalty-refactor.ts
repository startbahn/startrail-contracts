import hre from 'hardhat'

import { deployRoyaltyRefactor } from '../../utils/deployment/023-deploy-royalty-refactor'

deployRoyaltyRefactor(hre).catch((error) => {
  console.error(error)
  process.exit(1)
})
