const hre = require("hardhat");
const { ethers } = require("ethers");

const { expect, use } = require("chai");
const chaiAsPromised = require("chai-as-promised");
const waffle = require("ethereum-waffle");

const { ContractKeys } = require("../startrail-common-js/contracts/types");
const {
  randomAddress, randomBoolean, randomTokenId,
} = require("../startrail-common-js/test-helpers/test-utils");

const { randomSha256, sendWithEIP2771 } = require("./helpers/utils");
const { fixtureDefault } = require("./helpers/fixtures");
const { MerkleTree } = require("./helpers/merkletree-oz-helper.js");
const { decodeEventLog, getWallets } = require("../utils/hardhat-helpers");
const { nameRegistrySet } = require("../utils/name-registry-set");

use(chaiAsPromised);
use(waffle.solidity);

// Signing wallets
const wallets = getWallets(hre);
const administratorWallet = wallets[0];
const noAuthWallet = wallets[1];
const trustedForwarderWallet = wallets[9];

// EIP2771 forwards will use this address
const luwAddress = randomAddress();

// Contract handle
let bulk;
let nameRegistry;
let startrailRegistry;

const prepareBatchFromLicensedUser = (merkleRoot) =>
  sendWithEIP2771(
    bulk,
    "prepareBatchFromLicensedUser",
    [merkleRoot],
    luwAddress,
    trustedForwarderWallet
  );

const generateApproveByCommitmentSRRs = (tokenIds, withCustomHistoryId) => {
  const reveal = randomSha256();
  const commitment = ethers.utils.keccak256(reveal);

  if (withCustomHistoryId) {
    return tokenIds.map((v, i) => ({
      tokenId: v,
      commitment: commitment,
      historyMetadataDigest: randomSha256().toString(),
      customHistoryId: randomTokenId(),
    }));
  } else {
    return tokenIds.map((v, i) => ({
      tokenId: v,
      commitment: commitment,
      historyMetadataDigest: randomSha256().toString(),
      customHistoryId: 0,
    }));
  }
};

const createMerkleTreeFromApproveByCommitmentSRRs = (srrs) => {
  let srrApproveHashStrings
  srrApproveHashStrings = srrs.map((srr) => hashApproveByCommitmentSRR(srr));
  const srrApproveHashBuffers = srrApproveHashStrings.map((srr) =>
    Buffer.from(srr.substring(2), "hex")
  );

  return {
    tree: new MerkleTree(srrApproveHashBuffers),
    hashStrings: srrApproveHashStrings,
    hashBuffers: srrApproveHashBuffers,
  };
};

const hashApproveByCommitmentSRR = (srr) =>
  ethers.utils.solidityKeccak256(
    ["uint256", "bytes32", "string", "uint256"],
    Object.values(srr)
  );

const createSRR = async () => {
  const txReceipt = await sendWithEIP2771(
    startrailRegistry,
    `createSRRFromLicensedUser(bool,address,bytes32,bool)`,
    [
      randomBoolean(), // isPrimaryIssuer
      randomAddress(), // artistAddress
      randomSha256(), // metadataDigest
      false // lockExternalTransfer
    ],
    luwAddress,
    trustedForwarderWallet
  ).then((txRsp) => txRsp.wait(0))

  const eventArgs = decodeEventLog(
    startrailRegistry,
    "CreateSRR(uint256,(bool,address,address),bytes32,bool)",
    txReceipt.logs[1]
  );

  return eventArgs[0].toNumber(); // tokenId
};

