import 'hardhat-diamond-abi' // important: place before the @typechain/hardhat import
import '@typechain/hardhat'
import '@nomiclabs/hardhat-ethers'
import '@nomiclabs/hardhat-solhint'
import '@nomicfoundation/hardhat-chai-matchers'
import '@nomicfoundation/hardhat-network-helpers'
import 'hardhat-contract-sizer'
import 'hardhat-dependency-compiler'
import 'hardhat-gas-reporter'
import 'hardhat-log-remover'
import 'hardhat-storage-layout'
import '@primitivefi/hardhat-dodoc'
import '@openzeppelin/hardhat-upgrades'
import '@nomiclabs/hardhat-etherscan'

// STARTRAIL-1414 fix coverage:
// import 'solidity-coverage'
import dotenv from 'dotenv'
import { ethers } from 'ethers'
import fs from 'fs'
import { TASK_COMPILE } from 'hardhat/builtin-tasks/task-names'
import { task } from 'hardhat/config'
import { HardhatNetworkConfig } from 'hardhat/types'
import { isEqual, uniqWith } from 'lodash'
import path from 'path'

import chainIds from './utils/chain-ids'
import {
  getCollectionFeatureContractPaths,
  getContractNameLatest,
} from './utils/hardhat-helpers'

dotenv.config()

//
// Factory salts for LUM across each environment
//
const FACTORY_SALT_LUM_IMPLEMENTATION =
  '0x415a817a056348b03262d7e3a6adf1b95beda769af089aec36bd95b670057b5e'
const FACTORY_SALT_LUM_PROXY =
  '0x7da1e2b16f45bc6cdebc856d5b774109788975ad8089cd4b5ecb8762cab30419'

const AMOY_QA_FACTORY_SALT_LUM_IMPLEMENTATION =
  '0x73b9711dae1e0d9228046845bac30c4ca5463f2e6b707fbfd216ab28caba48f8'
const AMOY_QA_FACTORY_SALT_LUM_PROXY =
  '0xedd78991abde9cbb0d2e027f519d07a70ca2ccae7576605a8f89559baf894dcb'

const AMOY_STAGING_FACTORY_SALT_LUM_IMPLEMENTATION =
  '0xb45c00a346a3b4a0c102ca43a5bc4aa69f37dd3cad8f252b3b3cd1f110e6cee4'
const AMOY_STAGING_FACTORY_SALT_LUM_PROXY =
  '0xe3996dd5bb658a16ad67f0d3a9bd8d8cf4d2915da1bf72eb1826be57c8d4414f'

const AMOY_DEVELOP_FACTORY_SALT_LUM_IMPLEMENTATION =
  FACTORY_SALT_LUM_IMPLEMENTATION
const AMOY_DEVELOP_FACTORY_SALT_LUM_PROXY = FACTORY_SALT_LUM_PROXY

const POLYGON_FACTORY_SALT_LUM_IMPLEMENTATION = FACTORY_SALT_LUM_IMPLEMENTATION
const POLYGON_FACTORY_SALT_LUM_PROXY = FACTORY_SALT_LUM_PROXY

//
// Setup test accounts for local networks
//
const mnemonicLocal =
  'hungry spoil shiver course sunny bounce crop swamp host simple soup protect'
const derivePath = "m/44'/60'/0'/0/"
const privateKeysLocal: string[] = []
for (let i = 0; i < 10; i++) {
  const wallet = ethers.Wallet.fromMnemonic(mnemonicLocal, `${derivePath}${i}`)
  privateKeysLocal.push(wallet.privateKey)
}

const accountN = (n: number) => new ethers.Wallet(privateKeysLocal[n]).address
const defaultAccount = accountN(0)

//
// Startrail administator configuration for local network
//
export interface StartrailAdministratorConfig {
  owners: string[]
  threshold: number
}

export interface StartrailLUMConfig {
  salt: {
    implementation: string
    proxy: string
  }
}

const startrailAdministratorLocal: StartrailAdministratorConfig = {
  threshold: 1,
  owners: [defaultAccount, accountN(1)],
}

//
// Known address in Live networks
//
const AMOY_DEPLOYER_ADDRESS = '0x2A02C20195CA2A9bCc8E043cf7acE2EEa8Ab71Db'
const AMOY_DEVELOP_API_ADDRESS = '0x2B5de787FaC8c91608254158d6b7184feDC783Aa'
const AMOY_QA_API_ADDRESS = '0x07E3461Fc2f0541FF2Aa49B983e9d2cCaCB6D007'
const AMOY_STAGING_API_ADDRESS = '0x1f0032e1C4f90c916580747f5f64584D58c2f5ED'

const MAINNET_DEPLOYER_ADDRESS = '0x4F59ae1E7b5708d5E153402351A3b72F5F493B50'
const MAINNET_API_ADDRESS = '0xb435B200C72277035a6fb58BD4bB8e3d39877d08'

