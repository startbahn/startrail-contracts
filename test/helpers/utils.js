const hre = require("hardhat");
const {
  constants: ethersConstants,
  utils: ethersUtils,
  ethers,
} = require("ethers");
const stripHexPrefix = require("strip-hex-prefix");

const { UserType } = require("../../startrail-common-js/contracts/types");
const { sha256 } = require("../../startrail-common-js/digest/sha256");
const { add0xPrefix } = require("../../startrail-common-js/ethereum/utils");
const {
  MetaTxForwarder,
} = require("../../startrail-common-js/contracts/meta-tx-forwarder");
const {
  MetaTxRequestType,
} = require("../../startrail-common-js/meta-tx/meta-tx-request-registry");
const { getNonce } = require("../../startrail-common-js/meta-tx/nonce");

const { loadDeployJSON } = require("../../utils/deployment/deploy-json");
const {
  decodeEventLog,
  getAdministratorSigner,
  getContract,
} = require("../../utils/hardhat-helpers");
const { randomAddress, randomBoolean } = require('../../startrail-common-js/test-helpers/test-utils');

const ZERO_ADDRESS = ethersConstants.AddressZero;

// see OwnerManager.sol SENTINAL_OWNERS
const SENTINEL_ADDRESS = "0x0000000000000000000000000000000000000001";

/**
 * Compute the create2 LicensedUser wallet address given the salt
 * @param {string} lumAddress Address of the LicensedUserManager.
 * @param {string} salt A hex string of a bytes32 salt.
 * @return {string} Computed create2 address
 */
const generateLicensedUserCreate2Address = async (lumAddress, salt) =>
  hre.ethers
    .getContractFactory("WalletProxyMinimal")
    .then((walletProxy) =>
      ethersUtils.getCreate2Address(
        lumAddress,
        salt,
        ethersUtils.keccak256(walletProxy.bytecode)
      )
    );

/**
 * Generate a random Salt for create2 input
 * @returns {string} Hex string of a random bytes32 value
 */
const randomSalt = () => ethersUtils.id(String(Math.random()));

const randomText = () =>
  Math.random()
    .toString(36)
    .replace(/[^a-z]+/g, "")
    .substr(0, 5);

const randomSha256 = () => add0xPrefix(sha256(String(Math.random())))

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
    englishName: "Name English",
    originalName: "Name Original",
    ...overrides,
  },
  salt: randomSalt(),
});

/**
 * Create LUW from an Admin EOA as opposed to from admin contract.
 * @return Arguments emitted from event CreateLicensedUserWallet.
 */
const createLicensedUserWalletDirect = async (
  hreArg,
  detailsOverride,
  adminWallet,
  saltOverride
) => {
  const walletRequest = createLicensedUserWalletRequest(detailsOverride);
  const walletSalt = saltOverride ? saltOverride : walletRequest.salt;

  const lum = await getContract(hreArg, "LicensedUserManager");
  const lumFromAdmin = lum.connect(adminWallet);

  return lumFromAdmin
    .createWallet(Object.values(walletRequest.details), walletSalt)
    .then((txRsp) => txRsp.wait(0))
    .then((txReceipt) =>
      decodeEventLog(lum, "CreateLicensedUserWallet", txReceipt.logs[0])
    );
};

/**
 * Create a StartrailRegistry.createSRR request
 * @param {string} overrides Contract handle for StartrailRegistry
 * @return {string} Encoded calldata string for createSRR call
 */
const createSRRRequest = (overrides) => ({
  isPrimaryIssuer: true,
  artistAddress: randomAddress(),
  metadataDigest: ethersUtils.id("any hash"),
  lockExternalTransfer: randomBoolean(),

  ...overrides,
});

const licensedUserArrayToRecord = (luwArray) => ({
  owners: luwArray[0],
  threshold: luwArray[1],
  active: luwArray[2],
  userType: luwArray[3],
  englishName: luwArray[4],
  originalName: luwArray[5],
});

const srrArrayToRecord = (srrArray) => ({
  isPrimaryIssuer: srrArray[0][0],
  artistAddress: srrArray[0][1],
  issuer: srrArray[0][2],
  metadataDigest: srrArray[1],
});

/**
 * Encode, sign and execute transaction from a licensed user wallet.
 * @param {MetaTxRequestType} requestTypeKey Key into meta-tx-request-types.ts metaTxRequests
 * @param {string} fromAddress user wallet address
 * @param {Record<string, any>} requestData Contract function request data
 * @param {ethers.Wallet[]} signerWallets Array of signer wallets
 * @param {boolean} fromEOA? EOA or LU for address (defaults to false)
 * @param {number} batchId? Nonce 1 in the 2D nonce (defaults to 0)
 * @return {ethers.TransactionResponse} Response from transaction execution.
 */
const encodeSignExecute = async (
  requestTypeKey,
  fromAddress,
  requestData,
  signerWallets,
  fromEOA = false,
  batchId = 0,
  invalidNonce = false
) => {
  const { metaTxForwarderProxyAddress } = loadDeployJSON(hre);

  const forwarder = new MetaTxForwarder(
    hre.network.config.chainId,
    ethers.provider,
    await getAdministratorSigner(hre),
    metaTxForwarderProxyAddress
  );

  let nonce;
  if (invalidNonce) {
    nonce = (await getNonce(forwarder.contract, fromAddress, batchId)).add(1000);
  } else {
    nonce = await getNonce(forwarder.contract, fromAddress, batchId);
  }

  const signatures = await forwarder.signRequestTypedData(
    { requestTypeKey, fromAddress, nonce, requestData },
    signerWallets
  );

  if (fromEOA && signatures.length == 1) {
    return forwarder.executeTransactionEOA({
      request: { requestTypeKey, fromAddress, nonce, requestData },
      signature: signatures[0],
    });
  } else {
    return forwarder.executeTransactionLUW({
      request: { requestTypeKey, fromAddress, nonce, requestData },
      signatures,
    });
  }
};

/**
 * Append address to calldata (EIP2771 style)
 * @param {string} baseCalldata
 * @param {string} eip2771Address
 */
const buildEIP2711Calldata = (baseCalldata, eip2771Address) =>
  `${baseCalldata}${stripHexPrefix(eip2771Address)}`;

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
 * @return {Promise<ethers.TransactionResponse>} Transaction receipt
 */
const sendWithEIP2771 = (
  destinationContract,
  fnName,
  args,
  eip2711Sender,
  forwarderWallet
) =>
  destinationContract.populateTransaction[fnName](...args).then(
    ({ data }) =>
      forwarderWallet.sendTransaction({
        to: destinationContract.address,
        data: buildEIP2711Calldata(data, eip2711Sender),
        gasLimit: 5000000
      })
  );

module.exports = {
  generateLicensedUserCreate2Address,
  randomSalt,
  randomSha256,
  randomText,

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
};
