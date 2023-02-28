import { ethers } from 'ethers'
import hre from 'hardhat'
import { UserType } from '../startrail-common-js/contracts/types'

import { TransactionReceipt } from '@ethersproject/abstract-provider'

import {
  decodeEventLog,
  getAdministratorInstance,
  getContract,
} from './hardhat-helpers'

const lumCreateWallet = async ({
  owners,
  threshold,
  userType,
  englishName,
  originalName,
  salt,
}): Promise<string> => {
  const licensedUserManager: ethers.Contract = await getContract(
    hre,
    "LicensedUserManager"
  );

  const userTypeId = UserType[userType.toUpperCase()];
  if (!Number.isInteger(userTypeId)) {
    console.log(`userType [${userType}] is not valid`);
    process.exit(-1);
  }

  const {
    data: createLUCallData,
  } = await licensedUserManager.populateTransaction.createWallet(
    [owners, threshold, userTypeId, englishName, originalName],
    salt
  );
  // console.log(`calldata: ${JSON.stringify(createLUCallData)}`);

  const admin = await getAdministratorInstance(hre);
  const createLUTxReceipt = (await admin.execTransaction({
    to: licensedUserManager.address,
    data: createLUCallData,
  })) as TransactionReceipt;

  const eventDecoded = decodeEventLog(
    licensedUserManager,
    "CreateLicensedUserWallet",
    createLUTxReceipt.logs[0]
  );

  const luAddress = eventDecoded[0];

  console.log(
    `\nCreated new licensedUser with address [${luAddress}] and details: ${JSON.stringify(
      await licensedUserManager.getLicensedUser(luAddress),
      null,
      2
    )}\n`
  );

  return luAddress;
};

export { lumCreateWallet };
