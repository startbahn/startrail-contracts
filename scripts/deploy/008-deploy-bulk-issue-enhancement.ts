import hre from 'hardhat'

import { deployBulkIssueEnhancement } from '../../utils/deployment/008-deploy-bulk-issue-enhancement'

deployBulkIssueEnhancement(hre).catch((error) => {
  console.error(error);
  process.exit(1);
});
