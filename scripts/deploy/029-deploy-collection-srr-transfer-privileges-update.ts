import hre from 'hardhat'

import { deployCollectionSRRTransferPrivilegesUpdate } from '../../utils/deployment/029-deploy-collection-srr-transfer-privileges-update'

deployCollectionSRRTransferPrivilegesUpdate(hre).catch((error) => {
  console.error(error)
  process.exit(1)
})
