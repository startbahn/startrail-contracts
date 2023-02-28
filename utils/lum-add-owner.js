const hre = require("hardhat");

const { licensedUserArrayToRecord } = require("../test/helpers/utils");
const { getAdministratorInstance, getContract } = require("./hardhat-helpers");
const { loadDeployJSON } = require("../utils/deployment/deploy-json");

const lumAddOwner = async (
  walletAddress,
  owner
) => {
  const deployJSON = loadDeployJSON(hre);
  const licensedUserManager = await getContract(hre, "LicensedUserManager");

  console.log(`\n\n-----------    Before call data  -----------\n`);

  const {
    data: addOwnerCallData,
  } = await licensedUserManager.populateTransaction.addOwner(
    walletAddress,
    owner,
    1
  );

  console.log(`calldata: ${JSON.stringify(addOwnerCallData)}`);

  const admin = await getAdministratorInstance(hre);
  await admin.execTransaction({
    to: deployJSON.licensedUserManagerProxyAddress,
    data: addOwnerCallData,
  });

  console.log(
    `licensedUser(${walletAddress}): ${JSON.stringify(
      licensedUserArrayToRecord(
        await licensedUserManager.getLicensedUser(walletAddress)
      ),
      null,
      2
    )}`
  );

  return walletAddress;
};

module.exports = {
  lumAddOwner,
};
