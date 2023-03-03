import { deployStartrailRegistry } from './deploy-startrail-registry'

const deployRoyaltyReceiverMultiUpdate = async (hre) => {
  console.log('\n=====   deployRoyaltyReceiverMultiUpdate invoked    ======\n')

  await deployStartrailRegistry(
    hre,
    `StartrailRegistryV21`,
    `IDGeneratorV3`,
    `OpenSeaMetaTransactionLibrary`,
    `StartrailRegistryLibraryV1`
  )
}

export { deployRoyaltyReceiverMultiUpdate }
