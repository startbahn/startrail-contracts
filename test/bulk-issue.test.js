const hre = require("hardhat");
const { ethers } = require("ethers");

const { expect, use } = require("chai");
const chaiAsPromised = require("chai-as-promised");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

const { ContractKeys } = require("../startrail-common-js/contracts/types");
const { srrIdV2Compute, srrIdV3Compute } = require("../startrail-common-js/srr/srr-id-compute");
const {
  randomAddress,
  randomBoolean,
} = require("../startrail-common-js/test-helpers/test-utils");

const { randomSha256, sendWithEIP2771, randomCID } = require("./helpers/utils");
const { fixtureDefault } = require("./helpers/fixtures");
const { MerkleTree } = require("./helpers/merkletree-oz-helper.js");
const { getWallets } = require("../utils/hardhat-helpers");
const { nameRegistrySet } = require("../utils/name-registry-set");

use(chaiAsPromised);

// Signing wallets
const wallets = getWallets(hre);
const administratorWallet = wallets[0];
const noAuthWallet = wallets[1];
const trustedForwarderWallet = wallets[9];

// Shared test data
const luwAddress = randomAddress();

// Contract handle
let bulk;
let nameRegistry;

const prepareBatchFromLicensedUser = (merkleRoot) =>
  sendWithEIP2771(
    bulk,
    "prepareBatchFromLicensedUser",
    [merkleRoot],
    luwAddress,
    trustedForwarderWallet
  );

const generateSRRs = (n) => {
  return Array.apply(null, { length: n }).map((v, i) => ({
    isPrimaryIssuer: Math.round(Math.random()) === 1,
    artistAddress: randomAddress(),
    metadataDigest: randomSha256(),
  }));
};

const generateSRRsWithLockExternalTransfer = (n) => {
  return Array.apply(null, { length: n }).map((v, i) => ({
    isPrimaryIssuer: Math.round(Math.random()) === 1,
    artistAddress: randomAddress(),
    metadataDigest: randomSha256(),
    lockExternalTransfer: randomBoolean(),
  }));
};

const generateSRRsWithCid = async (n) => { 
  const srrs = Promise.all(Array.apply(null, { length: n }).map( async (v, i) => {
    const metadataCID = await randomCID()
    return {
      isPrimaryIssuer: Math.round(Math.random()) === 1,
      artistAddress: randomAddress(),
      metadataDigest: randomSha256(),
      metadataCID,
      lockExternalTransfer: randomBoolean(),
      royaltyReceiver: randomAddress(),
      royaltyBasisPoints: 500, // 5%
    };
  }));
  return srrs;
};

const createMerkleTreeFromSRRs = (srrs) => {
  const srrHashStrings = srrs.map((srr) => hashSRR(srr));
  const srrHashBuffers = srrHashStrings.map((srr) =>
    Buffer.from(srr.substring(2), "hex")
  );
  return {
    tree: new MerkleTree(srrHashBuffers),
    hashStrings: srrHashStrings,
    hashBuffers: srrHashBuffers,
  };
};

const createMerkleTreeFromSRRsWithLockExternalTransfer = (srrs) => {
  const srrHashStrings = srrs.map((srr) => hashSRRWithLockExternalTransfer(srr));
  const srrHashBuffers = srrHashStrings.map((srr) =>
    Buffer.from(srr.substring(2), "hex")
  );
  return {
    tree: new MerkleTree(srrHashBuffers),
    hashStrings: srrHashStrings,
    hashBuffers: srrHashBuffers,
  };
};

const createMerkleTreeFromSRRsWithCid = (srrs) => {
  const srrHashStrings = srrs.map((srr) => hashSRRWithCid({
    isPrimaryIssuer: srr.isPrimaryIssuer,
    artistAddress: srr.artistAddress,
    metadataCID: srr.metadataCID,
    lockExternalTransfer: srr.lockExternalTransfer,
  }));
  const srrHashBuffers = srrHashStrings.map((srr) =>
    Buffer.from(srr.substring(2), "hex")
  );
  return {
    tree: new MerkleTree(srrHashBuffers),
    hashStrings: srrHashStrings,
    hashBuffers: srrHashBuffers,
  };
};

const hashSRR = (srr) =>
  ethers.utils.solidityKeccak256(
    ["bool", "address", "bytes32"],
    Object.values(srr)
  );

const hashSRRWithLockExternalTransfer = (srr) =>
  ethers.utils.solidityKeccak256(
    ["bool", "address", "bytes32", "bool"],
    Object.values(srr)
  );

