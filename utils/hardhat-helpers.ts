import { ethers } from 'ethers'
import glob from 'glob'
import { HardhatRuntimeEnvironment } from 'hardhat/types'
import lowerFirst from 'lodash/lowerFirst'
import { Administrator } from '../startrail-common-js/contracts/administrator'
import {
  decodeEventLog as decodeEventLogCommonJs,
  waitTx,
} from '../startrail-common-js/ethereum/tx-helpers'

import chainIds from './chain-ids'
import { loadDeployJSON } from './deployment/deploy-json'

/**
 * Get network config from hre. This reflects the hardhat.config.ts values.
 */
const getNetworkConfig = (hre) => hre.config.networks[hre.network.name];

/**
 * Get ethers.Wallet instances for all accounts defined in hardhat.config.ts.
 *
 * NOTE: hardhat-waffle provides a similar function however we want this
 * available in and outside of tests so this function is implemented here.
 */
const getWallets = (
  hre: HardhatRuntimeEnvironment
): ReadonlyArray<ethers.Wallet> =>
  getNetworkConfig(hre).accounts.map(
    (acc) => new ethers.Wallet(acc.privateKey, hre.ethers.provider)
  );

/**
 * Is this a 'live' network?
 * - true -> connecting to mainnet, rinkeby, etc.
 * - false -> connecting to a local hardhat network
 */
const isLiveNetwork = (hre) => {
  const { chainId } = hre.network.config;
  return (
    chainId && chainId !== chainIds.hardhat && chainId !== chainIds.ganache
  );
};

/**
 * Is this a local hardhat network
 */
const isLocalNetwork = (hre) => !isLiveNetwork(hre);

/**
 * Is the node running in fork mode.
 */
const isForkMode = (hre) => hre.network.name.startsWith("fork");

// suppress "Duplicate definition of" Solidity function warning level message:
const suppressLoggerWarnings = (ethers) => {
  const { Logger } = ethers.utils;
  Logger.setLogLevel(Logger.levels.ERROR);
};

// in hardhat forking mode - impersonate an address
const impersonateForkedNetworkAccount = (hre, address) =>
  hre.network.provider.request({
    method: "hardhat_impersonateAccount",
    params: [address],
  });

/**
 * Get the deployer Signer
 * @param {HardhatRuntimeEnvironment} hre
 * @return {ethers.Signer} Signer
 */
const getDeployer = async (hre) => {
  if (isForkMode(hre)) {
    const deployerAddress = hre.config.namedAccounts.deployer[hre.network.name];
    await impersonateForkedNetworkAccount(hre, deployerAddress);
    return hre.ethers.provider.getSigner(deployerAddress);
  }
  // Default to signer[0] otherwise
  return hre.ethers.getSigners().then((signers) => signers[0]);
};

/**
 * Get the administrator Signer.
 * @param {HardhatRuntimeEnvironment} hre
 * @return {ethers.Signer} Signer
 */
const getAdministratorSigner = async (hre) => {
  // NOTE 1: the deployer and the administrator are the same until
  //         STARTRAIL-673 is done. after that we will fetch the
  //         admin signing key here.
  // NOTE 2: in mainnet forking mode we can't impersonate a signer
  //         for eth_sign of meta-tx's. thus we don't impersonate
  //         the mainnet owners here. instead the local hardhat
  //         network signer is added to the admin owners list and
  //         that signer key is used.
  if (isForkMode(hre)) {
    const adminAddress = hre.config.namedAccounts.administrator[
      hre.network.name
    ].toLowerCase();
    await impersonateForkedNetworkAccount(hre, adminAddress);
    return hre.ethers.provider.getSigner(adminAddress);
  }
  return hre.ethers.getSigners().then((signers) => signers[0]);
};

/**
 * Creates an instance of Administrator in a hardhat context.
 *
 * Set numConfirmations automatically for execTransaction calls if it's
 * not set by the caller.
 *
 * @param {HardhatRuntimeEnvironment} hre
 * @return {Administrator} Administrator instance
 */
