const chainIds = require('../chain-ids');
const { getAdministratorSigner } = require("../hardhat-helpers");

// Fixed addresses, hashes and bytecode
// see https://eips.ethereum.org/EIPS/eip-2470
const DEPLOYMENT_ACCOUNT = "0xBb6e024b9cFFACB947A71991E386681B1Cd1477D";
const DEPLOYMENT_HASH =
  "0x803351deb6d745e91545a6a3e1c0ea3e9a6a02a1a4193b70edfcd2f40f71a01c";
const DEPLOYMENT_RAW_TX =
  `0xf9016c8085174876e8008303c4d88080b9015460806040523480156100105760008` +
  `0fd5b50610134806100206000396000f3fe6080604052348015600f57600080fd5b50` +
  `6004361060285760003560e01c80634af63f0214602d575b600080fd5b60cf6004803` +
  `6036040811015604157600080fd5b810190602081018135640100000000811115605b` +
  `57600080fd5b820183602082011115606c57600080fd5b80359060200191846001830` +
  `284011164010000000083111715608d57600080fd5b91908080601f01602080910402` +
  `602001604051908101604052809392919081815260200183838082843760009201919` +
  `0915250929550509135925060eb915050565b604080516001600160a01b0390921682` +
  `52519081900360200190f35b6000818351602085016000f5939250505056fea264697` +
  `06673582212206b44f8a82cb6b156bfcc3dc6aadd6df4eefd204bc928a4397fd15dac` +
  `f6d5320564736f6c634300060200331b83247000822470`;

const SINGLETON_FACTORY_ADDRESS = "0xce0042B868300000d44A59004Da54A005ffdcf9f";
const SINGLETON_FACTORY_ABI = [
  {
    constant: false,
    inputs: [
      {
        internalType: "bytes",
        name: "_initCode",
        type: "bytes",
      },
      {
        internalType: "bytes32",
        name: "_salt",
        type: "bytes32",
      },
    ],
    name: "deploy",
    outputs: [
      {
        internalType: "address payable",
        name: "createdContract",
        type: "address",
      },
    ],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
];

const singletonFactoryContractHandle = (hre) =>
  hre.ethers.getContractAt(SINGLETON_FACTORY_ABI, SINGLETON_FACTORY_ADDRESS);

/**
 * Deploy a singleton contract using the EIP2470 SingletonFactory.
 */
const deploySingleton = (hre, initCode, salt, gasLimit = 5000000) =>
  singletonFactoryContractHandle(hre).then((singletonFactory) =>
    singletonFactory.deploy(initCode, salt, { gasLimit })
  );

/**
 * Encode transaction for a deploy singleton contract using the EIP2470
 * SingletonFactory.
 */
const encodeDeploySingleton = (hre, initCode, salt) =>
  singletonFactoryContractHandle(hre)
    .then((singletonFactory) =>
      singletonFactory.populateTransaction.deploy(initCode, salt)
    )
    .then((tx) => tx.data);

/**
 * Deploys an EIP2470 SingletonFactory at
 * 0xce0042b868300000d44a59004da54a005ffdcf9f for local networks.
 *
 * On deployed networks like mainnet and rinkeby this contract already exists
 * so we make use of the already deployed contract.
 *
 * See the EIP2470 spec for details: https://eips.ethereum.org/EIPS/eip-2470
 */
const deployEIP2470SingletonFactory = async () => {
  const deployer = await getAdministratorSigner(hre);
  await deployer.sendTransaction({
    to: DEPLOYMENT_ACCOUNT,
    value: ethers.utils.parseEther("0.0247"),
  });
  const txRsp = await ethers.provider.sendTransaction(DEPLOYMENT_RAW_TX);
  if (txRsp.hash !== DEPLOYMENT_HASH) {
    throw Error(`EIP2470 hash not the expected [${DEPLOYMENT_HASH}]`);
  }
  return txRsp;
};

// EIP2470 contracts are already deployed on mainnet, rinkeby, görli and kovan, amoy
// https://www.oklink.com/amoy/tx/0x803351deb6d745e91545a6a3e1c0ea3e9a6a02a1a4193b70edfcd2f40f71a01c
const isEIP2470Deployed = async (hre) => {
  const { chainId } = await hre.ethers.provider.getNetwork();
  if ([1, 4, 5, 42, chainIds.amoy].indexOf(chainId) !== -1) {
    return true;
  }
  return hre.ethers.provider
    .getCode(SINGLETON_FACTORY_ADDRESS)
    .then((code) => code !== "0x");
};

module.exports = {
  deployEIP2470SingletonFactory,
  deploySingleton,
  encodeDeploySingleton,
  isEIP2470Deployed,
  SINGLETON_FACTORY_ADDRESS,
  SINGLETON_FACTORY_ABI,
};
