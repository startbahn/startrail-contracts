import fs from 'fs'
import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { lowerFirst } from 'lodash'
import path from 'path'

const DEPLOY_FILE_NAME = 'deploy.json'
const CONTRACT_INIT_CODE_HASH_FILE_NAME = 'initCodeHash.json'

const jsonPath = (hre: HardhatRuntimeEnvironment, fileName: string) =>
  path.join(process.cwd(), `deployments`, hre.network.name, `${fileName}`)

const loadJSON = (hre: HardhatRuntimeEnvironment, fileName: string) => {
  const filePath = jsonPath(hre, fileName)
  if (fs.existsSync(filePath)) {
    return JSON.parse(fs.readFileSync(filePath).toString())
  }
  return {}
}

const loadDeployJSON = (hre: HardhatRuntimeEnvironment) =>
  loadJSON(hre, DEPLOY_FILE_NAME)

const loadContractsInitCodeHashJSON = (hre: HardhatRuntimeEnvironment) =>
  loadJSON(hre, CONTRACT_INIT_CODE_HASH_FILE_NAME)

const saveJSON = (
  hre: HardhatRuntimeEnvironment,
  deployJSON: object,
  fileName: string,
  logJSON = false
) => {
  const filePath = jsonPath(hre, fileName)
  const fileDir = path.dirname(filePath)
  if (!fs.existsSync(fileDir)) {
    fs.mkdirSync(fileDir, { recursive: true })
  }

  const deployJSONStr = JSON.stringify(deployJSON, null, 2)
  fs.writeFileSync(filePath, deployJSONStr)
  if (logJSON) {
    console.log(`\n${fileName} saved:\n${deployJSONStr}`)
  }

  return deployJSON
}

const saveDeployJSON = (
  hre: HardhatRuntimeEnvironment,
  deployJSON: object,
  logJSON = false
) => saveJSON(hre, deployJSON, DEPLOY_FILE_NAME, logJSON)

const saveContractsInitCodeHashJSON = (
  hre: HardhatRuntimeEnvironment,
  deployJSON: object,
  logJSON = false
) => saveJSON(hre, deployJSON, CONTRACT_INIT_CODE_HASH_FILE_NAME, logJSON)

const updateDeployJSON = (
  hre: HardhatRuntimeEnvironment,
  contractAddresses: Record<string, string>
) => {
  const deployJSON = loadJSON(hre, DEPLOY_FILE_NAME)
  return saveJSON(
    hre,
    {
      ...deployJSON,
      ...contractAddresses,
    },
    DEPLOY_FILE_NAME
  )
}

const getProxyAddressByContractName = (
  hre: HardhatRuntimeEnvironment,
  contractName: string
) => {
  const deployJSON = loadJSON(hre, DEPLOY_FILE_NAME)
  return deployJSON[`${lowerFirst(contractName)}ProxyAddress`]
}

const updateContractsInitCodeHashJSON = (
  hre: HardhatRuntimeEnvironment,
  initCodeHashes: {
    collectionProxy: string
  }
) => {
  const deployJSON = loadJSON(hre, CONTRACT_INIT_CODE_HASH_FILE_NAME)
  return saveJSON(
    hre,
    {
      ...deployJSON,
      ...initCodeHashes,
    },
    CONTRACT_INIT_CODE_HASH_FILE_NAME
  )
}

export {
  loadDeployJSON,
  saveDeployJSON,
  updateDeployJSON,
  getProxyAddressByContractName,
  loadContractsInitCodeHashJSON,
  saveContractsInitCodeHashJSON,
  updateContractsInitCodeHashJSON,
}