const getAdministratorInstance = async (hre) => {
  const { multiSendAddress, startrailAdministratorAddress } = loadDeployJSON(
    hre
  );

  const signer = await getAdministratorSigner(hre);
  const admin = new Administrator(
    hre.ethers.provider,
    signer,
    startrailAdministratorAddress,
    multiSendAddress
  );

  (admin as any)._execTransaction = admin.execTransaction;
  admin.execTransaction = (opts) => {
    if (!opts.numConfirmations) {
      // Wait 3 blocks on mainnet, rinkeby, etc.
      // Wait 0 blocks on local test networks
      opts.numConfirmations = isLiveNetwork(hre) ? 1 : 0;
      return (admin as any)._execTransaction(opts);
    }
  };

  return admin;
};

/**
 * Helper that gets the name of the latest contract version for a given
 * contract.
 *
 * eg. 'StartrailRegistry' => 'StartrailRegistryV5'
 *
 * @param {string} contractName
 * @return {string} Name of latest with version
 */
const getContractNameLatest = (contractName) => {
  const vMatches = glob.sync(`contracts/**/${contractName}V*.sol`);
  const sorted = sortByNumber(vMatches)
  return sorted.length > 0
    ? sorted.pop().match(/.*\/(.*).sol/)[1]
    : contractName;
};

const sortByNumber = (filenames: string[]) => filenames.sort((a, b) => {
  const a1 = parseInt(a.replace(/[^0-9]/g, ''), 10);
  const b1 = parseInt(b.replace(/[^0-9]/g, ''), 10);
  // result of parseInt will be NaN if a doesn't have number.
  // since NaN is not always equal to NaN, this mechanism is used to avoid this.
  const a2 = (a1 !== a1) ? 0 : a1;
  const b2 = (b1 !== b1) ? 0 : b1;

  if (a2 > b2) {
      return 1;
  } else if (a2 < b2) {
      return -1;
  }
  return 0;
});
/**
 * Helper that wraps hre.ethers.getContractAt to get a contract handle.
 *
 * Works for Startrail contracts that are deployed with a proxy and have
 * a `<contractName>ProxyAddress` entry in deploy.json.
 *
 * @param hre Hardhat runtime
 * @param contractName Name of contract in deploy.json file
 * @return Contract instance
 */
const getContract = (
  hre: HardhatRuntimeEnvironment,
  contractName: string
): Promise<ethers.Contract> => {
  let deployJSONKey;

  switch (contractName) {
    case `StartrailProxyAdmin`:
      deployJSONKey = `proxyAdminAddress`;
      break;
    default:
      deployJSONKey = `${lowerFirst(contractName)}ProxyAddress`;
      break;
  }

  const deployJSON = loadDeployJSON(hre);
  const contractAddress = deployJSON[deployJSONKey];
  const contractNameKey = getContractNameLatest(contractName);

  suppressLoggerWarnings(ethers);

  return hre.ethers.getContractAt(contractNameKey, contractAddress);
};

/**
 * waitTx in a Hardhat context
 * @param {HardhatRuntimeEnvironment} hre
 * @param {ethers.TransactionResponse|ethers.Contract|string} txResultOrHash
 *     Object with transaction hash or transaction hash itself
 * @param {number} numConfirmations? (defaults to 0 for local and 1 for live)
 */
const waitTxHH = (hre, txResultOrHash, numConfirmations) => {
  if (!numConfirmations) {
    // Wait 1 blocks on polygon, mumbai (instant finality so wait just 1 block)
    // Wait 0 blocks on local test networks
    numConfirmations = isLiveNetwork(hre) ? 1 : 0;
  }
  return waitTx(hre.ethers.provider, txResultOrHash, numConfirmations);
};

const isContractDeployed = (hre, address) =>
  hre.ethers.provider.getCode(address).then((code) => code !== "0x");

const assertContractDeployed = async (hre, name, address) => {
  let deployed = false;
  try {
    deployed = await isContractDeployed(hre, address);
  } catch (error) {}

  if (deployed !== true) {
    throw Error(`${name} not deployed at address [${address}]`);
  }
};

