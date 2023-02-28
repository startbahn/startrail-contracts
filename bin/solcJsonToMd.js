const doT = require("dot");
const fs = require("fs");
const path = require("path");
// const fs = require("fs");

const DOTJS_TEMPLATE_PATH = path.join(process.cwd(), "bin", "solcJsonToMd.dot");

if (process.argv.length < 3) {
  console.log(`Usage: node bin/solcJsonToMd.js <contractName>`);
  process.exit(-1);
}

const contractName = process.argv[2];
const contractJSONFile = path.join(
  process.cwd(),
  ".deployments",
  "localhost",
  `${contractName}.json`
);
if (!fs.existsSync(contractJSONFile)) {
  console.log(
    `Contract JSON not found at ${contractJSONFile}. ` +
      `Run "hardhat node" one time to generate the JSON files.`
  );
  process.exit(-2);
}

const contractJSON = JSON.parse(fs.readFileSync(contractJSONFile).toString());
contractJSON.name = contractName;

const templateText = fs.readFileSync(DOTJS_TEMPLATE_PATH).toString();
const renderMarkdown = doT.template(templateText, { strip: false });
const resultText = renderMarkdown(contractJSON);

console.log(resultText);
