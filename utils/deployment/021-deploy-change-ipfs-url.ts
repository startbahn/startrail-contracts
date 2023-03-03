import { deployStartrailRegistry } from './deploy-startrail-registry'

const deployFixIPFSUrl = async (hre) => {
  console.log('\n=====   deployFixIPFSUrl invoked    ======\n')

  await deployStartrailRegistry(
    hre,
    `StartrailRegistryV20`,
    `IDGeneratorV3`,
    `OpenSeaMetaTransactionLibrary`,
    `StartrailRegistryLibraryV1`
  )
}

export { deployFixIPFSUrl }
