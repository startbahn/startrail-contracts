import { red } from 'colors'
import fs from 'fs'
import hre from 'hardhat'

import { loadDeployJSON } from '../utils/deployment/deploy-json'
import { getContract, parseLogs, waitTxHH } from '../utils/hardhat-helpers'

async function main() {
  if (process.argv.length < 3) {
    console.log(`
Usage: HARDHAT_NETWORK=<network> npx ts-node scripts/generalized-bulk-approve-by-commitment.ts <generalized-bulk-approve-by-commitment.json>
    
generalized-bulk-approve-by-commitment.json example (see scripts/__data__ for files):
{
  "merkleProof": [
    "0x1ba60a60bfd7e56f4dbd085904da7fded34aa806f31f927e83c2dbc8bdc0257f"
  ],
  "merkleRoot": "0xb3dbc1f0288b569840937cab66645f22b0cac106920c3b9272a968fae9472ac7",
  "leafHash": "0x5dff4266f45820d2517539dba44061a3be1d8598165bb5fdbd79a9ba8774bb8d",
  "tokenId": 725195465807,
  "commitment": "0x10ca3eff73ebec87d2394fc58560afeab86dac7a21f5e402ea0a55e5c8a6758f",
  "historyMetadataDigest": "0xe515947139053d36f28e833667f77df096b1dd3ecdd0146bce6cc5fa38700615",
  "customHistoryId": 0
}
`);
    process.exit(-1);
  }

  const deployJSON = loadDeployJSON(hre);
  const bulk = await getContract(hre, "Bulk");

  const bulkInput = JSON.parse(
    fs.readFileSync(process.argv[2]).toString()
  );

  const transferResult = await bulk[
    "approveSRRByCommitmentWithProof(bytes32[],bytes32,bytes32,uint256,bytes32,string,uint256)"
  ](...Object.values(bulkInput));
  const txReceipt = await waitTxHH(hre, transferResult, 0);
  console.log(
    `\nlogs: ${JSON.stringify(
      await parseLogs(hre, deployJSON, txReceipt.logs),
      null,
      2
    )}`
  );

  console.log(`\nstatus: ${txReceipt.status}\n`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(red(`\nFailure: ${error.toString()}\n`));
    process.exit(1);
  });
