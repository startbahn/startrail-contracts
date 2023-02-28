import hre from 'hardhat'

import { deployBytecodeReduction} from '../../utils/deployment/014-deploy-bytecode-reduction'

deployBytecodeReduction(hre).catch((error) => {
  console.error(error);
  process.exit(1);
});
