import { expect, use } from 'chai'
import chaiAsPromised from 'chai-as-promised'
import { ethers } from 'ethers'
import hre from 'hardhat'
import { ContractKeys } from '../startrail-common-js/contracts/types'
import { srrIdV3Compute } from '../startrail-common-js/srr/srr-id-compute'
import {
  randomAddress,
  randomBoolean,
} from '../startrail-common-js/test-helpers/test-utils'

import { loadFixture } from '@nomicfoundation/hardhat-network-helpers'

import { CollectionProxyFeaturesAggregate } from '../typechain-types'
import { getWallets } from '../utils/hardhat-helpers'
import { nameRegistrySet } from '../utils/name-registry-set'
import { setupCollection } from './helpers/collections'
import { fixtureDefault } from './helpers/fixtures'
import { MerkleTree } from './helpers/merkletree-oz-helper.js'
import {
  BULK_CONTRACT_EVENT_KEYS,
  BULK_CONTRACT_METHOD_KEYS,
  ZERO_ADDRESS,
  createLicensedUserWalletDirect,
  randomCID,
  randomSha256,
  sendWithEIP2771,
} from './helpers/utils'
import _ from 'lodash'
import { toChecksumAddress } from './helpers/startrail-registry'

use(chaiAsPromised)

const TWELVE_MILLION = 12_000_000

// Signing wallets
const wallets = getWallets(hre)
const administratorWallet = wallets[0]
const noAuthWallet = wallets[1]
const collectionOwnerWallet = wallets[2]
const trustedForwarderWallet = wallets[9]

// Shared test data
let luwAddress: string

// Generated batch data
let merkleRoot, srrs, tree, hashBuffers, hashStrings

// Contract handle
let bulk
let nameRegistry
let startrailRegistry
let collection: CollectionProxyFeaturesAggregate

const prepareBatchFromLicensedUser = (merkleRoot, sender = luwAddress) =>
  sendWithEIP2771(
    bulk,
    'prepareBatchFromLicensedUser',
    [merkleRoot],
    sender,
    trustedForwarderWallet
  )

const generateSRRs = async (
  n,
  options: {
    collectionAddress?: string
    to?: string
  } = {}
) => {
  const { collectionAddress, to } = options
  const srrs = Promise.all(
    Array.apply(null, { length: n }).map(async (v, i) => {
      const metadataCID = await randomCID()
      return {
        isPrimaryIssuer: Math.round(Math.random()) === 1,
        artistAddress: randomAddress(),
        metadataCID,
        lockExternalTransfer: randomBoolean(),
        to: to || ZERO_ADDRESS,
        royaltyReceiver: randomAddress(),
        royaltyBasisPoints: 500, // 5%
        contractAddress: collectionAddress
          ? toChecksumAddress(collectionAddress)
          : ZERO_ADDRESS,
      }
    })
  )
  return srrs
}

const createMerkleTreeFromSRRs = (srrs, isToInLeafHash) => {
  const srrHashStrings = srrs.map((srr) => {
    return hashSRR(srr, isToInLeafHash)
  })
  const srrHashBuffers = srrHashStrings.map((srr) =>
    Buffer.from(srr.substring(2), 'hex')
  )
  return {
    tree: new MerkleTree(srrHashBuffers),
    hashStrings: srrHashStrings,
    hashBuffers: srrHashBuffers,
  }
}

const hashSRR = (srr, isToInLeafHash) => {
  const baseTypes = ['bool', 'address', 'string', 'bool']
  const omitKeys = []

  if (isToInLeafHash) {
    baseTypes.push('address')
  } else {
    omitKeys.push('to')
  }
  baseTypes.push(...['address', 'uint16'])
  if (srr.contractAddress !== ZERO_ADDRESS) {
    baseTypes.push('address')
  } else {
    omitKeys.push('contractAddress')
  }

  return ethers.utils.solidityKeccak256(
    baseTypes,
    Object.values(_.omit(srr, omitKeys))
  )
}

interface CreateSRRWithProofSingleOverrides {
  merkleRoot?: string
  merkleProof?: string[]
  leafHash?: string
}

const createSRRWithProofSingle = (
  srrIdx,
  overrides: CreateSRRWithProofSingleOverrides = {},
  options: {
    isLegacy: boolean
  } = {
    isLegacy: false,
  }
) => {
  const { isLegacy } = options
  const srr = srrs[srrIdx]

  const merkleProof = overrides.merkleProof
    ? overrides.merkleProof
    : tree.getHexProof(hashBuffers[srrIdx])
  const merkleRoot_ = overrides.merkleRoot ? overrides.merkleRoot : merkleRoot
  const leafHash = overrides.leafHash ? overrides.leafHash : hashStrings[srrIdx]

  const fnName = isLegacy
    ? BULK_CONTRACT_METHOD_KEYS.createLegacy
    : BULK_CONTRACT_METHOD_KEYS.create
  return bulk[fnName](
    ..._.compact([
      [merkleProof],
      merkleRoot_,
      [leafHash],
      [srr.isPrimaryIssuer],
      [srr.artistAddress],
      [srr.metadataCID],
      [srr.lockExternalTransfer],
      isLegacy ? null : [srr.to],
      [srr.royaltyReceiver],
      [srr.royaltyBasisPoints],
      [srr.contractAddress],
    ])
  )
}

