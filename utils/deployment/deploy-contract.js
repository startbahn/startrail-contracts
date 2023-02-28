const deployContract = (hre, name, constructorArgs = [], libraries = {}) =>
  hre.ethers
    .getContractFactory(name, { libraries })
    .then((factory) => factory.deploy(...constructorArgs))
    .then((contract) => contract.deployed());

module.exports = { deployContract };
