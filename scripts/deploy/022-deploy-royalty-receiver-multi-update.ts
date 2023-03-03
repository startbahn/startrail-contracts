import hre from 'hardhat'

import { deployRoyaltyReceiverMultiUpdate } from '../../utils/deployment/022-deploy-royalty-receiver-multi-update'

deployRoyaltyReceiverMultiUpdate(hre).catch((error) => {
  console.error(error)
  process.exit(1)
})
