import hre from 'hardhat'

import { deployInitialBulk } from '../../utils/deployment/011-deploy-bulk'

deployInitialBulk(hre).catch((error) => {
  console.error(error);
  process.exit(1);
});
