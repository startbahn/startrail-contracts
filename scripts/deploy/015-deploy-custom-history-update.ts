import hre from 'hardhat'

import { deployCustomHistoryUpdate} from '../../utils/deployment/015-deploy-custom-history-update'

deployCustomHistoryUpdate(hre).catch((error) => {
  console.error(error);
  process.exit(1);
});
