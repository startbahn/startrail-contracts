import hre from 'hardhat'

import { deployCreateSRRIssueToRecipient } from '../../utils/deployment/012-deploy-create-srr-issue-to-recipient'

deployCreateSRRIssueToRecipient(hre).catch((error) => {
  console.error(error);
  process.exit(1);
});
