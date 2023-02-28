import '@nomiclabs/hardhat-waffle'
import '@nomiclabs/hardhat-solhint'
import 'hardhat-gas-reporter'
import 'hardhat-log-remover'
import 'solidity-coverage'
import '@primitivefi/hardhat-dodoc';
import 'hardhat-contract-sizer'

import dotenv from 'dotenv'
import { ethers } from 'ethers'
import fs from 'fs'
import { TASK_COMPILE } from 'hardhat/builtin-tasks/task-names'
import { task } from 'hardhat/config'
import { HardhatNetworkConfig } from 'hardhat/types'
import path from 'path'

import chainIds from './utils/chain-ids'
import { getContractNameLatest } from './utils/hardhat-helpers'

dotenv.config();

//
// Setup test accounts for local networks
//
const mnemonicLocal =
  "hungry spoil shiver course sunny bounce crop swamp host simple soup protect";
const derivePath = "m/44'/60'/0'/0/";
const privateKeysLocal: string[] = [];
for (let i = 0; i < 10; i++) {
  const wallet = ethers.Wallet.fromMnemonic(mnemonicLocal, `${derivePath}${i}`);
  // console.log(`wallet[${i}]: ${wallet.address}`);
  privateKeysLocal.push(wallet.privateKey);
}

const accountN = (n: number) => new ethers.Wallet(privateKeysLocal[n]).address;
const defaultAccount = accountN(0);

//
// Startrail administator configuration for local network
//
interface StartrailAdministratorConfig {
  owners: string[];
  threshold: number;
}

const startrailAdministratorLocal: StartrailAdministratorConfig = {
  threshold: 1,
  owners: [defaultAccount, accountN(1)],
};

//
// Known address in Live networks
//
const MUMBAI_DEPLOYER_ADDRESS = "0x17a4dC4aF1FAF9c3Db0515a170491c37eb0373Dc";
const MUMBAI_API_ADDRESS = "0x2B5de787FaC8c91608254158d6b7184feDC783Aa";

const MAINNET_DEPLOYER_ADDRESS = "0x4F59ae1E7b5708d5E153402351A3b72F5F493B50";
const MAINNET_API_ADDRESS = "0xb435B200C72277035a6fb58BD4bB8e3d39877d08";

const POLYGON_DEPLOYER_ADDRESS = MAINNET_DEPLOYER_ADDRESS;
const POLYGON_API_ADDRESS = MAINNET_API_ADDRESS;

const QA_ADMIN_OWNER_LIST = [
  MUMBAI_DEPLOYER_ADDRESS,
  MUMBAI_API_ADDRESS,
  "0xB055E035D57629396B87e02d749F35844A76196A", // Hatch
  "0x40a10451ab8CE99Cda681Dd9c1ABe84A52730cE1", // Wataru
  "0xD5826fa97B5117B4e51AE4B5c89064f653a4DCDa", // Toshi
  "0x469540b2C82D564eFD72C9857fc1DFfA74079103", // Eguchi
  "0x0AAcA6D879c398AbecBDe44CF00623b86Cfc1119", // Riko
  "0x13152B0b58FDcB44a5D7dF1295b6F7Ba12b667aB", // Mitsu Tor.Us
  "0xd60D7e4484645443d3BE47A3299be5AD07325179", // Mitsu
  "0xe8E9a20bdfeA3d05239B3A41CE83609Ef0E4f867", // Circle CI
  "0x71200f1ac85F3D83EB0aF1Dc4fbD0888f13C7DB8", // Aqdas
];

const oneGwei = 2000000000;
const defaultGasPrice = oneGwei;

let polygonGasPrice = Number(process.env.POLYGON_GAS_PRICE_GWEI) * oneGwei;
if (!Number.isSafeInteger(polygonGasPrice)) {
  polygonGasPrice = 30 * oneGwei;
}

//
// Install ABIs into abi/ for npm package publish
//

const abiExportList: string[] = [
  "Bulk",
  "BulkIssue",
  "BulkTransfer",
  "LicensedUserManager",
  "MetaTxForwarder",
  "NameRegistry",
  "StartrailProxy",
  "StartrailRegistry",
].map(getContractNameLatest);

// adapted from https://github.com/ItsNickBarry/hardhat-abi-exporter/blob/master/index.js
task(TASK_COMPILE, async function (args, hre, runSuper) {
  await runSuper();

  const outputDirectory = path.resolve(hre.config.paths.root, "abi");
  if (fs.existsSync(outputDirectory)) {
    fs.rmSync(outputDirectory, { recursive: true });
  }
  if (!fs.existsSync(outputDirectory)) {
    fs.mkdirSync(outputDirectory, { recursive: true });
  }

  for (let name of abiExportList) {
    const { abi } = await hre.artifacts.readArtifact(name);
    const destination = path.resolve(
      outputDirectory,
      `${name.replace(/V\d*$/, "")}.json`
    );
    fs.writeFileSync(destination, `${JSON.stringify(abi, null, 2)}\n`, {
      flag: "w",
    });
  }
});