const assertContractNotDeployed = async (hre, name, address) => {
  if ((await isContractDeployed(hre, address)) === true) {
    throw Error(`${name} already deployed at ${address}`);
  }
};

const hardhatReset = (hre) =>
  hre.network.provider.request({
    method: "hardhat_reset",
    params: [],
  });

/**
 * Parse logs into readable format.
 * Try parsing with multiple Startrail contract handles.
 * @param {HardhatRuntimeEnvironment} hre
 * @param {Record<string,string>} deployJSON contract addresses
 * @param {Log[]} logs
 */
const parseLogs = async (hre, deployJSON, logs) => {
  const parseLogsByContract = (contract) =>
    logs.reduce((parsedLogs, log) => {
      try {
        const parsedLog = contract.interface.parseLog(log);
        delete parsedLog.eventFragment; // too verbose when including this
        parsedLogs.push(parsedLog);
      } catch {}
      return parsedLogs;
    }, []);

  let resultLogs = [];

  suppressLoggerWarnings(ethers);

  // Parse any StartrailRegistry logs
  const sr = await getContract(hre, "StartrailRegistry");
  resultLogs.push(...parseLogsByContract(sr));

  // Parse LicensedUserManager logs
  const lum = await getContract(hre, "LicensedUserManager");
  resultLogs.push(...parseLogsByContract(lum));

  // Parse BulkIssue logs
  const bulk = await getContract(hre, "BulkIssue");
  resultLogs.push(...parseLogsByContract(bulk));

  // Parse MetaTxForwarder logs
  const mtf = await getContract(hre, "MetaTxForwarder");
  resultLogs.push(...parseLogsByContract(mtf));

  return resultLogs;
};

/**
 * Decode an event given the raw log, event name or signature and contract
 * handle.
 *
 * Wraps the common-js decodeEventLog converting event names to default full
 * signature forms when there are multiple definitions.
 *
 * @param {ethers.Contract} contract
 * @param {string} eventName
 * @param {@ethersproject/abstract-provider/Log} log
 * @returns Array of event arguments or undefined if not found
 */
const decodeEventLog = (contract, eventName, log) => {
  let eventNameOrSig;
  switch (eventName) {
    // TODO: restore this when move back to decentralized metadata:

    // case 'CreateSRR':
    //   eventNameOrSig = "CreateSRR(uint256,(bool,address,address),string)"
    //   break;
    default:
      eventNameOrSig = eventName;
  }
  return decodeEventLogCommonJs(contract, eventNameOrSig, log);
};

/**
 * Upgrade contract sending an upgrade transaction through the Administrator
 * contract.
 *
 * @param {HardhatRuntimeEnvironment} hre
 * @param {string} proxy address of proxy to call update on
 * @param {string} newImplementation address of the new implementation contract
 * @returns {Promise<TransactionReceipt | TransactionResponse>}
 */
const upgradeFromAdmin = async (hre, proxy, newImplementation) => {
  const startrailProxyAdmin = await getContract(hre, "StartrailProxyAdmin");
  const administratorContract = await getAdministratorInstance(hre);
  const {
    data: updateCalldata,
  } = await startrailProxyAdmin.populateTransaction.upgrade(
    proxy,
    newImplementation
  );
  // console.dir(newImplementation)
  const res = await administratorContract.execTransaction({
    to: startrailProxyAdmin.address,
    data: updateCalldata,
    waitConfirmed: true,
  });
  // console.dir(res, {depth: null})
  return res
};

export {
  assertContractDeployed,
  assertContractNotDeployed,
  decodeEventLog,
  getAdministratorSigner,
  getAdministratorInstance,
  getContract,
  getContractNameLatest,
  getDeployer,
  getNetworkConfig,
  getWallets,
  hardhatReset,
  impersonateForkedNetworkAccount,
  isContractDeployed,
  isLiveNetwork,
  isLocalNetwork,
  isForkMode,
  parseLogs,
  suppressLoggerWarnings,
  waitTxHH,
  upgradeFromAdmin,
};
