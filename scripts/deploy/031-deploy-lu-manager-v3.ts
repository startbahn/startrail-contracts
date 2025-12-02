import hre from 'hardhat'

import { deployLicensedUserManagerV3 } from '../../utils/deployment/031-deploy-lu-manager-v3'

deployLicensedUserManagerV3(hre).catch((error) => {
  console.error(error)
  process.exit(1)
})
