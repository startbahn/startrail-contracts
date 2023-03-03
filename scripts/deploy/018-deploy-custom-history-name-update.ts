import hre from 'hardhat'

import { deployCustomHistoryNameUpdate } from '../../utils/deployment/018-deploy-custom-history-name-update'

deployCustomHistoryNameUpdate(hre).catch((error) => {
  console.error(error)
  process.exit(1)
})
