const { getAdministratorInstance, getContract } = require("./hardhat-helpers");

const nameRegistrySet = async (
  hre,
  contractKey,
  contractAddress,
  logMsg = true
) => {
  const adminContract = await getAdministratorInstance(hre);
  const nrContract = await getContract(hre, "NameRegistry");

  const { data: setEncoded } = await nrContract.populateTransaction.set(
    contractKey,
    contractAddress
  );

  if (logMsg) {
    console.log(
      `\nSending NameRegistry.set(${contractKey}, ${contractAddress})`
    );
  }

  return adminContract.execTransaction({
    to: nrContract.address,
    data: setEncoded,
    waitConfirmed: true,
  });
};

module.exports = {
  nameRegistrySet,
};
