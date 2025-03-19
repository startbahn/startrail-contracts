import hre from 'hardhat'

import { deployLicensedUserManagerV2 } from '../../utils/deployment/028-deploy-luw-manager-v2'

deployLicensedUserManagerV2(hre).catch((error) => {
  console.error(error)
  process.exit(1)
})
