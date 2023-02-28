const fs = require("fs");
const path = require("path");

const deployJSONPath = (hre) =>
  path.join(process.cwd(), `deployments`, hre.network.name, `deploy.json`);

const loadDeployJSON = (hre) =>
  JSON.parse(fs.readFileSync(deployJSONPath(hre)).toString());

const saveDeployJSON = (hre, deployJSON, logJSON = false) => {
  const filePath = deployJSONPath(hre);
  const fileDir = path.dirname(filePath);
  if (!fs.existsSync(fileDir)) {
    fs.mkdirSync(fileDir, { recursive: true });
  }

  const deployJSONStr = JSON.stringify(deployJSON, null, 2);
  fs.writeFileSync(filePath, deployJSONStr);
  if (logJSON) {
    console.log(`\ndeploy.json saved:\n${deployJSONStr}`);
  }

  return deployJSON;
};

const updateDeployJSON = (hre, contractAddresses) => {
  const deployJSON = loadDeployJSON(hre);
  return saveDeployJSON(hre, {
    ...deployJSON,
    ...contractAddresses,
  });
};

const getProxyAddressByContractName = (hre, contractName) => {
  const deployJSON = loadDeployJSON(hre);
  const deployJSONKey =
    contractName.charAt(0).toLowerCase() +
    contractName.substring(1) +
    `ProxyAddress`;
  return deployJSON[deployJSONKey];
};

module.exports = {
  loadDeployJSON,
  saveDeployJSON,
  updateDeployJSON,
  getProxyAddressByContractName,
};
