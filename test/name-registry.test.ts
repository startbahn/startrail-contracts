import { expect, use } from 'chai'
import chaiAsPromised from 'chai-as-promised'
import { solidity } from 'ethereum-waffle'
import hre, { ethers } from 'hardhat'
import { ContractKeys } from '../startrail-common-js/contracts/types'
import { randomAddress } from '../startrail-common-js/test-helpers/test-utils'

import { getWallets } from '../utils/hardhat-helpers'

use(chaiAsPromised);
use(solidity);

// Signing wallets
const wallets = getWallets(hre);
const administratorWallet = wallets[0];
const noAuthWallet = wallets[1];

describe("NameRegistry", () => {
  let nr;

  beforeEach(async () => {
    const NameRegistry = await ethers.getContractFactory("NameRegistry");
    nr = await NameRegistry.deploy().then((c) => c.deployed());
    return nr.initialize(administratorWallet.address);
  });

  describe("initializer", () => {
    it("can't be called twice", () =>
      expect(
        nr.initialize(administratorWallet.address)
      ).to.eventually.be.rejectedWith(
        `Contract instance has already been initialized`
      ));
  });

  describe("administrator", () => {
    it("administrator() returns admin address", () =>
      expect(nr.administrator()).to.eventually.equal(
        administratorWallet.address
      ));

    it("get(ContractKeys.Administrator) returns admin address", () =>
      expect(nr.get(ContractKeys.Administrator)).to.eventually.equal(
        administratorWallet.address
      ));

    it("can be changed to a new administrator", async () => {
      const newAdminAddress = randomAddress();
      await nr.set(ContractKeys.Administrator, newAdminAddress);
      return expect(nr.administrator()).to.eventually.equal(newAdminAddress);
    });
  });

  describe("set", () => {
    it("can be called by admin", async () => {
      const bulkAddress = randomAddress();
      const txRsp = await nr.set(ContractKeys.BulkIssue, bulkAddress);
      return expect(nr.get(ContractKeys.BulkIssue)).to.eventually.equal(
        bulkAddress
      );
    });

    it("can't be called by non admin", () => {
      const nrNotAdmin = nr.connect(noAuthWallet);
      return expect(
        nrNotAdmin.set(ContractKeys.Administrator, noAuthWallet.address)
      ).to.rejectedWith(`The sender is not the Administrator`);
    });
  });
});
