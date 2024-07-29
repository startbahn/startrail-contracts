import hre from 'hardhat'

import { MetaTxForwarder } from '../startrail-common-js/contracts/meta-tx-forwarder'
import { metaTxRequests } from '../startrail-common-js/meta-tx/meta-tx-request-registry'

import { loadDeployJSON } from './deployment/deploy-json'
import { getAdministratorSigner, waitTxHH } from './hardhat-helpers'

const { ethers } = hre

const metaTxSend = async ({
  requestTypeKey,
  requestData,
  fromAddress,
  signerWallet,
  fromEOA = false,
  gasLimit = 1_000_000,
}) => {
  const deployJSON = loadDeployJSON(hre)
  const metaTxType = metaTxRequests[requestTypeKey]
  if (!metaTxType) {
    console.log(
      `requestTypeKey [${requestTypeKey}] is not valid. see the meta-tx-request-registry.ts`
    )
    process.exit(-1)
  }

  const ethereumProvider = ethers.provider

  const adminSigner = await getAdministratorSigner(hre)
  const { chainId } = await ethers.provider.getNetwork()

  const forwarder = new MetaTxForwarder(
    chainId,
    ethereumProvider,
    adminSigner,
    deployJSON.metaTxForwarderProxyAddress
  )

  // const luw = await lum.contract.getLicensedUser(luwAddress);
  // console.log(JSON.stringify(luw, null, 2));

  const nonce = await forwarder.contract.getNonce(
    fromAddress,
    ethers.BigNumber.from(0)
  )
  console.log(`nonce: ${JSON.stringify(nonce.toHexString(), null, 2)}`)

  const metaTxRequest = {
    requestTypeKey,
    fromAddress,
    nonce,
    requestData,
  }

  const signatures = await forwarder.signRequestTypedData(metaTxRequest, [
    signerWallet,
  ])
  console.log(`\nsignature(s): ${signatures}`)

  let execResult
  if (fromEOA && signatures.length == 1) {
    execResult = await forwarder.executeTransactionEOA({
      request: metaTxRequest,
      signature: signatures[0],
      gasLimit,
    })
  } else {
    execResult = await forwarder.executeTransactionLUW({
      request: metaTxRequest,
      signatures,
      gasLimit,
    })
  }
  console.log(`after exec ${JSON.stringify(execResult, null, 2)}`)
  return waitTxHH(hre, execResult, 0)
}

export { metaTxSend }
