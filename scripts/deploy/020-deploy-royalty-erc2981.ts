import hre from 'hardhat'

import { deployRoyaltyERC2981} from '../../utils/deployment/020-deploy-royalty-erc2981'

deployRoyaltyERC2981(hre).catch((error) => {
  console.error(error);
  process.exit(1);
});
