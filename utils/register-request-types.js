const { Operation } = require("../startrail-common-js/contracts/types");
const {
  metaTxRequests,
} = require("../startrail-common-js/meta-tx/meta-tx-request-registry");

const { getProxyAddressByContractName } = require("./deployment/deploy-json");
const { getAdministratorInstance, getContract } = require("./hardhat-helpers");

/**
 * Register all MetaTxRequestTypes with the MetaTxForwarder.
 *
 * Optionally only register types related to a single destination contract by
 * setting options.destinationFilter.
 *
 * @param {HardhatRuntimeEnvironment} hre Hardhat runtime instance
 * @param {MetaTxRequestType[]} requestTypes List of types to register
 * @return {Promise<void>}
 */
const registerRequestTypes = async (hre, requestTypes) => {
  console.log(`\n=====    registerRequestTypes invoked    ======\n`);
  console.log(`types: [${requestTypes}]\n`)
  const mtfContract = await getContract(hre, "MetaTxForwarder");
  await registerRequestTypesCallByAdmin(hre, mtfContract, requestTypes);
};

// For deployed environments - must send from Admin contract
const registerRequestTypesCallByAdmin = async (
  hre,
  mtfContract,
  requestTypes,
  gasLimit = 1500000
) => {
  const requestCalldataList = await Promise.all(
    requestTypes.map((requestTypeKey) =>
      mtfContract.populateTransaction
        .registerRequestType(
          ...buildRegisterRequestTypeInputProps(
            requestTypeKey,
            getDestinationAddress(hre, requestTypeKey)
          )
        )
        .then((tx) => tx.data)
    )
  );

  const adminContract = await getAdministratorInstance(hre);

  if (requestCalldataList.length > 1) {
    const multiSendEncoded = adminContract.encodeMultiSendSingleDestination(
      Operation.CALL,
      mtfContract.address,
      requestCalldataList
    );
    console.log(
      `\nSending MultiSend transaction to register [${requestCalldataList.length}] request types`
    );
    await adminContract.execTransaction({
      data: multiSendEncoded,
      multiSend: true,
      waitConfirmed: true,
      gasLimit,
    });
  } else {
    await adminContract.execTransaction({
      data: requestCalldataList[0],
      to: mtfContract.address,
      waitConfirmed: true,
      gasLimit,
    });
  }
};

const registerRequestTypesGenesisSet = (hre) => {
  const genesisSet = [
    `WalletAddOwner`,
    `WalletRemoveOwner`,
    `WalletChangeThreshold`,
    `WalletSwapOwner`,
    `WalletSetEnglishName`,
    `WalletSetOriginalName`,
    `StartrailRegistryCreateSRR`,
    `StartrailRegistryUpdateSRR`,
    `StartrailRegistryUpdateSRRMetadata`,
    `StartrailRegistryApproveSRRByCommitment`,
    `StartrailRegistryApproveSRRByCommitmentWithCustomHistoryId`,
    `StartrailRegistryCancelSRRCommitment`,
    `BulkIssueSendBatch`,
  ];
  return registerRequestTypes(hre, genesisSet);
};

/**
 * Build the property list for passing to the contract function
 * registerRequestType in MetaTxRequestManager.sol.
 * @param {string} requestTypeKey Key into metaTxRequests
 * @param {string} destinationContractAddr Destination address for the request
 */
const buildRegisterRequestTypeInputProps = (
  requestTypeKey,
  destinationContractAddr
) => [
    // string calldata _typeName
    requestTypeKey,
    // string calldata _typeSuffix
    metaTxRequests[requestTypeKey].suffixTypeString,
    // address _destinationContract
    destinationContractAddr,
    // bytes4 _functionSignature
    metaTxRequests[requestTypeKey].contractFunctionSigHash,
  ];

/**
 * Get the deployment address of the destination contract for the given
 * MetaTxRequest.
 * @param {string} requestTypeKey Key into metaTxRequests
 * @return {string} deployed destination contract address
 */
const getDestinationAddress = (hre, requestTypeKey) =>
  getProxyAddressByContractName(
    hre,
    metaTxRequests[requestTypeKey].destinationContract
  );

module.exports = {
  buildRegisterRequestTypeInputProps,
  registerRequestTypes,
  registerRequestTypesGenesisSet,
};
