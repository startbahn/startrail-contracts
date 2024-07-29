import {
  constants as ethersConstants,
  Contract,
  utils as ethersUtils,
} from 'ethers'
import hre, { ethers } from 'hardhat'
import { CID } from 'multiformats/cid'
import { code, encode } from 'multiformats/codecs/json'
import { sha256 as multiformatssha256 } from 'multiformats/hashes/sha2'
import { MetaTxForwarder } from '../../startrail-common-js/contracts/meta-tx-forwarder'
import { UserType } from '../../startrail-common-js/contracts/types'
import { sha256 } from '../../startrail-common-js/digest/sha256'
import { add0xPrefix } from '../../startrail-common-js/ethereum/utils'
import { getNonce } from '../../startrail-common-js/meta-tx/nonce'
import { MetaTxRequestType } from '../../startrail-common-js/meta-tx/types'
import {
  randomAddress,
  randomBoolean,
} from '../../startrail-common-js/test-helpers/test-utils'
import stripHexPrefix from 'strip-hex-prefix'

import { TransactionResponse } from '@ethersproject/abstract-provider'
import { Wallet } from '@ethersproject/wallet'

import { loadDeployJSON } from '../../utils/deployment/deploy-json'
import {
  decodeEventLog,
  getAdministratorSigner,
  getContract,
} from '../../utils/hardhat-helpers'

const ZERO_ADDRESS = ethersConstants.AddressZero

const ZERO_METADATA_DIGEST =
  '0x0000000000000000000000000000000000000000000000000000000000000000'

// see OwnerManager.sol SENTINAL_OWNERS
const SENTINEL_ADDRESS = '0x0000000000000000000000000000000000000001'

/**
 * Compute the create2 LicensedUser wallet address given the salt
 * @param {string} lumAddress Address of the LicensedUserManager.
 * @param {string} salt A hex string of a bytes32 salt.
 * @return {string} Computed create2 address
 */
const generateLicensedUserCreate2Address = async (lumAddress, salt) =>
  hre.ethers
    .getContractFactory('WalletProxyMinimal')
    .then((walletProxy) =>
      ethersUtils.getCreate2Address(
        lumAddress,
        salt,
        ethersUtils.keccak256(walletProxy.bytecode)
      )
    )

/**
 * Generate a random Salt for create2 input
 * @returns {string} Hex string of a random bytes32 value
 */
const randomSalt = () => ethersUtils.id(String(Math.random()))

const randomText = () =>
  Math.random()
    .toString(36)
    .replace(/[^a-z]+/g, '')
    .substring(0, 5)

const randomSha256 = () => add0xPrefix(sha256(String(Math.random())))

const randomCID = async (): Promise<string> => {
  const data = Buffer.from(randomText())
  const bytes = encode(data)
  const hash = await multiformatssha256.digest(bytes)
  const cid = CID.create(1, code, hash)
  return cid.toString()
}

/**
 * Build createUserMulti request properties
 * @param {object} overrides Override properties in the default request
 * @return {object} Name value pairs for createUserMulti call
 */
const createLicensedUserWalletRequest = (overrides) => ({
  details: {
    // struct LicensedUserDto
    owners: [ethers.Wallet.createRandom().address],
    threshold: 1,
    userType: UserType.HANDLER,
    englishName: 'Name English',
    originalName: 'Name Original',
    ...overrides,
  },
  salt: randomSalt(),
})

/**
 * Create LUW from an Admin EOA as opposed to from admin contract.
 * @return Arguments emitted from event CreateLicensedUserWallet.
 */
const createLicensedUserWalletDirect = async (
  hreArg,
  detailsOverride,
  adminWallet,
  saltOverride?: string
) => {
  const walletRequest = createLicensedUserWalletRequest(detailsOverride)
  const walletSalt = saltOverride ? saltOverride : walletRequest.salt

  const lum = await getContract(hreArg, 'LicensedUserManager')
  const lumFromAdmin = lum.connect(adminWallet)

  return lumFromAdmin
    .createWallet(Object.values(walletRequest.details), walletSalt)
    .then((txRsp) => txRsp.wait(0))
    .then((txReceipt) =>
      decodeEventLog(lum, 'CreateLicensedUserWallet', txReceipt.logs[0])
    )
}

/**
 * Create a StartrailRegistry.createSRR data request
 * @param overrides An optional object for overriding the data request.
 * @returns SRR creation data request
 */
const createSRRRequest = async (
  overrides = {}
): Promise<Record<string, boolean | number | string>> => ({
  isPrimaryIssuer: true,
  artistAddress: randomAddress(),
  metadataCID: await randomCID(),
  lockExternalTransfer: randomBoolean(),
  to: ZERO_ADDRESS,
  royaltyReceiver: randomAddress(),
  royaltyBasisPoints: 500,
  ...overrides,
})

const licensedUserArrayToRecord = (luwArray) => ({
  owners: luwArray[0],
  threshold: luwArray[1],
  active: luwArray[2],
  userType: luwArray[3],
  englishName: luwArray[4],
  originalName: luwArray[5],
})

const srrArrayToRecord = (srrArray) => ({
  isPrimaryIssuer: srrArray[0][0],
  artistAddress: srrArray[0][1],
  issuer: srrArray[0][2],
  metadataDigest: srrArray[1],
})

/**
 * Encode, sign and execute transaction from an LUW or EOA
 * @param requestTypeKey Meta tx request type
 * @param fromAddress user wallet address
 * @param requestData Contract function request data
 * @param signerWallets Array of signer wallets
 * @param fromEOA EOA or LU for address (defaults to false)
 * @param batchId Nonce channel in the 2D nonce (defaults to 0)
 * @param invalidNonce For testing, use an invalid nonce to cause an error
 * @param gasLimit override default gasLimit (default to 500,000)
 * @return TransactionResponse from execution.
 */
