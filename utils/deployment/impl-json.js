const fs = require("fs");
const path = require("path");

const implJSONPath = (hre) =>
  path.join(process.cwd(), `deployments`, hre.network.name, `impl.json`);

  const loadImplJSON = (hre) =>
  JSON.parse(fs.readFileSync(implJSONPath(hre)).toString());

const saveImplJSON = (hre, implJSON, logJSON = false) => {
  const filePath = implJSONPath(hre);
  const fileDir = path.dirname(filePath);
  if (!fs.existsSync(fileDir)) {
    fs.mkdirSync(fileDir, { recursive: true });
  }

  const implJSONStr = JSON.stringify(implJSON, null, 2);
  fs.writeFileSync(filePath, implJSONStr);
  if (logJSON) {
    console.log(`\impl.json saved:\n${implJSONStr}`);
  }

  return implJSON;
};


const updateImplJSON = (hre, contractAddresses) => {
  const implJSON = loadImplJSON(hre);
  return saveImplJSON(hre, {
    ...implJSON,
    ...contractAddresses,
  });
};

// const getProxyAddressByContractName = (hre, contractName) => {
//   const implJSON = loadDeployJSON(hre);
//   const implJSONKey =
//     contractName.charAt(0).toLowerCase() +
//     contractName.substring(1) +
//     `ProxyAddress`;
//   return implJSON[implJSONKey];
// };

module.exports = {
  loadImplJSON,
  saveImplJSON,
  updateImplJSON,
};
