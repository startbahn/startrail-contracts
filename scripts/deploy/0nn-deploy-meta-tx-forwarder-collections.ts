import hre from 'hardhat'

import { deployMetaTxForwarderCollections } from '../../utils/deployment/0nn-deploy-meta-tx-forwarder-collections'

deployMetaTxForwarderCollections(hre).catch((error) => {
  console.error(error)
  process.exit(1)
})
