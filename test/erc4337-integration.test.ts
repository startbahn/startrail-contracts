import { expect } from "chai";
import hre, { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { ContractKeys } from "../startrail-common-js/contracts/types";
import { nameRegistrySet } from "../utils/name-registry-set";
import { Contract, Signer, BigNumber } from "ethers";
import { createSRRRequest, sendWithEIP2771 } from "./helpers/utils";
import { getWallets } from "../utils/hardhat-helpers";

describe("ERC-4337 Integration with StartrailRegistryV26", function () {
  let licensedUserManager: Contract;
  let nameRegistry: Contract;
  let metaTxForwarder: Contract;
  let startrailRegistry: Contract;
  let admin: Signer;
  let handlerOwner: Signer;
  let luwAddressOld: string;
  let luwAddressNew: string;

  beforeEach(async function () {
    [admin, handlerOwner] = await ethers.getSigners();

    // Use the full Startrail deployment fixture to link all libraries and deploy latest contracts
    const fixture = await loadFixture(require("./helpers/fixtures").fixtureDefault);
    const { startrailRegistry: sr, nameRegistry: nr, lum, metaTxForwarder: mtf } = fixture as any;
    startrailRegistry = sr;
    nameRegistry = nr;
    licensedUserManager = lum;
    metaTxForwarder = mtf;

    // Point Administrator to EOA for direct admin calls in this test
    await nameRegistrySet(hre, ContractKeys.Administrator, await admin.getAddress());

    // Create and deploy a handler LUW via LUM (admin EOA is allowed)
    const salt = ethers.utils.id("handler-" + Date.now().toString());
    const salt2 = ethers.utils.id("handler2-" + Date.now().toString());
    const owners = [await handlerOwner.getAddress()];
    const threshold = 1;
    const userTypeHandler = 0; // LicensedUserManagerV03.UserType.HANDLER
    const englishName = "Handler English";
    const originalName = "Handler Original";

    const tx = await licensedUserManager
      .connect(admin)
      .createWallet([owners, threshold, userTypeHandler, englishName, originalName], salt);
    const receipt = await tx.wait();

    let walletFromEvent: string | undefined;
    for (const log of receipt.logs) {
      try {
        const parsed = licensedUserManager.interface.parseLog(log);
        if (parsed && parsed.name === "CreateLicensedUserWallet") {
          walletFromEvent = parsed.args.walletAddress;
          break;
        }
      } catch {}
    }
    luwAddressOld = walletFromEvent as string;
    expect(ethers.utils.isAddress(luwAddressOld)).to.equal(true);

    const tx2 = await licensedUserManager
      .connect(admin)
      .deploy(salt2, luwAddressOld);
    const receipt2 = await tx2.wait();
    let walletFromEvent2: string | undefined;
    for (const log of receipt2.logs) {
        try {
          const parsed = licensedUserManager.interface.parseLog(log);
          if (parsed && parsed.name === "DeployLicensedUserWallet") {
            walletFromEvent2 = parsed.args.walletAddress;
            break;
          }
      } catch {}
    }
    luwAddressNew = walletFromEvent2 as string
    expect(ethers.utils.isAddress(luwAddressNew)).to.equal(true)
  });

  describe("trustedForwarderAndDeployedActiveWalletOnly modifier", function () {
    it("allows call from deployed active LicensedUserWallet (no forwarder)", async function () {
      // Build request using helper for consistency
      const req = await createSRRRequest();

      const { data } = await startrailRegistry.populateTransaction[
        "createSRRFromLicensedUser(bool,address,string,bool,address,address,uint16)"
      ](
        req.isPrimaryIssuer,
        req.artistAddress,
        req.metadataCID,
        req.lockExternalTransfer,
        req.to,
        req.royaltyReceiver,
        req.royaltyBasisPoints
      );

      // Call from the LUW contract using execute()
      const luw = await ethers.getContractAt("LicensedUserWallet", luwAddressNew);
      const execTx = await luw.connect(handlerOwner).execute([
        { to: startrailRegistry.address, value: BigNumber.from(0), data: data as string },
      ]);
      const execRcpt = await execTx.wait();

      // Parse CreateSRR event and assert owner is LUW
      let tokenId: BigNumber | undefined;
      for (const log of execRcpt.logs) {
        try {
          const parsed = startrailRegistry.interface.parseLog(log);
          if (parsed.name === "CreateSRR") {
            tokenId = parsed.args[0];
            break;
          }
        } catch {}
      }
      expect(tokenId, "CreateSRR not emitted").to.not.be.undefined;
      const owner = await startrailRegistry.ownerOf(tokenId as BigNumber);
      expect(owner).to.equal(luwAddressNew);
    });

    it("allows call via trusted forwarder from LUW signer", async function () {
      const wallets = getWallets(hre as any);
      const trustedForwarderWallet = wallets[9];

      // Ensure SRR trusts our test forwarder EOA
      await startrailRegistry
        .connect(await ethers.getSigner(0))
        .setTrustedForwarder(trustedForwarderWallet.address);

      const req = await createSRRRequest();   

      const rcpt = await sendWithEIP2771(
        startrailRegistry,
        "createSRRFromLicensedUser(bool,address,string,bool,address,address,uint16)",
        [
          req.isPrimaryIssuer,
          req.artistAddress,
          req.metadataCID,
          req.lockExternalTransfer,
          req.to,
          req.royaltyReceiver,
          req.royaltyBasisPoints,
        ],
        luwAddressOld,
        trustedForwarderWallet
      ).then((tx) => tx.wait());

      let tokenId: BigNumber | undefined;
      for (const log of rcpt.logs) {
        try {
          const parsed = startrailRegistry.interface.parseLog(log);
          if (parsed.name === "CreateSRR") {
            tokenId = parsed.args[0];
            break;
          }
        } catch {}
      }
      expect(tokenId, "CreateSRR not emitted via forwarder").to.not.be.undefined;
      const owner = await startrailRegistry.ownerOf(tokenId as BigNumber);
      expect(owner).to.equal(luwAddressOld);
    });
  });
});