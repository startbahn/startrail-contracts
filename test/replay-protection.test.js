const { assert } = require("chai");
const { packNonce } = require("../startrail-common-js/meta-tx/nonce");

describe("ReplayProtection", function () {
  let replay;

  before(async () => {
    // use a concrete subcontract so internal functions can be called
    const IsReplayProtection = await ethers.getContractFactory(
      "IsReplayProtection"
    );
    replay = await IsReplayProtection.deploy().then((c) => c.deployed());
  });

  it("packNonce packs nonces correctly", async () => {
    const pack = (n1, n2) =>
      replay.packNonce(n1, n2).then((bn) => bn.toHexString());
    assert.equal(await pack(0, 0), "0x00");
    assert.equal(await pack(0, 1), "0x01");
    assert.equal(await pack(1, 0), "0x0100000000000000000000000000000000");
    assert.equal(await pack(2, 2), "0x0200000000000000000000000000000002");
  });

  const checkAndUpdateNonce = (wallet, channel) =>
    replay.checkAndUpdateNoncePublic(wallet, channel).then((tx) => tx.wait());

  const assertGetNonce = async (wallet, channel, expectedNonce) =>
    assert.equal(
      await replay.getNonce(wallet, channel).then((bn) => bn.toString()),
      String(expectedNonce)
    );

  describe("getNonce", () => {
    it("initial nonce for new wallet is zero", async () => {
      const newWallet = ethers.Wallet.createRandom().address;
      // channel '0' => nonce '0'
      assert.equal(await replay.getNonce(newWallet, 0), 0);
      // channel '1' => nonce '0'
      assert.equal(await replay.getNonce(newWallet, 1), 0);
    });
  });

  describe("checkAndUpdateNonce", async () => {
    it("increments the nonce when expected next nonce passed", async () => {
      const newWallet = ethers.Wallet.createRandom().address;

      // channel 0 initial => 0
      await assertGetNonce(newWallet, 0, 0);

      // channel 0 => 1
      await checkAndUpdateNonce(newWallet, packNonce(0, 0));
      await assertGetNonce(newWallet, 0, 1);

      // channel 0 => 2
      await checkAndUpdateNonce(newWallet, packNonce(0, 1));
      await assertGetNonce(newWallet, 0, 2);

      // channel 1 initial => 0
      await assertGetNonce(newWallet, 1, 0);

      // channel 1 => 1
      await checkAndUpdateNonce(newWallet, packNonce(1, 0));
      await assertGetNonce(newWallet, 1, 1);

      // channel 1 => 2
      await checkAndUpdateNonce(newWallet, packNonce(1, 1));
      await assertGetNonce(newWallet, 1, 2);
    });

    it("does not increment the nonce when wrong next nonce given", async () => {
      const newWallet = ethers.Wallet.createRandom().address;

      // initial nonce should be 0 but we pass 1
      // expect the inital nonce is still 0 (NOT incremented)
      await checkAndUpdateNonce(newWallet, packNonce(0, 1));
      await assertGetNonce(newWallet, 0, 0);

      // repeat the above previous test for channel = 1
      await checkAndUpdateNonce(newWallet, packNonce(1, 1));
      await assertGetNonce(newWallet, 1, 0);
    });
  });
});