const createSRRWithProofMulti = async (
  numLeavesToSend: number,
  options: {
    isLegacy: boolean
  } = {
    isLegacy: false,
  }
) => {
  const { isLegacy } = options
  const srrHashes = []
  const merkleProofs = []
  const srrDetailsList = []

  for (let srrIdx = 0; srrIdx < numLeavesToSend; srrIdx++) {
    srrHashes.push(hashStrings[srrIdx])
    merkleProofs.push(tree.getHexProof(hashBuffers[srrIdx]))
    srrDetailsList.push(srrs[srrIdx])
  }

  const methodInputs = _.compact([
    merkleProofs,
    merkleRoot,
    srrHashes,
    srrDetailsList.map((srr) => srr.isPrimaryIssuer),
    srrDetailsList.map((srr) => srr.artistAddress),
    srrDetailsList.map((srr) => srr.metadataCID),
    srrDetailsList.map((srr) => srr.lockExternalTransfer),
    isLegacy ? null : srrDetailsList.map((srr) => srr.to),
    srrDetailsList.map((srr) => srr.royaltyReceiver),
    srrDetailsList.map((srr) => srr.royaltyBasisPoints),
  ])

  methodInputs.push(srrDetailsList.map((srr) => srr.contractAddress))

  const fnName = isLegacy
    ? BULK_CONTRACT_METHOD_KEYS.createLegacy
    : BULK_CONTRACT_METHOD_KEYS.create
  const txRsp = await bulk[fnName](...methodInputs, {
    gasLimit: TWELVE_MILLION,
  })

  const expectedTokenIds = srrDetailsList.map((srr) =>
    srrIdV3Compute(srr.artistAddress, srr.metadataCID)
  )
  for (let srrIdx = 0; srrIdx < numLeavesToSend; srrIdx++) {
    const srr = srrs[srrIdx]
    await expect(txRsp)
      .to.emit(bulk, BULK_CONTRACT_EVENT_KEYS.create)
      .withArgs(
        merkleRoot,
        srrDetailsList[srrIdx].contractAddress,
        expectedTokenIds[srrIdx],
        srrHashes[srrIdx]
      )
    // Confirm that the SRR has been successfully transferred to the address `to`
    if (srr.to !== ZERO_ADDRESS) {
      const owner =
        srr.contractAddress !== ZERO_ADDRESS
          ? await collection.ownerOf(expectedTokenIds[srrIdx])
          : await startrailRegistry.ownerOf(expectedTokenIds[srrIdx])
      expect(owner).equal(srrs[srrIdx].to)
    }
  }

  const bulkRecord = await bulk.batches(merkleRoot)
  expect(bulkRecord[1]).to.equal(luwAddress) // issuer
  expect(bulkRecord[2]).to.equal(numLeavesToSend) // processedCount
}