const hashSRRWithCid = (srr) => {
  return ethers.utils.solidityKeccak256(
    ["bool", "address", "string", "bool"],
    Object.values(srr)
  );
}

describe("BulkIssue", () => {
  before(async () => {
    ({ bulkIssue: bulk, nameRegistry } = await loadFixture(
      fixtureDefault
    ));

    // For unit testing set the trusted forwarders and the administrator to
    // EOA wallets. This will allow transactions to be sent directly to the
    // BulkIssue which is simpler for unit testing purposes.
    await nameRegistrySet(
      hre,
      ContractKeys.Administrator,
      administratorWallet.address
    );
    bulk = bulk.connect(administratorWallet);
    return bulk.setTrustedForwarder(trustedForwarderWallet.address);
  });

  describe("initializer", () => {
    it("can't be called twice", () =>
      expect(
        bulk.initialize(nameRegistry.address, trustedForwarderWallet.address)
      ).to.eventually.be.rejectedWith(
        `Initializable: contract is already initialized`
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
      const bulkIssueNotTrusted = bulk.connect(noAuthWallet);
      return expect(
        bulkIssueNotTrusted.prepareBatchFromLicensedUser(merkleRoot)
      ).to.eventually.be.rejectedWith(
        `Function can only be called through the trusted Forwarder`
      );
    });
  });

  describe("createSRRWithProof", () => {
    let merkleRoot, srrs, tree, hashBuffers, hashStrings;

    beforeEach(() => {
      // create a new batch
      srrs = generateSRRs(5);
      const treeResult = createMerkleTreeFromSRRs(srrs);

      tree = treeResult.tree;
      merkleRoot = tree.getHexRoot();

      hashBuffers = treeResult.hashBuffers;
      hashStrings = treeResult.hashStrings;

      return prepareBatchFromLicensedUser(merkleRoot);
    });

    it.skip("success with valid leaf and proof", async () => {
      // choose a leaf and get details and proof
      const srrIdx = 1;
      const srr = srrs[srrIdx];
      const srrLeafString = hashStrings[srrIdx];
      const merkleProof = tree.getHexProof(hashBuffers[srrIdx]);

      // create the SRR sending proof, root, leaf details
      const txRspPromise = bulk[
        `createSRRWithProof(bytes32[],bytes32,bytes32,bool,address,bytes32)`
      ](
        merkleProof,
        merkleRoot,
        srrLeafString,
        srr.isPrimaryIssuer,
        srr.artistAddress,
        srr.metadataDigest
      );

      const expectedTokenId = srrIdV2Compute(
        srr.artistAddress,
        srr.metadataDigest
      );

      await expect(txRspPromise)
        .to.emit(bulk, "CreateSRRWithProof")
        .withArgs(merkleRoot, expectedTokenId, srrLeafString);

      const bulkRecord = await bulk.batches(merkleRoot);
      expect(bulkRecord[1]).to.equal(luwAddress); // issuer
      expect(bulkRecord[2]).to.equal(1); // processedCount
    });

    it.skip("rejects if leaf already processed", async () => {
      const createSRRWithProof = (srrIdx) => {
        const srr = srrs[srrIdx];
        const srrLeafString = hashStrings[srrIdx];
        const merkleProof = tree.getHexProof(hashBuffers[srrIdx]);

        return bulk[
          `createSRRWithProof(bytes32[],bytes32,bytes32,bool,address,bytes32)`
        ](
          merkleProof,
          merkleRoot,
          srrLeafString,
          srr.isPrimaryIssuer,
          srr.artistAddress,
          srr.metadataDigest
        );
      };

      // call create first time succeeds
      const leafIdx = 1;
      await createSRRWithProof(leafIdx);

      // now call create again for the same leaf
      return expect(createSRRWithProof(leafIdx)).to.eventually.be.rejectedWith(
        `SRR already processed.`
      );
    });

    it.skip("rejects if merkle proof is wrong", async () => {
      // choose a leaf and get details and proof
      const srrIdx = 1;
      const srr = srrs[srrIdx];
      const srrLeafHash = hashStrings[srrIdx];
      const merkleProof = tree.getHexProof(hashBuffers[srrIdx]);

      // swap a hash in the merkle proof to make it invalid
      merkleProof[0] = randomSha256();

      return expect(
        bulk[
          `createSRRWithProof(bytes32[],bytes32,bytes32,bool,address,bytes32)`
        ](
          merkleProof,
          merkleRoot,
          srrLeafHash,
          srr.isPrimaryIssuer,
          srr.artistAddress,
          srr.metadataDigest
        )
      ).to.eventually.be.rejectedWith(
        `Merkle proof verification failed`
      );
    });

    it.skip("rejects if srrHash doesn't match given details", async () => {
      // choose a leaf and get details and proof
      const srrIdx = 1;
      const srr = srrs[srrIdx];
      const merkleProof = tree.getHexProof(hashBuffers[srrIdx]);

      // create the SRR sending proof, root, leaf details BUT with srrHash that does not match
      const invalidSRRLeafHash = randomSha256();

      return expect(
        bulk[
          `createSRRWithProof(bytes32[],bytes32,bytes32,bool,address,bytes32)`
        ](
          merkleProof,
          merkleRoot,
          invalidSRRLeafHash,
          srr.isPrimaryIssuer,
          srr.artistAddress,
          srr.metadataDigest
        )
      ).to.eventually.be.rejectedWith(
        `srrHash does not match the srr details`
      );
    });

    it.skip("rejects if batch doesn't exist", () =>
      expect(
        bulk[
          `createSRRWithProof(bytes32[],bytes32,bytes32,bool,address,bytes32)`
        ](
          [],
          randomSha256(), // merkleRoot will not exist
          randomSha256(),
          true,
          randomAddress(),
          randomSha256()
        )
      ).to.eventually.be.rejectedWith(
        `Batch doesn't exist for the given merkle root`
      ));
  });

  describe("createSRRWithProofMulti", () => {
    let merkleRoot, srrs, tree, hashBuffers, hashStrings;

    beforeEach(() => {
      // create a new batch
      srrs = generateSRRsWithLockExternalTransfer(65); // 64 + 1
      const treeResult = createMerkleTreeFromSRRsWithLockExternalTransfer(srrs);

      tree = treeResult.tree;
      merkleRoot = tree.getHexRoot();

      hashBuffers = treeResult.hashBuffers;
      hashStrings = treeResult.hashStrings;

      return prepareBatchFromLicensedUser(merkleRoot);
    });

    it("success issuing multiple leafs", async () => {
      const issuanceCount = 64

      const srrHashes = []
      const merkleProofs = []
      const srrDetailsList = []

      for (let srrIdx = 0; srrIdx < issuanceCount; srrIdx++) {
        srrHashes.push(hashStrings[srrIdx]);
        merkleProofs.push(tree.getHexProof(hashBuffers[srrIdx]));
        srrDetailsList.push(srrs[srrIdx])
      }

      const txRspPromise = bulk[`createSRRWithProofMulti(bytes32[][],bytes32,bytes32[],bool[],address[],bytes32[],bool[])`](
        merkleProofs,
        merkleRoot,
        srrHashes,
        srrDetailsList.map(srr => srr.isPrimaryIssuer),
        srrDetailsList.map(srr => srr.artistAddress),
        srrDetailsList.map(srr => srr.metadataDigest),
        srrDetailsList.map(srr => srr.lockExternalTransfer),
        {
          // 12M gas - 64 srrs uses ~10.5M gas
          gasLimit: 12000000
        }
      );
      const expectedTokenIds = srrDetailsList.map(srr =>
        srrIdV2Compute(
          srr.artistAddress,
          srr.metadataDigest
        )
      );
      for (let srrIdx = 0; srrIdx < issuanceCount; srrIdx++) {
        await expect(txRspPromise)
          .to.emit(bulk, "CreateSRRWithProof")
          .withArgs(merkleRoot, expectedTokenIds[srrIdx], srrHashes[srrIdx]);
      }
      // console.log(`gasUsed: ${(await txRspPromise.then(rsp => rsp.wait())).gasUsed}`)

      const bulkRecord = await bulk.batches(merkleRoot);
      expect(bulkRecord[1]).to.equal(luwAddress); // issuer
      expect(bulkRecord[2]).to.equal(issuanceCount); // processedCount
    });
  });

  describe("createSRRWithProofMultiWithCid", () => {
    let merkleRoot, srrs, tree, hashBuffers, hashStrings;

    beforeEach(async () => {
      // create a new batch
      srrs = await generateSRRsWithCid(65); // 64 + 1
      
      const treeResult = createMerkleTreeFromSRRsWithCid(srrs);

      tree = treeResult.tree;
      merkleRoot = tree.getHexRoot();

      hashBuffers = treeResult.hashBuffers;
      hashStrings = treeResult.hashStrings;

      return prepareBatchFromLicensedUser(merkleRoot);
    });

    it("success issuing multiple leafs", async () => {
      const issuanceCount = 64

      const srrHashes = []
      const merkleProofs = []
      const srrDetailsList = []

      for (let srrIdx = 0; srrIdx < issuanceCount; srrIdx++) {
        srrHashes.push(hashStrings[srrIdx]);
        merkleProofs.push(tree.getHexProof(hashBuffers[srrIdx]));
        srrDetailsList.push(srrs[srrIdx])
      }

      const txRspPromise = bulk[`createSRRWithProofMulti(bytes32[][],bytes32,bytes32[],bool[],address[],bytes32[],string[],bool[],address[],uint16[])`](
        merkleProofs,
        merkleRoot,
        srrHashes,
        srrDetailsList.map(srr => srr.isPrimaryIssuer),
        srrDetailsList.map(srr => srr.artistAddress),
        srrDetailsList.map(srr => srr.metadataDigest),
        srrDetailsList.map(srr => srr.metadataCID),
        srrDetailsList.map(srr => srr.lockExternalTransfer),
        srrDetailsList.map(srr => srr.royaltyReceiver),
        srrDetailsList.map(srr => srr.royaltyBasisPoints),
        {
          // 20M gas
          gasLimit: 20000000
        }
      );
      const expectedTokenIds = srrDetailsList.map(srr =>
        srrIdV3Compute(
          srr.artistAddress,
          srr.metadataCID
        )
      );
      for (let srrIdx = 0; srrIdx < issuanceCount; srrIdx++) {
        await expect(txRspPromise)
          .to.emit(bulk, "CreateSRRWithProof")
          .withArgs(merkleRoot, expectedTokenIds[srrIdx], srrHashes[srrIdx]);
      }
      // console.log(`gasUsed: ${(await txRspPromise.then(rsp => rsp.wait())).gasUsed}`)

      const bulkRecord = await bulk.batches(merkleRoot);
      expect(bulkRecord[1]).to.equal(luwAddress); // issuer
      expect(bulkRecord[2]).to.equal(issuanceCount); // processedCount
    });

    it("success issuing multiple leafs without royalty", async () => {
      const issuanceCount = 64

      const srrHashes = []
      const merkleProofs = []
      const srrDetailsList = []

      for (let srrIdx = 0; srrIdx < issuanceCount; srrIdx++) {
        srrHashes.push(hashStrings[srrIdx]);
        merkleProofs.push(tree.getHexProof(hashBuffers[srrIdx]));
        srrDetailsList.push(srrs[srrIdx])
      }

      const txRspPromise = bulk[`createSRRWithProofMulti(bytes32[][],bytes32,bytes32[],bool[],address[],bytes32[],string[],bool[],address[],uint16[])`](
        merkleProofs,
        merkleRoot,
        srrHashes,
        srrDetailsList.map(srr => srr.isPrimaryIssuer),
        srrDetailsList.map(srr => srr.artistAddress),
        srrDetailsList.map(srr => srr.metadataDigest),
        srrDetailsList.map(srr => srr.metadataCID),
        srrDetailsList.map(srr => srr.lockExternalTransfer),
        [],
        [],
        {
          // 20M gas
          gasLimit: 20000000
        }
      );
      const expectedTokenIds = srrDetailsList.map(srr =>
        srrIdV3Compute(
          srr.artistAddress,
          srr.metadataCID
        )
      );
      for (let srrIdx = 0; srrIdx < issuanceCount; srrIdx++) {
        await expect(txRspPromise)
          .to.emit(bulk, "CreateSRRWithProof")
          .withArgs(merkleRoot, expectedTokenIds[srrIdx], srrHashes[srrIdx]);
      }
      // console.log(`gasUsed: ${(await txRspPromise.then(rsp => rsp.wait())).gasUsed}`)

      const bulkRecord = await bulk.batches(merkleRoot);
      expect(bulkRecord[1]).to.equal(luwAddress); // issuer
      expect(bulkRecord[2]).to.equal(issuanceCount); // processedCount
    });
  });


  describe("createSRRWithProof with LockExternalTransfer", () => {
    let merkleRoot, srrs, tree, hashBuffers, hashStrings;

    beforeEach(() => {
      // create a new batch
      srrs = generateSRRsWithLockExternalTransfer(5);
      const treeResult = createMerkleTreeFromSRRsWithLockExternalTransfer(srrs);

      tree = treeResult.tree;
      merkleRoot = tree.getHexRoot();

      hashBuffers = treeResult.hashBuffers;
      hashStrings = treeResult.hashStrings;

      return prepareBatchFromLicensedUser(merkleRoot);
    });

    it.skip("success with valid leaf and proof", async () => {
      // choose a leaf and get details and proof
      const srrIdx = 1;
      const srr = srrs[srrIdx];
      const srrLeafString = hashStrings[srrIdx];
      const merkleProof = tree.getHexProof(hashBuffers[srrIdx]);

      // create the SRR sending proof, root, leaf details
      const txRspPromise = bulk[
        `createSRRWithProof(bytes32[],bytes32,bytes32,bool,address,bytes32,bool)`
      ](
        merkleProof,
        merkleRoot,
        srrLeafString,
        srr.isPrimaryIssuer,
        srr.artistAddress,
        srr.metadataDigest,
        srr.lockExternalTransfer
      );

      const expectedTokenId = srrIdV2Compute(
        srr.artistAddress,
        srr.metadataDigest
      );

      await expect(txRspPromise)
        .to.emit(bulk, "CreateSRRWithProof")
        .withArgs(merkleRoot, expectedTokenId, srrLeafString);

      const bulkRecord = await bulk.batches(merkleRoot);
      expect(bulkRecord[1]).to.equal(luwAddress); // issuer
      expect(bulkRecord[2]).to.equal(1); // processedCount
    });

    it.skip("rejects if leaf already processed", async () => {
      const createSRRWithProof = (srrIdx) => {
        const srr = srrs[srrIdx];
        const srrLeafString = hashStrings[srrIdx];
        const merkleProof = tree.getHexProof(hashBuffers[srrIdx]);

        return bulk[
          `createSRRWithProof(bytes32[],bytes32,bytes32,bool,address,bytes32,bool)`
        ](
          merkleProof,
          merkleRoot,
          srrLeafString,
          srr.isPrimaryIssuer,
          srr.artistAddress,
          srr.metadataDigest,
          srr.lockExternalTransfer
        );
      };

      // call create first time succeeds
      const leafIdx = 1;
      await createSRRWithProof(leafIdx);

      // now call create again for the same leaf
      return expect(createSRRWithProof(leafIdx)).to.eventually.be.rejectedWith(
        `SRR already processed.`
      );
    });

    it.skip("rejects if merkle proof is wrong", async () => {
      // choose a leaf and get details and proof
      const srrIdx = 1;
      const srr = srrs[srrIdx];
      const srrLeafHash = hashStrings[srrIdx];
      const merkleProof = tree.getHexProof(hashBuffers[srrIdx]);

      // swap a hash in the merkle proof to make it invalid
      merkleProof[0] = randomSha256();

      return expect(
        bulk[
          `createSRRWithProof(bytes32[],bytes32,bytes32,bool,address,bytes32,bool)`
        ](
          merkleProof,
          merkleRoot,
          srrLeafHash,
          srr.isPrimaryIssuer,
          srr.artistAddress,
          srr.metadataDigest,
          srr.lockExternalTransfer
        )
      ).to.eventually.be.rejectedWith(
        `Merkle proof verification failed`
      );
    });

    it.skip("rejects if srrHash doesn't match given details", async () => {
      // choose a leaf and get details and proof
      const srrIdx = 1;
      const srr = srrs[srrIdx];
      const merkleProof = tree.getHexProof(hashBuffers[srrIdx]);

      // create the SRR sending proof, root, leaf details BUT with srrHash that does not match
      const invalidSRRLeafHash = randomSha256();

      return expect(
        bulk[
          `createSRRWithProof(bytes32[],bytes32,bytes32,bool,address,bytes32,bool)`
        ](
          merkleProof,
          merkleRoot,
          invalidSRRLeafHash,
          srr.isPrimaryIssuer,
          srr.artistAddress,
          srr.metadataDigest,
          srr.lockExternalTransfer
        )
      ).to.eventually.be.rejectedWith(
        `srrHash does not match the srr details`
      );
    });

    it.skip("rejects if batch doesn't exist", () =>
      expect(
        bulk[
          `createSRRWithProof(bytes32[],bytes32,bytes32,bool,address,bytes32,bool)`
        ](
          [],
          randomSha256(), // merkleRoot will not exist
          randomSha256(),
          true,
          randomAddress(),
          randomSha256(),
          randomBoolean()
        )
      ).to.eventually.be.rejectedWith(
        `Batch doesn't exist for the given merkle root`
      ));
  });
});
