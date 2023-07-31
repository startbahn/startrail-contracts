import { HardhatRuntimeEnvironment } from 'hardhat/types'
import _ from 'lodash'
import { deployStartrailRegistry } from './deploy-startrail-registry'


const deployFixTransferFromWithProvenance = async (
  hre: HardhatRuntimeEnvironment
) => {
  console.log(
    '\n=====   deployFixTransferFromWithProvenance invoked    ======\n'
  )

  await deployStartrailRegistry(
    hre,
    `StartrailRegistryV23`,
    `IDGeneratorV3`,
    `OpenSeaMetaTransactionLibrary`,
    `StartrailRegistryLibraryV1`
  )
}

export { deployFixTransferFromWithProvenance }
