import hre from 'hardhat'
import { HardhatRuntimeEnvironment } from 'hardhat/types'

import { getWallets, isLocalNetwork } from '../hardhat-helpers'
import { deployContract } from './deploy-contract'

/**
 * Deploy the StartrailRegistryOpenSeaTester contract for checking only the
 * OpenSea integation.
 */
const deploySRForOpenSeaTest = async (hre: HardhatRuntimeEnvironment) => {
  console.log(`\nDeploying library ...\n`);
  const openSeaMetaTxLibrary = await deployContract(
    hre,
    "OpenSeaMetaTransactionLibrary"
  );
  console.log(`library deployed: ${openSeaMetaTxLibrary.address}`);

  console.log(`\nDeploying contract...\n`);
  const srosContract = await deployContract(
    hre,
    `StartrailRegistryOpenSeaTester`,
    [
      // constructor args
      "SROS Test",
      "SROS",
      "ipfs://",
    ],
    {
      OpenSeaMetaTransactionLibrary: openSeaMetaTxLibrary.address,
    }
  );
  console.log(`contract deployed: ${srosContract.address}\n`);

  let openSeaProxyAddress;
  if (isLocalNetwork(hre)) {
    // default to a hardhat signing wallet address
    openSeaProxyAddress = getWallets(hre)[4].address;
  } else if (hre.network.name === "polygon") {
    openSeaProxyAddress = `0x58807baD0B376efc12F5AD86aAc70E78ed67deaE`;
  } else {
    // not supported - at the time of writing this includes mumbai which was broken
    console.warn(
      `OpenSea not supported on this network, skipping ProxyRegistry setup ...`
    );
  }

  if (openSeaProxyAddress) {
    const txArgs = [openSeaProxyAddress, "SROSTester"];
    console.log(`sending tx setOpenSeaMetaTxIntegration(${txArgs}) ...`);
    await srosContract.setOpenSeaMetaTxIntegration(...txArgs);
  }
};

deploySRForOpenSeaTest(hre);

// Work with this contract in the console:
//
// term1> npm run node
// term2> npm run console

// hh> hre.ethers.getContractAt(`StartrailRegistryOpenSeaTester`, `0x0F0DABB3C57c59B1bb940425361f0F508432e555`).then(c=>sr=c)

// hh> sr.srosContract.setContractUri(`ipfs://bafkreiefc64xcx5utorl537bealmdyubvtxq5uxyxufd3jbae2kjkpa5sm`);

// hh> sr.createSRR(false, `0xc852eec393BFfa4015b48Ce99712767eCDE4216E`, `abcdefs`, false)
