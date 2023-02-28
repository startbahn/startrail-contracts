import hre from 'hardhat'

import { deployRenameRecipient } from '../../utils/deployment/013-deploy-rename-recipient'

deployRenameRecipient(hre).catch((error) => {
  console.error(error);
  process.exit(1);
});