const POLYGON_DEPLOYER_ADDRESS = MAINNET_DEPLOYER_ADDRESS
const POLYGON_API_ADDRESS = MAINNET_API_ADDRESS


const AMOY_COMMON_ADMIN_OWNER_LIST = [
  AMOY_DEPLOYER_ADDRESS,
]

//
// Install ABIs into abi/ for npm package publish
//

const abiExportList: string[] = [
  'Bulk',
  'BulkIssue',
  'BulkTransfer',
  'CollectionFactory',
  'LicensedUserManager',
  'MetaTxForwarder',
  'NameRegistry',
  'StartrailProxy',
  'StartrailRegistry',
].map(getContractNameLatest)

// used in our hardhat-diamond-abi config below to filter out duplicates from
// between the interface and implementation contracts
const featureContractNameList = getCollectionFeatureContractPaths()

// adapted from https://github.com/ItsNickBarry/hardhat-abi-exporter/blob/master/index.js
task(TASK_COMPILE, async function (args, hre, runSuper) {
  await runSuper()

  const outputDirectory = path.resolve(hre.config.paths.root, 'abi')
  if (fs.existsSync(outputDirectory)) {
    fs.rmSync(outputDirectory, { recursive: true })
  }
  if (!fs.existsSync(outputDirectory)) {
    fs.mkdirSync(outputDirectory, { recursive: true })
  }

  const writeABIFile = (name, abi) => {
    const destination = path.resolve(
      outputDirectory,
      `${name.replace(/V\d*$/, '')}.json`
    )
    fs.writeFileSync(destination, `${JSON.stringify(abi, null, 2)}\n`, {
      flag: 'w',
    })
  }

  // For all contracts in abiExportList, extract the ABI and write it out to file
  for (let name of abiExportList) {
    const { abi } = await hre.artifacts.readArtifact(name)
    writeABIFile(name, abi)
  }

  // Copy over CollectionProxyFeaturesAggregate (was generated by hardhat-abi-diamond)
  const combinedName = `CollectionProxyFeaturesAggregate`
  const { abi } = await hre.artifacts.readArtifact(combinedName)
  const abiNoDupes = uniqWith(abi, isEqual)
  writeABIFile(combinedName, abiNoDupes)
})

task('accounts', 'Prints the list of accounts', async () => {
  for (let i = 0; i < 5; i++) {
    const wallet = ethers.Wallet.fromMnemonic(
      mnemonicLocal,
      `${derivePath}${i}`
    )
    console.log(`Account[${i}]:\t\t${wallet.address}`)
    console.log(`Private Key[${i}]:\t\t${wallet.privateKey}\n`)
  }
})

const networksLocalShared: Partial<HardhatNetworkConfig> & {
  startrailAdministrator: StartrailAdministratorConfig
  licensedUserManager: StartrailLUMConfig
} = {
  startrailAdministrator: startrailAdministratorLocal,
  licensedUserManager: {
    salt: {
      implementation: FACTORY_SALT_LUM_IMPLEMENTATION,
      proxy: FACTORY_SALT_LUM_PROXY,
    },
  },
  gasPrice: ethers.utils.parseUnits(`1`, `gwei`).toNumber(),

  // evm logging with tests
  loggingEnabled: false,

  // Reason 1: workaround for "Error: tx has a higher gas limit than the block"
  // see: https://github.com/nomiclabs/hardhat/issues/851#issuecomment-703177165
  // Reason 2: Polygon blocks are around 30M, but sometimes nodes produce blocks under 30M.
  blockGasLimit: 29_000_000,

  // To replicate Amoy/Polygon/live chain type behavior set these to false.
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
}

const getAmoyNetworkConfig = (
  apiAddress: string,
  lumConfig: StartrailLUMConfig
) => {
  return {
    chainId: chainIds.amoy,
    url: process.env.AMOY_PROVIDER_URL || 'http://placeholder',
    accounts: [process.env.AMOY_PRIVATE_KEY || privateKeysLocal[0]],
    startrailAdministrator: {
      threshold: 1,
      owners: [apiAddress, ...AMOY_COMMON_ADMIN_OWNER_LIST],
    },
    licensedUserManager: lumConfig,
  }
}

