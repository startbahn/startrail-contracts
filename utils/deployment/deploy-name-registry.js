const { deployContract } = require("./deploy-contract");
const { updateDeployJSON, loadDeployJSON } = require("./deploy-json");
const { saveImplJSON} = require("./impl-json");
const { deployProxy } = require("./deploy-proxy");

const deployNameRegistry = async (hre) => {
  console.log(`\nDeploying the NameRegistry implementation:\n`);
  const nameRegistryImpl = await deployContract(hre, "NameRegistry");
  saveImplJSON(hre, {
    nameRegistryImplementationAddress: nameRegistryImpl.address,
  });
  console.log(
    `NameRegistry (implementation) deployed: ${nameRegistryImpl.address}`
  );

  console.log(`\nDeploying the NameRegistry proxy:\n`);
  const { startrailAdministratorAddress, proxyAdminAddress } = loadDeployJSON(
    hre
  );
  const nameRegistryProxy = await deployProxy({
    hre,
    implContract: nameRegistryImpl,
    proxyAdminAddress: proxyAdminAddress,
    initializerArgs: [startrailAdministratorAddress],
  });
  updateDeployJSON(hre, {
    nameRegistryProxyAddress: nameRegistryProxy.address,
  });
  console.log(`NameRegistry (proxy) deployed: ${nameRegistryImpl.address}`);

  return nameRegistryProxy.address;
};

module.exports = { deployNameRegistry };
