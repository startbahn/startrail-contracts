import hre from 'hardhat'

import { deployOwnable } from '../../utils/deployment/009-deploy-ownable'

deployOwnable(hre).catch((error) => {
  console.error(error);
  process.exit(1);
});