// Go to https://hardhat.dev/config/ to learn more
export default {
  defaultNetwork: 'hardhat',
  hardfork: 'berlin',

  networks: {
    hardhat: {
      ...networksLocalShared,
      accounts: privateKeysLocal.map((privateKey) => {
        return {
          privateKey,
          balance: '10000000000000000000000', // 10k ETH
        }
      }),
      chainId: chainIds.hardhat,
    },

    localhost: {
      ...networksLocalShared,
      accounts: privateKeysLocal,
      timeout: 120_000,
      // We use a ganache chain id and alternative port to make the localhost
      // node compatibile with TorUs web when Startrail is run as a full local
      // stack.
      chainId: 5777,
      url: 'http://127.0.0.1:8546',
    },

    'fork-polygon': {
      ...networksLocalShared,
      accounts: privateKeysLocal,
      timeout: 120000,
      url: 'http://127.0.0.1:8545',
    },
    'amoy-develop': getAmoyNetworkConfig(AMOY_DEVELOP_API_ADDRESS, {
      salt: {
        implementation: AMOY_DEVELOP_FACTORY_SALT_LUM_IMPLEMENTATION,
        proxy: AMOY_DEVELOP_FACTORY_SALT_LUM_PROXY,
      },
    }),
    'amoy-release': getAmoyNetworkConfig(AMOY_QA_API_ADDRESS, {
      salt: {
        implementation: AMOY_QA_FACTORY_SALT_LUM_IMPLEMENTATION,
        proxy: AMOY_QA_FACTORY_SALT_LUM_PROXY,
      },
    }),
    'amoy-staging': getAmoyNetworkConfig(AMOY_STAGING_API_ADDRESS, {
      salt: {
        implementation: AMOY_STAGING_FACTORY_SALT_LUM_IMPLEMENTATION,
        proxy: AMOY_STAGING_FACTORY_SALT_LUM_PROXY,
      },
    }),
    polygon: {
      chainId: chainIds.polygon,
      url: process.env.POLYGON_PROVIDER_URL || 'http://placeholder',
      accounts: [process.env.POLYGON_PRIVATE_KEY || privateKeysLocal[0]],
      startrailAdministrator: {
        threshold: 1,
        owners: [POLYGON_DEPLOYER_ADDRESS, POLYGON_API_ADDRESS],
      },
      licensedUserManager: {
        salt: {
          implementation: POLYGON_FACTORY_SALT_LUM_IMPLEMENTATION,
          proxy: POLYGON_FACTORY_SALT_LUM_PROXY,
        },
      },
      // workaround for "Error: cannot estimate gas; transaction may fail or may require manual gas limit"
      allowUnlimitedContractSize: true,
      // workaround for "Error: transaction underpriced"
      gasPrice: ethers.utils
        .parseUnits(process.env.POLYGON_GAS_PRICE_GWEI, `gwei`)
        .toNumber(),
    },
  },

  namedAccounts: {
    deployer: {
      default: defaultAccount, // local | tests
      polygon: POLYGON_DEPLOYER_ADDRESS,
      'fork-polygon': POLYGON_DEPLOYER_ADDRESS,
      localhost: defaultAccount,
    },
    administrator: {
      // same as deployer until STARTRAIL-673 is done
      default: defaultAccount,
      polygon: POLYGON_DEPLOYER_ADDRESS,
      'fork-polygon': POLYGON_DEPLOYER_ADDRESS,
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
        version: '0.8.28', // Current Startrail contracts
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
          outputSelection: {
            '*': {
              '*': ['storageLayout'],
            },
          },
        },
      },
    ],
  },

  mocha: {
    timeout: 30_000,
  },

  gasReporter: {
    enabled: process.env.REPORT_GAS ? true : false,
    currency: 'JPY',
    gasPrice: 20,
    coinmarketcap: '06c3200d-7134-496c-aac6-e764179e5a69',
  },

  dodoc: {
    runOnCompile: false,
    outputDir: 'docs/natspec',
    include: [`contracts`],
    exclude: [`contracts/test`],
  },

  // all config options documented here: https://www.npmjs.com/package/hardhat-diamond-abi
  diamondAbi: {
    name: 'CollectionProxyFeaturesAggregate',
    include: featureContractNameList,
    // exclude the corresponding interface contracts to avoid duplicates
    exclude: featureContractNameList.map((name) => `I${name}`),
    // ignore duplicates - although most are avoided by the `exclude` above
    strict: false,
    filter: (abiElement, index, abi, fullyQualifiedName) =>
      // supportsInterface() appears in interfaces for ERC721 and ERC2981 which
      // results in a duplicate in the generated CollectionProxyFeaturesAggregate
      // ABI types. So in this filter we make sure only one (ERC721) is included.
      //
      // Side note: the implementation of supportsInterface() resides in
      // FeatureRegistryBase and calls to CollectionProxy's will make call()'s
      // to that one.
      abiElement.name !== 'supportsInterface' ||
      fullyQualifiedName.includes(`collection/features/ERC721Feature`),
  },

  dependencyCompiler: {
    paths: [
      '@openzeppelin/contracts/proxy/beacon/UpgradeableBeacon.sol',
    ],
  },

  etherscan: {
    apiKey: process.env.POLYGONSCAN_ACCOUNT,
  },
}
