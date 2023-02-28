const hre = require("hardhat");

const { UserType } = require("../startrail-common-js/contracts/types");

const { getAdministratorInstance, getContract } = require("./hardhat-helpers");
const { loadDeployJSON } = require("../utils/deployment/deploy-json");
const { decodeEventLog } = require("../startrail-common-js/ethereum/tx-helpers");

const lumUpdateOriginalName = async ({
  walletAddress,
  originalName
}) => {
  const deployJSON = loadDeployJSON(hre);
  const licensedUserManager = await getContract(hre, "LicensedUserManager");

  console.log(`\n\n-----------    Before call data  -----------\n`);

  console.log(walletAddress)
  console.log(originalName)

  const {
    data: updateLUCallData,
  } = await licensedUserManager.populateTransaction.setOriginalName(
    walletAddress,originalName
  );
  
  console.log(`calldata: ${JSON.stringify(updateLUCallData)}`);

  const admin = await getAdministratorInstance(hre);
  const updateLUTxReceipt = await admin.execTransaction({
    to: deployJSON.licensedUserManagerProxyAddress,
    data: updateLUCallData,
  });

  const eventDecoded = decodeEventLog(
    licensedUserManager,
    "UpdateLicensedUserDetail",
    updateLUTxReceipt.logs[0]
  );

  const luAddress = eventDecoded[0];
  const key = eventDecoded[1];
  const value = eventDecoded[2];

  console.log(
    `\nLicensedUser with address [${luAddress}] and details Key - [${key}] has been updated with value - [${value}]: ${JSON.stringify(
      await licensedUserManager.getLicensedUser(luAddress),
      null,
      2
    )}\n`
  );

  return luAddress;
};

module.exports = {
  lumUpdateOriginalName,
};
