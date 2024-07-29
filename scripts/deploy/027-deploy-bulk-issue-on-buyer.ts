import hre from 'hardhat'

import { deployBulkIssueOnBuyer } from '../../utils/deployment/027-deploy-bulk-issue-on-buyer'

deployBulkIssueOnBuyer(hre).catch((error) => {
  console.error(error)
  process.exit(1)
})
