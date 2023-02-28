import hre from 'hardhat'

import { deployUpdateSRRAddHistoryPermission} from '../../utils/deployment/016-deploy-update-srr-add-history-permission'

deployUpdateSRRAddHistoryPermission(hre).catch((error) => {
  console.error(error);
  process.exit(1);
});
