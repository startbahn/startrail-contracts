const {
  getAdministratorInstance,
  getContract,
  suppressLoggerWarnings,
} = require("./hardhat-helpers");

const addCustomHistoryType = async (hre, historyTypeName) => {
  const adminContract = await getAdministratorInstance(hre);
  suppressLoggerWarnings(hre.ethers);
  const srContract = await getContract(hre, "StartrailRegistry");

  const {
    data: addTypeEncoded,
  } = await srContract.populateTransaction.addCustomHistoryType(
    historyTypeName
  );
  console.log(
    `\nSending StartrailRegistry.addCustomHistoryType transaction for ` +
      `new type [${historyTypeName}]`
  );

  return adminContract.execTransaction({
    to: srContract.address,
    data: addTypeEncoded,
    waitConfirmed: true,
  });
};

module.exports = {
  addCustomHistoryType,
};
