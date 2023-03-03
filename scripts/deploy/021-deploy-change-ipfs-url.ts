import hre from 'hardhat'

import { deployFixIPFSUrl } from '../../utils/deployment/021-deploy-change-ipfs-url'

deployFixIPFSUrl(hre).catch((error) => {
  console.error(error)
  process.exit(1)
})
