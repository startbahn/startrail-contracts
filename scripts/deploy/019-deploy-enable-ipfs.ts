import hre from 'hardhat'

import { deployEnableIPFS } from '../../utils/deployment/019-deploy-enable-ipfs'

deployEnableIPFS(hre).catch((error) => {
  console.error(error);
  process.exit(1);
});