const encodeSignExecute = async ({
  requestTypeKey,
  fromAddress,
  requestData,
  signerWallets,
  fromEOA = false,
  batchId = 0,
  invalidNonce = false,
  gasLimit = 500000,
}: {
  requestTypeKey: MetaTxRequestType
  fromAddress: string
  requestData: Record<string, any>
  signerWallets: Wallet[]
  fromEOA?: boolean
  batchId?: number
  invalidNonce?: boolean
  gasLimit?: number
}): Promise<TransactionResponse> => {
  const { metaTxForwarderProxyAddress } = loadDeployJSON(hre)

  const forwarder = new MetaTxForwarder(
    hre.network.config.chainId,
    hre.ethers.provider,
    await getAdministratorSigner(hre),
    metaTxForwarderProxyAddress
  )

  let nonce
  if (invalidNonce) {
    nonce = (await getNonce(forwarder.contract, fromAddress, batchId)).add(1000)
  } else {
    nonce = await getNonce(forwarder.contract, fromAddress, batchId)
  }

  const request = { requestTypeKey, fromAddress, nonce, requestData }

  const signatures = await forwarder.signRequestTypedData(
    request,
    signerWallets
  )

  if (fromEOA && signatures.length == 1) {
    return forwarder.executeTransactionEOA({
      request,
      signature: signatures[0],
      gasLimit,
    })
  } else {
    return forwarder.executeTransactionLUW({
      request,
      signatures,
      gasLimit,
    })
  }
}

/**
 * Append address to calldata (EIP2771 style)
 * @param {string} baseCalldata
 * @param {string} eip2771Address
 */
const buildEIP2711Calldata = (baseCalldata, eip2771Address) =>
  `${baseCalldata}${stripHexPrefix(eip2771Address)}`

/**
 * Send a transaction to a given contract appending a sender address to the
 * calldata (EIP2711).
 *
 * Signs the transaction with the given forwarderWallet. This is an EOA signer
 * wallet that is masquerading as the MetaTxForwarder contract for the purposes
 * of unit testing.
 *
 * @param {ethers.Contract} destinationContract Contract to send transaction to
 * @param {string} fnName Function on contact to call
 * @param {any[]} args Array of arguments to contract function
 * @param {address} eip2711Sender Address to append to calldata (typically an LUW)
 * @param {ethers.Wallet} forwarderWallet Sign and send tx with this wallet
 * @return Transaction receipt
 */
const sendWithEIP2771 = (
  destinationContract: Contract,
  fnName: string,
  args: ReadonlyArray<any>,
  eip2711Sender: string,
  forwarderWallet: Wallet
): Promise<TransactionResponse> =>
  destinationContract.populateTransaction[fnName](...args).then(({ data }) =>
    forwarderWallet.sendTransaction({
      to: destinationContract.address,
      data: buildEIP2711Calldata(data, eip2711Sender),
      gasLimit: 5000000,
    })
  )

const BULK_CONTRACT_METHOD_KEYS = Object.freeze({
  create: `createSRRWithProofMulti(bytes32[][],bytes32,bytes32[],bool[],address[],string[],bool[],address[],uint16[],address[])`,
  createStartrailRegistry: `createSRRWithProofMulti(bytes32[][],bytes32,bytes32[],bool[],address[],bytes32[],string[],bool[],address[],uint16[])`,
  approve: `approveSRRByCommitmentWithProof(bytes32[],bytes32,bytes32,uint256,bytes32,string,uint256,address)`,
  approveStartrailRegistry: `approveSRRByCommitmentWithProof(bytes32[],bytes32,bytes32,uint256,bytes32,string,uint256)`,
  transfer: `transferFromWithProvenanceWithProof(bytes32[],bytes32,bytes32,address,uint256,string,uint256,bool,address)`,
  transferStartrailRegistry: `transferFromWithProvenanceWithProof(bytes32[],bytes32,bytes32,address,uint256,string,uint256,bool)`,
})

const BULK_CONTRACT_EVENT_KEYS = Object.freeze({
  create: `CreateSRRWithProof(bytes32,address,uint256,bytes32)`,
  createStartrailRegistry: `CreateSRRWithProof(bytes32,uint256,bytes32)`,
  approve: `ApproveSRRByCommitmentWithProof(bytes32,address,uint256,bytes32)`,
  approveStartrailRegistry: `ApproveSRRByCommitmentWithProof(bytes32,uint256,bytes32)`,
  transfer: `TransferFromWithProvenanceWithProof(bytes32,address,uint256,bytes32)`,
  transferStartrailRegistry: `TransferFromWithProvenanceWithProof(bytes32,uint256,bytes32)`,
})

export {
  generateLicensedUserCreate2Address,
  randomSalt,
  randomSha256,
  randomText,
  randomCID,

  // wallet create and execution helpers
  createLicensedUserWalletDirect,
  createLicensedUserWalletRequest,
  createSRRRequest,
  encodeSignExecute,
  sendWithEIP2771,

  // Array to key value Record
  licensedUserArrayToRecord,
  srrArrayToRecord,

  // constant addresses
  ZERO_ADDRESS,
  SENTINEL_ADDRESS,
  ZERO_METADATA_DIGEST,

  // bulk contract keys
  BULK_CONTRACT_METHOD_KEYS,
  BULK_CONTRACT_EVENT_KEYS,
}