task("accounts", "Prints the list of accounts", async () => {
  for (let i = 0; i < 5; i++) {
    const wallet = ethers.Wallet.fromMnemonic(
      mnemonicLocal,
      `${derivePath}${i}`
    );
    console.log(`Account[${i}]:\t\t${wallet.address}`);
    console.log(`Private Key[${i}]:\t\t${wallet.privateKey}\n`);
  }
});

const networksLocalShared: Partial<HardhatNetworkConfig> & {
  startrailAdministrator: StartrailAdministratorConfig;
} = {
  startrailAdministrator: startrailAdministratorLocal,
  gasPrice: defaultGasPrice,

  // evm logging with tests
  loggingEnabled: false,

  // Reason 1: workaround for "Error: tx has a higher gas limit than the block"
  // see: https://github.com/nomiclabs/hardhat/issues/851#issuecomment-703177165
  // Reason 2: Polygon blocks are 20M
  blockGasLimit: 20000000,

  // To replicate Mumbai/Polygon/live chain type behavior set these to false.
  // For unit tests and quick detection of errors locally set these to true.
  //
  // For example if these flags are set to true and Hardhat detects a
  // transaction would fail on chain if broadcast, it will not broadcast it and
  // instead throw a Javascript Error.
  //
  // Setting these to true can be handy when developing a new feature however
  // for testing the stratrail-api (eg. transaction tracker behavior) it needs
  // to be false so the transactions will fail on chain.
  throwOnTransactionFailures: true,
  throwOnCallFailures: true,
};

// Go to https://hardhat.dev/config/ to learn more
export default {
  defaultNetwork: "hardhat",
  hardfork: "berlin",

  networks: {
    hardhat: {
      ...networksLocalShared,
      accounts: privateKeysLocal.map((privateKey) => {
        return {
          privateKey,
          balance: "10000000000000000000000", // 10k ETH
        };
      }),
      chainId: chainIds.hardhat,
    },

    localhost: {
      ...networksLocalShared,
      accounts: privateKeysLocal,
      timeout: 120000,
      // We use a ganache chain id and alternative port to make the localhost
      // node compatibile with TorUs web when Startrail is run as a full local
      // stack.
      chainId: 5777,
      url: "http://127.0.0.1:8546",
    },

    "fork-polygon": {
      ...networksLocalShared,
      accounts: privateKeysLocal,
      timeout: 120000,
      url: "http://127.0.0.1:8545",
    },

    "mumbai-develop": {
      chainId: chainIds.mumbai,
      url: process.env.MUMBAI_PROVIDER_URL || "http://placeholder",
      accounts: [process.env.MUMBAI_PRIVATE_KEY || privateKeysLocal[0]],
      startrailAdministrator: {
        threshold: 1,
        owners: QA_ADMIN_OWNER_LIST,
      },
      gasPrice: defaultGasPrice,
    },

    "mumbai-release": {
      chainId: chainIds.mumbai,
      url: process.env.MUMBAI_PROVIDER_URL || "http://placeholder",
      accounts: [process.env.MUMBAI_PRIVATE_KEY || privateKeysLocal[0]],
      startrailAdministrator: {
        threshold: 1,
        owners: QA_ADMIN_OWNER_LIST,
      },
      gasPrice: defaultGasPrice,
    },
    "mumbai-staging": {
      chainId: 80001,
      url: process.env.MUMBAI_PROVIDER_URL || "http://placeholder",
      accounts: [process.env.MUMBAI_PRIVATE_KEY || privateKeysLocal[0]],
      startrailAdministrator: {
        threshold: 1,
        owners: QA_ADMIN_OWNER_LIST,
      },
      gasPrice: defaultGasPrice,
    },
    polygon: {
      chainId: chainIds.polygon,
      url: process.env.POLYGON_PROVIDER_URL || "http://placeholder",
      accounts: [process.env.POLYGON_PRIVATE_KEY || privateKeysLocal[0]],
      startrailAdministrator: {
        threshold: 1,
        owners: [POLYGON_DEPLOYER_ADDRESS, POLYGON_API_ADDRESS],
      },
      gasPrice: polygonGasPrice,
    },
  },

  namedAccounts: {
    deployer: {
      default: defaultAccount, // local | tests
      polygon: POLYGON_DEPLOYER_ADDRESS,
      "fork-polygon": POLYGON_DEPLOYER_ADDRESS,
      localhost: defaultAccount,
    },
    administrator: {
      // same as deployer until STARTRAIL-673 is done
      default: defaultAccount,
      polygon: POLYGON_DEPLOYER_ADDRESS,
      "fork-polygon": POLYGON_DEPLOYER_ADDRESS,
      localhost: defaultAccount,
    },
    api: {
      default: defaultAccount,
      polygon: POLYGON_API_ADDRESS,
      localhost: defaultAccount,
    },
  },

  solidity: {
    compilers: [
      {
        version: "0.6.11", // All Startrail contracts
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    ],
  },

  mocha: {
    timeout: 30000,
  },

  gasReporter: {
    enabled: process.env.REPORT_GAS ? true : false,
    currency: "JPY",
    gasPrice: 20,
    coinmarketcap: "06c3200d-7134-496c-aac6-e764179e5a69",
  },

  dodoc: {
    runOnCompile: false,
    outputDir: 'docs/natspec',
    exclude:[`contracts/test`]
  },
};
