import hre from 'hardhat'

import { deployAuditFixes } from '../../utils/deployment/017-deploy-audit-fixes'

deployAuditFixes(hre).catch((error) => {
  console.error(error);
  process.exit(1);
});
