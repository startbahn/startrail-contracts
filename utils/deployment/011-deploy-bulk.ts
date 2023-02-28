import { MetaTxRequestType } from '../../startrail-common-js/meta-tx/types'
import { deployStartrailRegistry } from './deploy-startrail-registry'
import { registerRequestTypes } from '../register-request-types'
import { deployBulk } from './deploy-bulk'
import {
  getAdministratorInstance,
  getContract,
  isLocalNetwork,
} from '../hardhat-helpers'
import { updateDeployJSON } from './deploy-json'
import { deployContract } from './deploy-contract'

/**
 * Deploy initial set of bulk contracts.
 */

const deployInitialBulk = async (hre) => {
  console.log("\n=====    deployBulk invoked    ======\n");
  // await deployStartrailRegistry(hre, `StartrailRegistryV10`, `IDGeneratorV2`);
  await deployStartrailRegistry(
    hre,
    `StartrailRegistryV10`,
    `IDGeneratorV2`,
    `OpenSeaMetaTransactionLibrary`
  );

  await deployBulk(hre);
  await registerRequestTypes(hre, [MetaTxRequestType.BulkSendBatch]);
};

export { deployInitialBulk };
