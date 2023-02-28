import {
  getAdministratorInstance,
  getContract,
  isLocalNetwork,
} from '../hardhat-helpers'
import { deployContract } from './deploy-contract'
import { updateDeployJSON } from './deploy-json'
import { deployStartrailRegistry } from './deploy-startrail-registry'

const deployMetaTxPolygonOpenSea = async (hre) => {
  console.log("\n=====    deployMetaTxPolygonOpenSea invoked    ======\n");

  const openSeaMetaTxLibrary = await deployContract(
    hre,
    "OpenSeaMetaTransactionLibrary"
  );
  updateDeployJSON(hre, {
    openSeaMetaTransactionLibraryAddress: openSeaMetaTxLibrary.address,
  });
  console.log(
    `OpenSeaMetaTransactionLibrary library deployed: ${openSeaMetaTxLibrary.address}`
  );

  await deployStartrailRegistry(
    hre,
    `StartrailRegistryV9`,
    `IDGeneratorV2`,
    `OpenSeaMetaTransactionLibrary`
  );

  let openSeaProxyAddress;
  if (isLocalNetwork(hre)) {
    // default to a hardhat signing wallet address
    const signers = await hre.ethers.getSigners();
    openSeaProxyAddress = signers[4].address;
  } else if (hre.network.name === "polygon") {
    openSeaProxyAddress = `0x58807baD0B376efc12F5AD86aAc70E78ed67deaE`;
  } else {
    // not supported - at the time of writing this includes mumbai which was broken
    console.warn(
      `OpenSea not supported on this network, skipping ProxyRegistry setup ...`
    );
  }

  if (openSeaProxyAddress) {
    const srContract = await getContract(hre, "StartrailRegistry");
    const adminContract = await getAdministratorInstance(hre);

    const {
      data: setupEncoded,
    } = await srContract.populateTransaction.setOpenSeaMetaTxIntegration(
      openSeaProxyAddress,
      "Startrail"
    );

    console.log(`\nSending StartrailRegistry.setOpenSeaMetaTxIntegration`);
    await adminContract.execTransaction({
      to: srContract.address,
      data: setupEncoded,
      waitConfirmed: true,
    });
  }
};

export { deployMetaTxPolygonOpenSea };
