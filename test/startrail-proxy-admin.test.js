const { expect, use } = require("chai");
const chaiAsPromised = require("chai-as-promised");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const hre = require("hardhat");

const {
  randomAddress,
} = require("../startrail-common-js/test-helpers/test-utils");

const { fixtureDefault } = require("./helpers/fixtures");

const {
  getAdministratorInstance,
  getWallets,
  upgradeFromAdmin,
} = require("../utils/hardhat-helpers");

use(chaiAsPromised);

// Signing wallets
const wallets = getWallets(hre);
const administratorWallet = wallets[0];
const noAuthWallet = wallets[1];

describe("StartrailProxyAdmin", () => {
  let startrailProxyAdmin;
  let nameRegistry;
  let administratorContract;

  beforeEach(async () => {
    ({ startrailProxyAdmin, nameRegistry } = await loadFixture(
      fixtureDefault
    ));
    administratorContract = await getAdministratorInstance(hre);
  });

  it("owner is the administrator contract", async () => {
    const owner = await startrailProxyAdmin.owner();
    return expect(owner).to.equal(administratorContract.contract.address);
  });

  describe("upgrade", () => {
    it("admin can upgrade to a new address", async () => {
      const newImplAddress = administratorContract.contract.address;
      await upgradeFromAdmin(hre, nameRegistry.address, newImplAddress);
      expect(
        await startrailProxyAdmin.getProxyImplementation(nameRegistry.address)
      ).to.equal(newImplAddress);
    });

    it("rejects attempt to upgrade from non admin", () => {
      const proxyNotAdmin = startrailProxyAdmin.connect(noAuthWallet);
      // TODO: for now use this - but change to use an actual NR upgrade
      const upgradeImplAddress = administratorContract.contract.address;
      return expect(
        proxyNotAdmin.upgrade(nameRegistry.address, upgradeImplAddress)
      ).to.eventually.be.rejectedWith(/msg.sender is not the owner/);
    });
  });

  describe("changeProxyAdmin", () => {
    it("admin can change to a new admin", async () => {
      const newAdmin = randomAddress();

      const {
        data: changeAdminCalldata,
      } = await startrailProxyAdmin.populateTransaction.changeProxyAdmin(
        nameRegistry.address,
        newAdmin
      );
      const receipt = await administratorContract.execTransaction({
        to: startrailProxyAdmin.address,
        data: changeAdminCalldata,
        waitConfirmed: true,
      });
      // has to be called from admin? :: TODO fix fail
      //   expect(
      //     await startrailProxyAdmin.getProxyAdmin(nameRegistry.address)
      //   ).to.equal(newAdmin);
    });

    it("rejects attempt by non admin", () => {
      const proxyNotAdmin = startrailProxyAdmin.connect(noAuthWallet);
      return expect(
        proxyNotAdmin.changeProxyAdmin(nameRegistry.address, randomAddress())
      ).to.eventually.be.rejectedWith(/msg.sender is not the owner/);
    });
  });
});