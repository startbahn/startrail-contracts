import { red } from 'colors'
import fs from 'fs'
import hre from 'hardhat'

import { MetaTxRequestType } from '../startrail-common-js/meta-tx/meta-tx-request-registry'

import { loadDeployJSON } from '../utils/deployment/deploy-json'
import { parseLogs } from '../utils/hardhat-helpers'
import { metaTxSend } from '../utils/meta-tx-send'
import { Command } from 'commander'

const { ethers } = hre

const deployJSON = loadDeployJSON(hre)

async function main() {
  const program = new Command()
  program
    .requiredOption(
      '-m, --meta-tx-file [file]',
      'one meta-tx request JSON files'
    )
    .option(
      '-a, --from-address [from address]',
      'an address from which the tx is created'
    )
    .option(
      '-k, --private-key [private key]',
      'Private key for signing the meta-txs'
    )
    .option(
      '-e, --eoa-flag',
      'a flag whether from address is EOA, default is false',
      false
    )

  program.parse(process.argv)

  const programOpts = program.opts()
  const { fromAddress, metaTxFile, privateKey, eoaFlag } = programOpts
  const metaTxInput = JSON.parse(fs.readFileSync(metaTxFile).toString())
  const { requestTypeKey } = metaTxInput
  let { requestData } = metaTxInput

  // TODO: specify index into signers as arg OR private key as arg
  const signerWallet = new ethers.Wallet(
    privateKey ? privateKey : hre.config.networks[hre.network.name].accounts[1]
    // process.argv[4] || hre.config.networks[hre.network.name].accounts[2]
  )

  console.log(
    `\n\n------   Sending meta tx ${requestTypeKey}   ------` +
      `\n\nfromAddress: ${fromAddress}\n`
  )

  // Set the wallet property from luwAddress for these 2 types.
  if (
    requestTypeKey === MetaTxRequestType.WalletSetEnglishName ||
    requestTypeKey === MetaTxRequestType.WalletSetOriginalName
  ) {
    requestData = { wallet: fromAddress, ...requestData }
  }

  const execReceipt = await metaTxSend({
    requestTypeKey,
    requestData,
    fromAddress,
    signerWallet,
    fromEOA: eoaFlag,
  })

  console.log(
    `\nlogs: ${JSON.stringify(
      await parseLogs(hre, deployJSON, execReceipt.logs),
      null,
      2
    )}`
  )

  console.log(`\nstatus: ${execReceipt.status}\n`)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(
      red(`\nFailure: ${error.toString()}\n\n` + `stack: ${error.stack}\n`)
    )
    process.exit(1)
  })