describe("BulkTransfer", () => {
  before(async () => {
    ({ startrailRegistry, bulkTransfer: bulk, nameRegistry } = await hre.waffle.loadFixture(
      fixtureDefault
    ));

    // For unit testing set the trusted forwarders and the administrator to
    // EOA wallets. This will allow transactions to be sent directly to the
    // BulkTransfer which is simpler for unit testing purposes.
    await nameRegistrySet(
      hre,
      ContractKeys.Administrator,
      administratorWallet.address
    );

    const bulkAdmin = bulk.connect(administratorWallet);
    await bulkAdmin.setTrustedForwarder(trustedForwarderWallet.address)

    const startrailRegistryAdmin = startrailRegistry.connect(administratorWallet);
    await startrailRegistryAdmin.setTrustedForwarder(trustedForwarderWallet.address)
  });

  describe("initializer", () => {
    it("can't be called twice", () =>
      expect(
        bulk.initialize(nameRegistry.address, trustedForwarderWallet.address)
      ).to.eventually.be.rejectedWith(
        `Contract instance has already been initialized`
      ));
  });

  describe("setTrustedForwarder", () => {
    it("can't be called by non admin", () => {
      const bulkNoAuth = bulk.connect(noAuthWallet);
      return expect(
        bulkNoAuth.setTrustedForwarder(noAuthWallet.address)
      ).to.eventually.be.rejectedWith(
        `Caller is not the Startrail Administrator`
      );
    });
  });

  describe("prepareBatchFromLicensedUser", () => {
    it("prepares batch", async () => {
      const merkleRoot = randomSha256();
      const txRspPromise = prepareBatchFromLicensedUser(merkleRoot);
      await expect(txRspPromise)
        .to.emit(bulk, "BatchPrepared")
        .withArgs(merkleRoot, luwAddress);

      const bulkRecord = await bulk.batches(merkleRoot);
      expect(bulkRecord[0]).to.equal(true); // prepared
      expect(bulkRecord[1]).to.equal(luwAddress); // issuer
      expect(bulkRecord[2]).to.equal(0); // processedCount
    });

    it("rejects duplicate batch", async () => {
      // Prepare a new batch
      const merkleRoot = randomSha256();
      await prepareBatchFromLicensedUser(merkleRoot);

      // Attempt to prepare another batch with the same root
      return expect(
        prepareBatchFromLicensedUser(merkleRoot)
      ).to.eventually.be.rejectedWith(
        `Batch already exists for the given merkle root`
      );
    });

    it("rejects if msg.sender is not the trusted forwarder", async () => {
      const merkleRoot = randomSha256();
      const bulkTransferNotTrusted = bulk.connect(noAuthWallet);
      return expect(
        bulkTransferNotTrusted.prepareBatchFromLicensedUser(merkleRoot)
      ).to.eventually.be.rejectedWith(
        `Function can only be called through the trusted Forwarder`
      );
    });
  });

  describe("approveSRRByCommitmentWithProof", () => {
    let merkleRoot, srrs, tree, hashBuffers, hashStrings;
    let merkleRootWithCustomHistoryId, srrsWithCustomHistoryId, treeWithCustomHistoryId, hashBuffersWithCustomHistoryId, hashStringsWithCustomHistoryId;

    beforeEach(async () => {
      // create srrs(without customHistoryId)
      const tokenId1 = await createSRR();
      const tokenId2 = await createSRR();

      // create a new batch
      srrs = generateApproveByCommitmentSRRs([tokenId1, tokenId2], false);
      const treeResult = createMerkleTreeFromApproveByCommitmentSRRs(srrs);
      tree = treeResult.tree;
      merkleRoot = tree.getHexRoot();

      hashBuffers = treeResult.hashBuffers;
      hashStrings = treeResult.hashStrings;
      await prepareBatchFromLicensedUser(merkleRoot);

      // create srrs(with customHistoryId)
      const tokenId1WithCustomHistoryId = await createSRR();
      const tokenId2WithCustomHistoryId = await createSRR();

      // create a new batch
      srrsWithCustomHistoryId = generateApproveByCommitmentSRRs(
        [
          tokenId1WithCustomHistoryId, 
          tokenId2WithCustomHistoryId
        ], 
        true
      );
      const treeResultWithCustomHistoryId = createMerkleTreeFromApproveByCommitmentSRRs(
        srrsWithCustomHistoryId
      );
      treeWithCustomHistoryId = treeResultWithCustomHistoryId.tree;
      merkleRootWithCustomHistoryId = treeWithCustomHistoryId.getHexRoot();

      hashBuffersWithCustomHistoryId = treeResultWithCustomHistoryId.hashBuffers;
      hashStringsWithCustomHistoryId = treeResultWithCustomHistoryId.hashStrings;
      return prepareBatchFromLicensedUser(merkleRootWithCustomHistoryId);
    });

    it("success with valid leaf and proof", async () => {
      // choose a leaf and get details and proof
      const srrIdx = 1;
      const srr = srrs[srrIdx];
      const srrLeafString = hashStrings[srrIdx];
      const merkleProof = tree.getHexProof(hashBuffers[srrIdx]);
      // approveByCommitment SRR sending proof, root, leaf details
      const txRspPromise = bulk.approveSRRByCommitmentWithProof(
        merkleProof,
        merkleRoot,
        srrLeafString,
        srr.tokenId,
        srr.commitment,
        srr.historyMetadataDigest,
        0
      );

      await expect(txRspPromise)
        .to.emit(bulk, "ApproveSRRByCommitmentWithProof")
        .withArgs(merkleRoot, srr.tokenId, srrLeafString);

      const bulkRecord = await bulk.batches(merkleRoot);
      expect(bulkRecord[1]).to.equal(luwAddress); // sender
      expect(bulkRecord[2]).to.equal(1); // processedCount
    });

    it("success with valid leaf and proof (with customHistoryId)", async () => {
      // choose a leaf and get details and proof
      const srrIdx = 1;
      const srr = srrsWithCustomHistoryId[srrIdx];
      const srrLeafString = hashStringsWithCustomHistoryId[srrIdx];
      const merkleProof = treeWithCustomHistoryId.getHexProof(hashBuffersWithCustomHistoryId[srrIdx]);
      // approveByCommitment SRR sending proof, root, leaf details
      const txRspPromise = bulk.approveSRRByCommitmentWithProof(
        merkleProof,
        merkleRootWithCustomHistoryId,
        srrLeafString,
        srr.tokenId,
        srr.commitment,
        srr.historyMetadataDigest,
        srr.customHistoryId
      );
      await expect(txRspPromise)
        .to.emit(bulk, "ApproveSRRByCommitmentWithProof")
        .withArgs(merkleRootWithCustomHistoryId, srr.tokenId, srrLeafString);
      const bulkRecord = await bulk.batches(merkleRootWithCustomHistoryId);
      expect(bulkRecord[1]).to.equal(luwAddress); // sender
      expect(bulkRecord[2]).to.equal(1); // processedCount
    });

    it("rejects if leaf already processed", async () => {
      const approveSRRByCommitmentWithProof = (srrIdx) => {
        const srr = srrs[srrIdx];
        const srrLeafString = hashStrings[srrIdx];
        const merkleProof = tree.getHexProof(hashBuffers[srrIdx]);

        return bulk.approveSRRByCommitmentWithProof(
          merkleProof,
          merkleRoot,
          srrLeafString,
          srr.tokenId,
          srr.commitment,
          srr.historyMetadataDigest,
          0
        );
      };

      // call create first time succeeds
      const leafIdx = 1;
      await approveSRRByCommitmentWithProof(leafIdx);

      // now call create again for the same leaf
      return expect(approveSRRByCommitmentWithProof(leafIdx)).to.eventually.be.rejectedWith(
        `SRR already processed.`
      );
    });

    it("rejects if merkle proof is wrong", async () => {
      // choose a leaf and get details and proof
      const srrIdx = 1;
      const srr = srrs[srrIdx];
      const srrLeafString = hashStrings[srrIdx];
      const merkleProof = tree.getHexProof(hashBuffers[srrIdx]);

      // swap a hash in the merkle proof to make it invalid
      merkleProof[0] = randomSha256();

      return expect(
        bulk.approveSRRByCommitmentWithProof(
          merkleProof,
          merkleRoot,
          srrLeafString,
          srr.tokenId,
          srr.commitment,
          srr.historyMetadataDigest,
          0
        )
      ).to.eventually.be.rejectedWith(
        `Merkle proof verification failed`
      );
    });

    it("rejects if merkle proof is wrong (with customHistoryId)", async () => {
      // choose a leaf and get details and proof
      const srrIdx = 1;
      const srr = srrsWithCustomHistoryId[srrIdx];
      const srrLeafString = hashStringsWithCustomHistoryId[srrIdx];
      const merkleProof = treeWithCustomHistoryId.getHexProof(hashBuffersWithCustomHistoryId[srrIdx]);

      // swap a hash in the merkle proof to make it invalid
      merkleProof[0] = randomSha256();

      return expect(
        bulk.approveSRRByCommitmentWithProof(
          merkleProof,
          merkleRootWithCustomHistoryId,
          srrLeafString,
          srr.tokenId,
          srr.commitment,
          srr.historyMetadataDigest,
          srr.customHistoryId
        )
      ).to.eventually.be.rejectedWith(
        `Merkle proof verification failed`
      );
    });

    it("rejects if srrApproveHash doesn't match given details", async () => {
      // choose a leaf and get details and proof
      const srrIdx = 1;
      const srr = srrs[srrIdx];
      const merkleProof = tree.getHexProof(hashBuffers[srrIdx]);

      // create the SRR sending proof, root, leaf details BUT with srrApproveHash that does not match
      const invalidSRRLeafString = randomSha256();

      return expect(
        bulk.approveSRRByCommitmentWithProof(
          merkleProof,
          merkleRoot,
          invalidSRRLeafString,
          srr.tokenId,
          srr.commitment,
          srr.historyMetadataDigest,
          0
        )
      ).to.eventually.be.rejectedWith(
        `srrApproveHash does not match the approveSRRByCommitment details`
      );
    });

    it("rejects if srrApproveHash doesn't match given details (with customHistoryId)", async () => {
      // choose a leaf and get details and proof
      const srrIdx = 1;
      const srr = srrsWithCustomHistoryId[srrIdx];
      const merkleProof = treeWithCustomHistoryId.getHexProof(hashBuffersWithCustomHistoryId[srrIdx]);

      // create the SRR sending proof, root, leaf details BUT with srrApproveHash that does not match
      const invalidSRRLeafString = randomSha256();

      return expect(
        bulk.approveSRRByCommitmentWithProof(
          merkleProof,
          merkleRootWithCustomHistoryId,
          invalidSRRLeafString,
          srr.tokenId,
          srr.commitment,
          srr.historyMetadataDigest,
          srr.customHistoryId
        )
      ).to.eventually.be.rejectedWith(
        `srrApproveHash does not match the approveSRRByCommitment details`
      );
    });

    it("rejects if batch doesn't exist", () =>
      expect(
        bulk.approveSRRByCommitmentWithProof(
          [],
          randomSha256(), // merkleRoot will not exist
          randomSha256(),
          randomTokenId().toNumber(),
          randomSha256(),
          randomSha256(),
          0
        )
      ).to.eventually.be.rejectedWith(
        `Batch doesn't exist for the given merkle root`
      ));
  });
});
