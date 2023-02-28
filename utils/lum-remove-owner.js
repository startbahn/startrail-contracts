const hre = require("hardhat");

const { licensedUserArrayToRecord } = require("../test/helpers/utils");
const { getAdministratorInstance, getContract } = require("./hardhat-helpers");
const { loadDeployJSON } = require("../utils/deployment/deploy-json");

// see OwnerManager.sol SENTINAL_OWNERS
const SENTINEL_ADDRESS = "0x0000000000000000000000000000000000000001";

const findPreviousOwner = (ownerList, owner) => {
  const ownerToRemoveIdx = ownerList.indexOf(owner)
  return ownerToRemoveIdx > 0 ?
    ownerList[ownerToRemoveIdx - 1] :
    SENTINEL_ADDRESS
}

const setNewThreshold = (ownerList, currentThreshold) =>
  currentThreshold === ownerList.length ?
    currentThreshold - 1 :
    currentThreshold

const lumRemoveOwner = async (
  walletAddress,
  ownerToRemove
) => {
  const deployJSON = loadDeployJSON(hre);
  const licensedUserManager = await getContract(hre, "LicensedUserManager");

  const ownerList = await licensedUserManager.getOwners(walletAddress)

  if (!ownerList.includes(ownerToRemove)) {
    throw new Error('Reject attempt to remove owner that is not an owner of the LUW')
  } else if (ownerList.length < 2) {
    throw new Error('Reject attempt to remove owner when only one owner exists')
  }

  const previousOwner = findPreviousOwner(ownerList, ownerToRemove)

  const newThreshold = setNewThreshold(
    ownerList,
    await licensedUserManager.getThreshold(walletAddress)
  )

  console.log(`\n\n-----------    Before call data  -----------\n`);

  const {
    data: removeOwnerCallData,
  } = await licensedUserManager.populateTransaction.removeOwner(
    walletAddress,
    previousOwner,
    ownerToRemove,
    newThreshold
  );

  console.log(`calldata: ${JSON.stringify(removeOwnerCallData)}`);

  const admin = await getAdministratorInstance(hre);
  await admin.execTransaction({
    to: deployJSON.licensedUserManagerProxyAddress,
    data: removeOwnerCallData,
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
  lumRemoveOwner,
};