describe('Bulk (issuances)', () => {
  before(async () => {
    ;({ bulk, nameRegistry, startrailRegistry } = await loadFixture(
      fixtureDefault
    ))

    // For unit testing set the trusted forwarders and the administrator to
    // EOA wallets. This will allow transactions to be sent directly to the
    // BulkIssue which is simpler for unit testing purposes.
    await nameRegistrySet(
      hre,
      ContractKeys.Administrator,
      administratorWallet.address
    )
    ;({ walletAddress: luwAddress } = await createLicensedUserWalletDirect(
      hre,
      {
        owners: [collectionOwnerWallet.address],
      },
      administratorWallet
    ))

    bulk = bulk.connect(administratorWallet)
    return bulk.setTrustedForwarder(trustedForwarderWallet.address)
  })

  describe('initializer', () => {
    it("can't be called twice", () =>
      expect(
        bulk.initialize(nameRegistry.address, trustedForwarderWallet.address)
      ).to.eventually.be.rejectedWith(
        `Initializable: contract is already initialized`
      ))
  })

  describe('setTrustedForwarder', () => {
    it("can't be called by non admin", () => {
      const bulkNoAuth = bulk.connect(noAuthWallet)
      return expect(
        bulkNoAuth.setTrustedForwarder(noAuthWallet.address)
      ).to.eventually.be.rejectedWith(
        `Caller is not the Startrail Administrator`
      )
    })
  })

  describe('prepareBatchFromLicensedUser', () => {
    it('prepares batch', async () => {
      const merkleRoot = randomSha256()
      const txRspPromise = prepareBatchFromLicensedUser(merkleRoot)
      await expect(txRspPromise)
        .to.emit(bulk, 'BatchPrepared')
        .withArgs(merkleRoot, luwAddress)

      const bulkRecord = await bulk.batches(merkleRoot)
      expect(bulkRecord[0]).to.equal(true) // prepared
      expect(bulkRecord[1]).to.equal(luwAddress) // issuer
      expect(bulkRecord[2]).to.equal(0) // processedCount
    })

    it('rejects duplicate batch', async () => {
      // Prepare a new batch
      const merkleRoot = randomSha256()
      await prepareBatchFromLicensedUser(merkleRoot)

      // Attempt to prepare another batch with the same root
      return expect(
        prepareBatchFromLicensedUser(merkleRoot)
      ).to.eventually.be.rejectedWith(
        `Batch already exists for the given merkle root`
      )
    })

    it('rejects if msg.sender is not the trusted forwarder', async () => {
      const merkleRoot = randomSha256()
      const bulkIssueNotTrusted = bulk.connect(noAuthWallet)
      return expect(
        bulkIssueNotTrusted.prepareBatchFromLicensedUser(merkleRoot)
      ).to.eventually.be.rejectedWith(
        `Function can only be called through the trusted Forwarder`
      )
    })
  })

  describe('createSRRWithProofMulti (collection)', () => {
    const createAndInitBatch = async (
      batchSize: number,
      options: {
        sender: string
        to?: string
      } = {
        sender: luwAddress,
      }
    ) => {
      const { to } = options
      srrs = await generateSRRs(batchSize, {
        collectionAddress: collection.address,
        to,
      })

      const treeResult = createMerkleTreeFromSRRs(srrs, true)
      tree = treeResult.tree
      merkleRoot = tree.getHexRoot()

      hashBuffers = treeResult.hashBuffers
      hashStrings = treeResult.hashStrings

      return prepareBatchFromLicensedUser(merkleRoot, options.sender)
    }

    before(async () => {
      ;({ collection } = await setupCollection(
        hre,
        administratorWallet,
        collectionOwnerWallet,
        {
          collectionOwnerLUWAddress: luwAddress,
        }
      ))
    })

    it('success issuing 30 leaves with 12M gas - without issuing on buyer', async () => {
      await createAndInitBatch(30)
      await createSRRWithProofMulti(30)
    })

    it('success issuing 30 leaves with 12M gas - with issuing on buyer', async () => {
      const to = randomAddress()
      await createAndInitBatch(30, {
        sender: luwAddress,
        to,
      })
      await createSRRWithProofMulti(30)
    })

    it('rejects if luw is not collection owner', async () => {
      const luwAddress2 = randomAddress()
      await createAndInitBatch(4, {
        sender: luwAddress2,
      })
      return expect(createSRRWithProofSingle(1)).to.be.rejectedWith(
        `NotCollectionOwner()`
      )
    })

    it('rejects if merkle proof is wrong', async () => {
      await createAndInitBatch(4)
      const leafIdx = 2
      const merkleProof = tree.getHexProof(hashBuffers[leafIdx])
      merkleProof[0] = randomSha256()
      return expect(
        createSRRWithProofSingle(leafIdx, { merkleProof })
      ).to.be.rejectedWith(`Merkle proof verification failed`)
    })

    it('rejects if leaf already processed', async () => {
      await createAndInitBatch(4)
      const leafIdx = 1

      // call create first time succeeds
      await createSRRWithProofSingle(leafIdx)

      // now call create again for the same leaf
      return expect(createSRRWithProofSingle(leafIdx)).to.be.rejectedWith(
        `SRR already processed.`
      )
    })

    it("rejects if srrHash doesn't match given details", async () => {
      await createAndInitBatch(4)
      const invalidSRRLeafHash = randomSha256()
      return expect(
        createSRRWithProofSingle(1, { leafHash: invalidSRRLeafHash })
      ).to.be.rejectedWith(`leafHash does not match the srr details`)
    })

    it("rejects if batch doesn't exist", async () => {
      await createAndInitBatch(4)
      expect(
        createSRRWithProofSingle(1, { merkleRoot: randomSha256() })
      ).to.be.rejectedWith(`Batch doesn't exist for the given merkle root`)
    })
  })

  describe('createSRRWithProofMulti (Startrail Registry)', () => {
    const createAndInitBatch = async (
      batchSize: number,
      options: {
        isToInLeafHash: boolean
        to?: string
      } = {
        isToInLeafHash: true,
      }
    ) => {
      srrs = await generateSRRs(batchSize, options)

      const treeResult = createMerkleTreeFromSRRs(srrs, true)
      tree = treeResult.tree
      merkleRoot = tree.getHexRoot()

      hashBuffers = treeResult.hashBuffers
      hashStrings = treeResult.hashStrings

      return prepareBatchFromLicensedUser(merkleRoot)
    }

    it('success issuing 30 leaves with 12M gas - without issuing on buyer', async () => {
      await createAndInitBatch(30)
      await createSRRWithProofMulti(30)
    })

    it('success issuing 30 leaves with 12M gas - with issuing on buyer', async () => {
      const to = randomAddress()
      await createAndInitBatch(30, {
        to,
        isToInLeafHash: true,
      })
      await createSRRWithProofMulti(30)
    })
  })
})
