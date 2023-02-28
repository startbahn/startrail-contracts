import hre from 'hardhat'

import { deployMetaTxPolygonOpenSea } from '../../utils/deployment/010-deploy-meta-tx-polygon-opensea'

deployMetaTxPolygonOpenSea(hre).catch((error) => {
  console.error(error);
  process.exit(1);
});
