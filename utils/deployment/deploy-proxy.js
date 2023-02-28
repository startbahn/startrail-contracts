const deployProxy = async ({
  hre,
  implContract,
  proxyAdminAddress,
  initializerArgs = [],
}) => {
  const implInitializerFn = implContract.interface.getFunction("initialize");
  const initializeEncoded = implContract.interface.encodeFunctionData(
    implInitializerFn,
    initializerArgs
  );
  // console.log(initializeEncoded);

  const StartrailProxy = await hre.ethers.getContractFactory("StartrailProxy");
  const proxy = await StartrailProxy.deploy(
    implContract.address,
    proxyAdminAddress,
    initializeEncoded
  );
  return proxy.deployed();
};

module.exports = { deployProxy };
