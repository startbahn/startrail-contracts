const hre = require("hardhat");

async function main() {
  if (process.argv.length < 3) {
    console.log(`
Usage: HARDHAT_NETWORK=<network> npx ts-node scripts/contract-event-topics.js <contract name>
`);
    process.exit(-1);
  }

  const contractName = process.argv[2];
  const artifact = await hre.artifacts.readArtifact(contractName);
  const cInterface = new hre.ethers.utils.Interface(artifact.abi);
  const topics = cInterface.fragments
    .filter((f) => {
      console.log(f);
      return f.type === "event";
    })
    .map((f) => ({
      name: f.name,
      inputs: f.inputs.length,
      topic: cInterface.getEventTopic(f),
    }));

  console.log(JSON.stringify(topics, null, 2));
}

main();
