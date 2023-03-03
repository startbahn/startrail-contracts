import hre from 'hardhat'

import { deployCollectionsCore } from '../../utils/collection/deployment-actions'

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
deployCollectionsCore(hre).catch((error) => {
  console.error(error)
  process.exitCode = 1
})
