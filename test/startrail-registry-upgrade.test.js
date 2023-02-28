const hre = require("hardhat");

const { expect, use } = require("chai");
const chaiAsPromised = require("chai-as-promised");

const { ContractKeys } = require("../startrail-common-js/contracts/types");
const {
  randomAddress,
} = require("../startrail-common-js/test-helpers/test-utils");

const { fixtureDefault } = require("./helpers/fixtures");
const { randomSha256, sendWithEIP2771 } = require("./helpers/utils");
const { nameRegistrySet } = require("../utils/name-registry-set");
const { loadDeployJSON } = require("../utils/deployment/deploy-json");

const {
  decodeEventLog,
  getAdministratorInstance,
  getWallets,
  upgradeFromAdmin,
} = require("../utils/hardhat-helpers");

use(chaiAsPromised);

// Signing wallets
const wallets = getWallets(hre);
const administratorWallet = wallets[0];
const trustedForwarderWallet = wallets[9];


// Shared test data
const isPrimaryIssuer = true;
const artistAddress = randomAddress();
const luwAddress = randomAddress();
let metadataDigest = "";

// Contract handles
let startrailRegistry;
let newStartrailRegistry;
let startrailProxyAdmin;

const randomText = () =>
  Math.random()
    .toString(36)
    .replace(/[^a-z]+/g, "")
    .substr(0, 5);

/**
 * Send an EIP2771 call to StartrailRegistry using the trustedForwarderWallet which
 * is an EOA wallet masquerading as the MetaTxForwarder for unit testing
 * @param {string} fnName StartrailRegistry function name or function signature
 * @param {any[]} arguments Array of arguments to the function fnName
 * @return {Promise<TransactionReceipt} Resolved tx receipt
 */
const sendFromTrustedForwarder = (fnName, arguments) =>
  sendWithEIP2771(
    startrailRegistry,
    fnName,
    arguments,
    luwAddress,
    trustedForwarderWallet
  ).then((txRsp) => txRsp.wait(0));

const createSRRFromLicensedUser = async () => {
  const txReceipt = await sendFromTrustedForwarder(
    "createSRRFromLicensedUser(bool,address,bytes32,bool)",
    [isPrimaryIssuer, artistAddress, metadataDigest, false]
  );

  const eventArgs = decodeEventLog(
    startrailRegistry,
    "CreateSRR(uint256,(bool,address,address),bytes32,bool)",
    txReceipt.logs[1]
  );

  const tokenId = eventArgs[0].toNumber();
  expect(Number.isInteger(tokenId)).to.be.true;
  expect(tokenId > 0).to.be.true;

  const srr = eventArgs[1];
  expect(srr[0]).to.equal(isPrimaryIssuer);
  expect(srr[1]).to.equal(artistAddress);
  expect(srr[2]).to.equal(luwAddress);

  expect(eventArgs[2]).to.equal(metadataDigest);

  return tokenId;
};


/**
 * Run the fixtureDefault then swap out the the Administrator
 * and MetaTxForwarder contracts with EOA wallets.
 *
 * This makes unit tests simpler and allows for direct calls to the
 * StartrailRegistry.
 */
const fixtureDefaultWithEOAForwarderAndAdmin = async () => {
  ({ startrailProxyAdmin, startrailRegistry, nameRegistry } = await hre.waffle.loadFixture(
    fixtureDefault
  ));
  await nameRegistrySet(
    hre,
    ContractKeys.Administrator,
    administratorWallet.address
  );
  administratorContract = await getAdministratorInstance(hre);
  return startrailRegistry.setTrustedForwarder(trustedForwarderWallet.address);
};

describe("StartrailRegistry", () => {
  before(() => fixtureDefaultWithEOAForwarderAndAdmin());

  beforeEach(async () => {
    // Setup Test Data
    metadataDigest = randomSha256();
    historyMetadataDigest = randomSha256();
    customHistoryname = randomText();
    customHistoryTypeName = randomText();
    target = randomText() + "@gmail.com";
  });

  describe("upgrade proxy", () => {
    it("createSRR -> upgrade proxy -> getSRR", async () => {
      const tokenId = await createSRRFromLicensedUser();
      const srrData = await startrailRegistry.getSRR(tokenId);
      expect(srrData[0][0]).to.equal(isPrimaryIssuer);

      const {
        idGeneratorLibraryAddress,
      } = loadDeployJSON(hre);

      newStartrailRegistry = await hre.ethers
        .getContractFactory("StartrailRegistryV1", {
          libraries: { IDGenerator: idGeneratorLibraryAddress }
        })
        .then((factory) => factory.deploy([]))
        .then((contract) => contract.deployed());

      await upgradeFromAdmin(hre, startrailRegistry.address, newStartrailRegistry.address);

      expect(
        await startrailProxyAdmin.getProxyImplementation(startrailRegistry.address)
      ).to.equal(newStartrailRegistry.address);

      const srrDataAfterUpgraded = await startrailRegistry.getSRR(tokenId);
      expect(srrDataAfterUpgraded[0][1]).to.equal(srrData[0][1]);

    });
  });
});
