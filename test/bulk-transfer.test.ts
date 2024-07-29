import { expect, use } from 'chai'
import chaiAsPromised from 'chai-as-promised'
import { ethers } from 'ethers'
import hre from 'hardhat'
import { pick } from 'lodash'
import { ContractKeys } from '../startrail-common-js/contracts/types'
import {
  randomAddress,
  randomBoolean,
  randomTokenId,
} from '../startrail-common-js/test-helpers/test-utils'

import { loadFixture } from '@nomicfoundation/hardhat-network-helpers'

import { decodeEventLog, getWallets } from '../utils/hardhat-helpers'
import { nameRegistrySet } from '../utils/name-registry-set'
import {
  createSRR as createSRROnCollection,
  setupCollection,
} from './helpers/collections'
import {
  startrailRegistryWriteCustomHistoryType,
  startrailRegistryWriteCustomHistory,
  toChecksumAddress,
} from './helpers/startrail-registry'

import { fixtureDefault } from './helpers/fixtures'
import { MerkleTree } from './helpers/merkletree-oz-helper.js'
import {
  BULK_CONTRACT_EVENT_KEYS,
  BULK_CONTRACT_METHOD_KEYS,
  randomCID,
  randomText,
  randomSha256,
  sendWithEIP2771,
  ZERO_ADDRESS,
  createLicensedUserWalletDirect,
} from './helpers/utils'
import { aCID } from '../startrail-common-js/test-helpers/test-data'

use(chaiAsPromised)

// Signing wallets
const wallets = getWallets(hre)
const administratorWallet = wallets[0]
const noAuthWallet = wallets[1]
const anotherWallet = wallets[2]
const collectionOwnerWallet = wallets[3]
const trustedForwarderWallet = wallets[9]

// EIP2771 forwards will use this address
let luw1: string // default luw address
let luw2: string

// Contract handle
let bulk: ethers.Contract
let nameRegistry: ethers.Contract
let startrailRegistry: ethers.Contract
let customHistoryTypeId: number

const prepareBatchFromLicensedUser = (merkleRoot) =>
  sendWithEIP2771(
    bulk,
    'prepareBatchFromLicensedUser',
    [merkleRoot],
    luw1,
    trustedForwarderWallet
  )

type ActionType = 'approveSRRByCommitment' | 'transferFromWithProvenance'

interface BulkActionAndToken {
  actionType: ActionType
  contractAddress?: string
  tokenId: number
}

interface BulkActionRecord {
  actionType: ActionType
  data: Record<string, any>
}

const generateBulkActionRecords = async (
  bulkActions: ReadonlyArray<BulkActionAndToken>,
  withCustomHistoryId = true
): Promise<ReadonlyArray<BulkActionRecord>> => {
  const reveal = randomSha256()
  const commitment = ethers.utils.keccak256(reveal)
  const to = anotherWallet.address
  const isIntermediary = randomBoolean()
  const historyMetadataHash = await randomCID()
  let customHistoryId = 0
  if (withCustomHistoryId) {
    customHistoryId = await startrailRegistryWriteCustomHistory(
      startrailRegistry,
      {
        historyName: randomText(),
        historyTypeId: customHistoryTypeId.toString(),
        metadataDigestArg: randomSha256(),
      }
    )
  }

  return bulkActions.map((action) => {
    const actionRecord: BulkActionRecord = {
      actionType: action.actionType,
      data: {
        ...pick(action, ['contractAddress', 'tokenId']),
        historyMetadataHash,
        customHistoryId,
      },
    }

    switch (action.actionType) {
      case 'approveSRRByCommitment':
        actionRecord.data.commitment = commitment
        break
      case 'transferFromWithProvenance':
        Object.assign(actionRecord.data, {
          to,
          isIntermediary,
        })
        break
      default:
        throw Error(`unknown actionType ${action.actionType}`)
    }

    return actionRecord
  })
}

const createMerkleTreeFromBulkActions = (
  actions: ReadonlyArray<BulkActionRecord>
) => {
  let leafHashStrings
  leafHashStrings = actions.map((action) => {
    switch (action.actionType) {
      case 'approveSRRByCommitment':
        return hashApproveByCommitmentSRR(action.data)
      case 'transferFromWithProvenance':
        return hashTransferFromWithProvenanceSRR(action.data)
      default:
        throw Error(`unknown actionType ${action.actionType}`)
    }
  })

  const leafHashBuffers = leafHashStrings.map((srr) =>
    Buffer.from(srr.substring(2), 'hex')
  )
  return {
    tree: new MerkleTree(leafHashBuffers),
    hashStrings: leafHashStrings,
    hashBuffers: leafHashBuffers,
  }
}

const hashApproveByCommitmentSRR = (inputs) =>
  hashWithContractAddress(
    ['uint256', 'bytes32', 'string', 'uint256'],
    [
      inputs.tokenId,
      inputs.commitment,
      inputs.historyMetadataHash,
      inputs.customHistoryId,
    ],
    inputs.contractAddress
  )

const hashTransferFromWithProvenanceSRR = (inputs) =>
  hashWithContractAddress(
    ['address', 'uint256', 'string', 'uint256', 'bool'],
    [
      inputs.to,
      inputs.tokenId,
      inputs.historyMetadataHash,
      inputs.customHistoryId,
      inputs.isIntermediary,
    ],
    inputs.contractAddress
  )

const hashWithContractAddress = (
  inputTypes: any[],
  inputValues: any[],
  contractAddress: string
) => {
  if (contractAddress && contractAddress !== ZERO_ADDRESS) {
    inputTypes.push('address')
    inputValues.push(contractAddress)
  }
  return ethers.utils.solidityKeccak256(inputTypes, inputValues)
}

describe('Bulk (transfers)', () => {
  before(async () => {
    ;({ startrailRegistry, bulk, nameRegistry } = await loadFixture(
      fixtureDefault
    ))
    // For unit testing set the trusted forwarders and the administrator to
    // EOA wallets. This will allow transactions to be sent directly to the
    // BulkTransfer which is simpler for unit testing purposes.
    await nameRegistrySet(
      hre,
      ContractKeys.Administrator,
      administratorWallet.address
    )

    const bulkAdmin = bulk.connect(administratorWallet)
    await bulkAdmin.setTrustedForwarder(trustedForwarderWallet.address)

    const startrailRegistryAdmin =
      startrailRegistry.connect(administratorWallet)
    await startrailRegistryAdmin.setTrustedForwarder(
      trustedForwarderWallet.address
    )

    customHistoryTypeId = await startrailRegistryWriteCustomHistoryType(
      startrailRegistry,
      {
        historyTypeName: randomText(),
      }
    )
    ;({ walletAddress: luw1 } = await createLicensedUserWalletDirect(
      hre,
      {
        owners: [collectionOwnerWallet.address],
      },
      administratorWallet
    ))
    ;({ walletAddress: luw2 } = await createLicensedUserWalletDirect(
      hre,
      {
        owners: [collectionOwnerWallet.address],
      },
      administratorWallet
    ))
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
        .withArgs(merkleRoot, luw1)

      const bulkRecord = await bulk.batches(merkleRoot)
      expect(bulkRecord[0]).to.equal(true) // prepared
      expect(bulkRecord[1]).to.equal(luw1) // issuer
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
      const bulkTransferNotTrusted = bulk.connect(noAuthWallet)
      return expect(
        bulkTransferNotTrusted.prepareBatchFromLicensedUser(merkleRoot)
      ).to.eventually.be.rejectedWith(
        `Function can only be called through the trusted Forwarder`
      )
    })
  })

  describe('generalized bulk (collections)', () => {
    let collection, collectionOwnerLUWAddress
    let merkleRoot, bulkActions, tree, hashBuffers, hashStrings

    before(async () => {
      ;({ collection, collectionOwnerLUWAddress } = await setupCollection(
        hre,
        administratorWallet,
        collectionOwnerWallet,
        {
          collectionOwnerLUWAddress: luw1, // luw is collection owner
        }
      ))
    })
    for (const withCustomHistory of [true, false]) {
      beforeEach(async () => {
        const collectionCreateSRR = (params: {
          fromAddress: string
          issueOnAddress?: string
        }) => {
          const { fromAddress, issueOnAddress } = params
          return createSRROnCollection(
            fromAddress,
            collectionOwnerWallet,
            toChecksumAddress(collection.address),
            {
              to: issueOnAddress,
            }
          )
        }

        const luw1TokenId1 = await collectionCreateSRR({
          fromAddress: luw1,
        })
        const luw1TokenId2 = await collectionCreateSRR({
          fromAddress: luw1,
        })

        const luw2TokenId1 = await collectionCreateSRR({
          fromAddress: luw1,
          issueOnAddress: luw2,
        })
        const luw2TokenId2 = await collectionCreateSRR({
          fromAddress: luw1,
          issueOnAddress: luw2,
        })

        // create a new batch
        bulkActions = await generateBulkActionRecords(
          [
            {
              actionType: 'approveSRRByCommitment',
              contractAddress: toChecksumAddress(collection.address),
              tokenId: luw1TokenId1.toNumber(),
            },
            {
              actionType: 'approveSRRByCommitment',
              contractAddress: toChecksumAddress(collection.address),
              tokenId: luw2TokenId1.toNumber(),
            },
            {
              actionType: 'transferFromWithProvenance',
              contractAddress: toChecksumAddress(collection.address),
              tokenId: luw1TokenId2.toNumber(),
            },
            {
              actionType: 'transferFromWithProvenance',
              contractAddress: toChecksumAddress(collection.address),
              tokenId: luw2TokenId2.toNumber(),
            },
          ],
          withCustomHistory
        )

        const merkleTree = createMerkleTreeFromBulkActions(bulkActions)
        tree = merkleTree.tree
        merkleRoot = tree.getHexRoot()

        hashBuffers = merkleTree.hashBuffers
        hashStrings = merkleTree.hashStrings

        return prepareBatchFromLicensedUser(merkleRoot)
      })

      describe(`approveSRRByCommitment - withCustomHistory = ${withCustomHistory}`, () => {
        const approveSRRByCommitmentWithProof = (srrIdx) => {
          const srr = bulkActions[srrIdx]
          const srrLeafString = hashStrings[srrIdx]
          const merkleProof = tree.getHexProof(hashBuffers[srrIdx])

          expect(srr.actionType).to.equal('approveSRRByCommitment')

          return bulk[BULK_CONTRACT_METHOD_KEYS.approve](
            merkleProof,
            merkleRoot,
            srrLeafString,
            srr.data.tokenId,
            srr.data.commitment,
            srr.data.historyMetadataHash,
            srr.data.customHistoryId,
            srr.data.contractAddress
          )
        }

        it('success with valid leaf and proof', async () => {
          const srrIdx = 0
          const srr = bulkActions[srrIdx]
          const srrLeafString = hashStrings[srrIdx]
          expect(srr.actionType).to.equal('approveSRRByCommitment')

          const txRspPromise = await approveSRRByCommitmentWithProof(srrIdx)

          await expect(txRspPromise)
            .to.emit(bulk, BULK_CONTRACT_EVENT_KEYS.approve)
            .withArgs(
              merkleRoot,
              srr.data.contractAddress,
              srr.data.tokenId,
              srrLeafString
            )
          const bulkRecord = await bulk.batches(merkleRoot)
          expect(bulkRecord[1]).to.equal(luw1) // signer
          expect(bulkRecord[2]).to.equal(1) // processedCount
        })

        it('rejects if luw is not a srr owner', async () => {
          const srrIdx = 1
          await expect(
            approveSRRByCommitmentWithProof(srrIdx)
          ).to.eventually.be.rejectedWith(`NotSRROwner()`)
        })

        it('rejects if leaf already processed', async () => {
          // call create first time succeeds
          const srrIdx = 0
          await approveSRRByCommitmentWithProof(srrIdx)

          // now call create again for the same leaf
          return expect(
            approveSRRByCommitmentWithProof(srrIdx)
          ).to.eventually.be.rejectedWith(`SRR already processed.`)
        })

        it('rejects if merkle proof is wrong', async () => {
          // choose a leaf and get details and proof
          const srrIdx = 0
          const srr = bulkActions[srrIdx]
          const srrLeafString = hashStrings[srrIdx]
          const merkleProof = tree.getHexProof(hashBuffers[srrIdx])

          // swap a hash in the merkle proof to make it invalid
          merkleProof[0] = randomSha256()

          return expect(
            bulk[BULK_CONTRACT_METHOD_KEYS.approve](
              merkleProof,
              merkleRoot,
              srrLeafString,
              srr.data.tokenId,
              srr.data.commitment,
              srr.data.historyMetadataHash,
              srr.data.customHistoryId,
              srr.data.contractAddress
            )
          ).to.eventually.be.rejectedWith(`Merkle proof verification failed`)
        })

        it("rejects if leafHash doesn't match given details", async () => {
          // choose a leaf and get details and proof
          const srrIdx = 0
          const srr = bulkActions[srrIdx]
          const merkleProof = tree.getHexProof(hashBuffers[srrIdx])

          // create the SRR sending proof, root, leaf details BUT with leafHash that does not match
          const invalidSRRLeafString = randomSha256()

          return expect(
            bulk[BULK_CONTRACT_METHOD_KEYS.approve](
              merkleProof,
              merkleRoot,
              invalidSRRLeafString,
              srr.data.tokenId,
              srr.data.commitment,
              srr.data.historyMetadataHash,
              srr.data.customHistoryId,
              srr.data.contractAddress
            )
          ).to.eventually.be.rejectedWith(
            `leafHash does not match the approveSRRByCommitment details`
          )
        })

        it("rejects if batch doesn't exist", () => {
          return expect(
            bulk[BULK_CONTRACT_METHOD_KEYS.approve](
              [],
              randomSha256(), // merkleRoot will not exist
              randomSha256(),
              randomTokenId().toNumber(),
              randomSha256(),
              randomSha256(),
              withCustomHistory ? randomTokenId() : 0,
              randomAddress()
            )
          ).to.eventually.be.rejectedWith(
            `Batch doesn't exist for the given merkle root`
          )
        })
      })

      describe(`transferFromWithProvenance - withCustomHistory = ${withCustomHistory}`, () => {
        const transferFromWithProvenanceWithProof = (srrIdx) => {
          const srr = bulkActions[srrIdx]
          const srrLeafString = hashStrings[srrIdx]
          const merkleProof = tree.getHexProof(hashBuffers[srrIdx])

          expect(srr.actionType).to.equal('transferFromWithProvenance')

          return bulk[BULK_CONTRACT_METHOD_KEYS.transfer](
            merkleProof,
            merkleRoot,
            srrLeafString,
            srr.data.to,
            srr.data.tokenId,
            srr.data.historyMetadataHash,
            srr.data.customHistoryId,
            srr.data.isIntermediary,
            srr.data.contractAddress
          )
        }
        it('success with valid leaf and proof', async () => {
          // choose a leaf and get details and proof
          const srrIdx = 2
          const srr = bulkActions[srrIdx]
          const srrLeafString = hashStrings[srrIdx]

          expect(srr.actionType).to.equal('transferFromWithProvenance')

          const txRspPromise = transferFromWithProvenanceWithProof(srrIdx)

          await expect(txRspPromise)
            .to.emit(bulk, BULK_CONTRACT_EVENT_KEYS.transfer)
            .withArgs(
              merkleRoot,
              toChecksumAddress(srr.data.contractAddress),
              srr.data.tokenId,
              srrLeafString
            )
          const bulkRecord = await bulk.batches(merkleRoot)
          expect(bulkRecord[1]).to.equal(luw1) // signer
          expect(bulkRecord[2]).to.equal(1) // processedCount
        })

        it('rejects if luw is not a srr owner', async () => {
          const srrIdx = 3
          await expect(
            transferFromWithProvenanceWithProof(srrIdx)
          ).to.eventually.be.rejectedWith(`NotSRROwner()`)
        })

        it('rejects if leaf already processed', async () => {
          // call create first time succeeds
          const srrIdx = 2
          await transferFromWithProvenanceWithProof(srrIdx)

          // now call create again for the same leaf
          return expect(
            transferFromWithProvenanceWithProof(srrIdx)
          ).to.eventually.be.rejectedWith(`SRR already processed.`)
        })
      })
    }
  })

  describe('generalized bulk (StartrailRegistry)', () => {
    let merkleRoot, bulkActions, tree, hashBuffers, hashStrings
    let merkleRootWithCustomHistoryId,
      bulkActionsWithCustomHistoryId,
      treeWithCustomHistoryId,
      hashBuffersWithCustomHistoryId,
      hashStringsWithCustomHistoryId

    const createSRROnStartrailRegistry = async (senderAddress: string) => {
      const txReceipt = await sendWithEIP2771(
        startrailRegistry,
        `createSRRFromLicensedUser(bool,address,string,bool,address,address,uint16)`,
        [
          randomBoolean(), // isPrimaryIssuer
          randomAddress(), // artistAddress
          await randomCID(), // metadataCID
          randomBoolean(), // lockExternalTransfer
          ZERO_ADDRESS, // to
          randomAddress(), // royaltyRecipient
          100, // royaltyBasisPoints
        ],
        senderAddress,
        trustedForwarderWallet
      ).then((txRsp) => txRsp.wait(0))

      const eventArgs = decodeEventLog(
        startrailRegistry,
        'CreateSRR(uint256,(bool,address,address),string,bool)',
        txReceipt.logs[1]
      )

      return eventArgs[0].toNumber() // tokenId
    }

    beforeEach(async () => {
      // create srrs(without customHistoryId)
      const luw1TokenId1 = await createSRROnStartrailRegistry(luw1) //  luw1 is the srr owner
      const luw1TokenId2 = await createSRROnStartrailRegistry(luw1) // luw1 is the srr owner
      const luw2TokenId1 = await createSRROnStartrailRegistry(luw2) //  luw2 is the srr owner
      const luw2TokenId2 = await createSRROnStartrailRegistry(luw2) // luw2 is the srr owner

      // create a new batch
      bulkActions = await generateBulkActionRecords(
        [
          { actionType: 'approveSRRByCommitment', tokenId: luw1TokenId1 },
          { actionType: 'approveSRRByCommitment', tokenId: luw2TokenId1 },
          { actionType: 'transferFromWithProvenance', tokenId: luw1TokenId2 },
          { actionType: 'transferFromWithProvenance', tokenId: luw2TokenId2 },
        ],
        false
      )
      const merkleTree = createMerkleTreeFromBulkActions(bulkActions)
      tree = merkleTree.tree
      merkleRoot = tree.getHexRoot()

      hashBuffers = merkleTree.hashBuffers
      hashStrings = merkleTree.hashStrings
      await prepareBatchFromLicensedUser(merkleRoot)

      // create srrs(with customHistoryId)
      const luw1TokenId1WithCustomHistoryId =
        await createSRROnStartrailRegistry(luw1) // luw1 is the srr owner
      const luw1TokenId2WithCustomHistoryId =
        await createSRROnStartrailRegistry(luw1) // luw1 is the srr owner
      const luw2TokenId1WithCustomHistoryId =
        await createSRROnStartrailRegistry(luw2) // luw2 is the srr owner
      const luw2TokenId2WithCustomHistoryId =
        await createSRROnStartrailRegistry(luw2) // luw2 is the srr owner

      // create a new batch
      bulkActionsWithCustomHistoryId = await generateBulkActionRecords([
        {
          actionType: 'approveSRRByCommitment',
          tokenId: luw1TokenId1WithCustomHistoryId,
        },
        {
          actionType: 'approveSRRByCommitment',
          tokenId: luw2TokenId1WithCustomHistoryId,
        },
        {
          actionType: 'transferFromWithProvenance',
          tokenId: luw1TokenId2WithCustomHistoryId,
        },
        {
          actionType: 'transferFromWithProvenance',
          tokenId: luw2TokenId2WithCustomHistoryId,
        },
      ])

      const merkleTreeWithCustomHistoryIds = createMerkleTreeFromBulkActions(
        bulkActionsWithCustomHistoryId
      )
      treeWithCustomHistoryId = merkleTreeWithCustomHistoryIds.tree
      merkleRootWithCustomHistoryId = treeWithCustomHistoryId.getHexRoot()

      hashBuffersWithCustomHistoryId =
        merkleTreeWithCustomHistoryIds.hashBuffers
      hashStringsWithCustomHistoryId =
        merkleTreeWithCustomHistoryIds.hashStrings

      return prepareBatchFromLicensedUser(merkleRootWithCustomHistoryId)
    })

    describe('approveSRRByCommitment (StartrailRegistry)', () => {
      const approveSRRByCommitmentWithProof = (srrIdx) => {
        const srr = bulkActions[srrIdx]
        const srrLeafString = hashStrings[srrIdx]
        const merkleProof = tree.getHexProof(hashBuffers[srrIdx])

        expect(srr.actionType).to.equal('approveSRRByCommitment')

        return bulk[BULK_CONTRACT_METHOD_KEYS.approve](
          merkleProof,
          merkleRoot,
          srrLeafString,
          srr.data.tokenId,
          srr.data.commitment,
          srr.data.historyMetadataHash,
          0,
          ZERO_ADDRESS
        )
      }

      const approveSRRByCommitmentWithProofWithCustomHistory = (srrIdx) => {
        const srr = bulkActionsWithCustomHistoryId[srrIdx]
        const srrLeafString = hashStringsWithCustomHistoryId[srrIdx]
        const merkleProof = treeWithCustomHistoryId.getHexProof(
          hashBuffersWithCustomHistoryId[srrIdx]
        )

        expect(srr.actionType).to.equal('approveSRRByCommitment')

        return bulk[BULK_CONTRACT_METHOD_KEYS.approve](
          merkleProof,
          merkleRootWithCustomHistoryId,
          srrLeafString,
          srr.data.tokenId,
          srr.data.commitment,
          srr.data.historyMetadataHash,
          srr.data.customHistoryId,
          ZERO_ADDRESS
        )
      }

      it('success with valid leaf and proof', async () => {
        // choose a leaf and get details and proof
        const srrIdx = 0
        const srr = bulkActions[srrIdx]
        const srrLeafString = hashStrings[srrIdx]
        const txRspPromise = approveSRRByCommitmentWithProof(srrIdx)

        await expect(txRspPromise)
          .to.emit(bulk, BULK_CONTRACT_EVENT_KEYS.approve)
          .withArgs(merkleRoot, ZERO_ADDRESS, srr.data.tokenId, srrLeafString)
        const bulkRecord = await bulk.batches(merkleRoot)
        expect(bulkRecord[1]).to.equal(luw1) // signer
        expect(bulkRecord[2]).to.equal(1) // processedCount
      })

      it('success with valid leaf and proof (with customHistoryId)', async () => {
        // choose a leaf and get details and proof
        const srrIdx = 0
        const srr = bulkActionsWithCustomHistoryId[srrIdx]
        const srrLeafString = hashStringsWithCustomHistoryId[srrIdx]

        expect(srr.actionType).to.equal('approveSRRByCommitment')

        const txRspPromise =
          approveSRRByCommitmentWithProofWithCustomHistory(srrIdx)

        await expect(txRspPromise)
          .to.emit(bulk, BULK_CONTRACT_EVENT_KEYS.approve)
          .withArgs(
            merkleRootWithCustomHistoryId,
            ZERO_ADDRESS,
            srr.data.tokenId,
            srrLeafString
          )
        const bulkRecord = await bulk.batches(merkleRootWithCustomHistoryId)
        expect(bulkRecord[1]).to.equal(luw1) // signer
        expect(bulkRecord[2]).to.equal(1) // processedCount
      })

      it('rejects if luw is not a srr owner', async () => {
        const srrIdx = 1
        await expect(
          approveSRRByCommitmentWithProof(srrIdx)
        ).to.eventually.be.rejectedWith(`This is not a SRR owner`)
      })

      it('rejects if leaf already processed', async () => {
        // call create first time succeeds
        const leafIdx = 0
        await approveSRRByCommitmentWithProof(leafIdx)

        // now call create again for the same leaf
        return expect(
          approveSRRByCommitmentWithProof(leafIdx)
        ).to.eventually.be.rejectedWith(`SRR already processed.`)
      })

      it('rejects if merkle proof is wrong', async () => {
        // choose a leaf and get details and proof
        const srrIdx = 0
        const srr = bulkActions[srrIdx]
        const srrLeafString = hashStrings[srrIdx]
        const merkleProof = tree.getHexProof(hashBuffers[srrIdx])

        // swap a hash in the merkle proof to make it invalid
        merkleProof[0] = randomSha256()

        return expect(
          bulk[BULK_CONTRACT_METHOD_KEYS.approve](
            merkleProof,
            merkleRoot,
            srrLeafString,
            srr.data.tokenId,
            srr.data.commitment,
            srr.data.historyMetadataHash,
            0,
            ZERO_ADDRESS
          )
        ).to.eventually.be.rejectedWith(`Merkle proof verification failed`)
      })

      it('rejects if merkle proof is wrong (with customHistoryId)', async () => {
        // choose a leaf and get details and proof
        const srrIdx = 0
        const srr = bulkActionsWithCustomHistoryId[srrIdx]
        const srrLeafString = hashStringsWithCustomHistoryId[srrIdx]
        const merkleProof = treeWithCustomHistoryId.getHexProof(
          hashBuffersWithCustomHistoryId[srrIdx]
        )

        // swap a hash in the merkle proof to make it invalid
        merkleProof[0] = randomSha256()

        return expect(
          bulk[BULK_CONTRACT_METHOD_KEYS.approve](
            merkleProof,
            merkleRootWithCustomHistoryId,
            srrLeafString,
            srr.data.tokenId,
            srr.data.commitment,
            srr.data.historyMetadataHash,
            srr.data.customHistoryId,
            ZERO_ADDRESS
          )
        ).to.eventually.be.rejectedWith(`Merkle proof verification failed`)
      })

      it("rejects if leafHash doesn't match given details", async () => {
        // choose a leaf and get details and proof
        const srrIdx = 0
        const srr = bulkActions[srrIdx]
        const merkleProof = tree.getHexProof(hashBuffers[srrIdx])

        // create the SRR sending proof, root, leaf details BUT with leafHash that does not match
        const invalidSRRLeafString = randomSha256()

        return expect(
          bulk[BULK_CONTRACT_METHOD_KEYS.approve](
            merkleProof,
            merkleRoot,
            invalidSRRLeafString,
            srr.data.tokenId,
            srr.data.commitment,
            srr.data.historyMetadataHash,
            0,
            ZERO_ADDRESS
          )
        ).to.eventually.be.rejectedWith(
          `leafHash does not match the approveSRRByCommitment details`
        )
      })

      it("rejects if leafHash doesn't match given details (with customHistoryId)", async () => {
        // choose a leaf and get details and proof
        const srrIdx = 0
        const srr = bulkActionsWithCustomHistoryId[srrIdx]
        const merkleProof = treeWithCustomHistoryId.getHexProof(
          hashBuffersWithCustomHistoryId[srrIdx]
        )

        // create the SRR sending proof, root, leaf details BUT with leafHash that does not match
        const invalidSRRLeafString = randomSha256()

        return expect(
          bulk[BULK_CONTRACT_METHOD_KEYS.approve](
            merkleProof,
            merkleRootWithCustomHistoryId,
            invalidSRRLeafString,
            srr.data.tokenId,
            srr.data.commitment,
            srr.data.historyMetadataHash,
            srr.data.customHistoryId,
            ZERO_ADDRESS
          )
        ).to.eventually.be.rejectedWith(
          `leafHash does not match the approveSRRByCommitment details`
        )
      })

      it("rejects if batch doesn't exist", () =>
        expect(
          bulk[BULK_CONTRACT_METHOD_KEYS.approve](
            [],
            randomSha256(), // merkleRoot will not exist
            randomSha256(),
            randomTokenId().toNumber(),
            randomSha256(),
            randomSha256(),
            0,
            ZERO_ADDRESS
          )
        ).to.eventually.be.rejectedWith(
          `Batch doesn't exist for the given merkle root`
        ))
    })

    describe('transferFromWithProvenance (StartrailRegistry)', () => {
      const transferFromWithProvenanceWithProof = (srrIdx) => {
        const srr = bulkActions[srrIdx]
        const srrLeafString = hashStrings[srrIdx]
        const merkleProof = tree.getHexProof(hashBuffers[srrIdx])

        expect(srr.actionType).to.equal('transferFromWithProvenance')

        return bulk[BULK_CONTRACT_METHOD_KEYS.transfer](
          merkleProof,
          merkleRoot,
          srrLeafString,
          srr.data.to,
          srr.data.tokenId,
          srr.data.historyMetadataHash,
          0,
          srr.data.isIntermediary,
          ZERO_ADDRESS
        )
      }

      const transferFromWithProvenanceWithProofWithCustomHistory = (srrIdx) => {
        const srr = bulkActionsWithCustomHistoryId[srrIdx]
        const srrLeafString = hashStringsWithCustomHistoryId[srrIdx]
        const merkleProof = treeWithCustomHistoryId.getHexProof(
          hashBuffersWithCustomHistoryId[srrIdx]
        )

        expect(srr.actionType).to.equal('transferFromWithProvenance')

        return bulk[BULK_CONTRACT_METHOD_KEYS.transfer](
          merkleProof,
          merkleRootWithCustomHistoryId,
          srrLeafString,
          srr.data.to,
          srr.data.tokenId,
          srr.data.historyMetadataHash,
          srr.data.customHistoryId,
          srr.data.isIntermediary,
          ZERO_ADDRESS
        )
      }

      it('success with valid leaf and proof', async () => {
        // choose a leaf and get details and proof
        const srrIdx = 2
        const srr = bulkActions[srrIdx]
        const srrLeafString = hashStrings[srrIdx]

        const txRspPromise = transferFromWithProvenanceWithProof(srrIdx)

        await expect(txRspPromise)
          .to.emit(bulk, BULK_CONTRACT_EVENT_KEYS.transfer)
          .withArgs(merkleRoot, ZERO_ADDRESS, srr.data.tokenId, srrLeafString)
        const bulkRecord = await bulk.batches(merkleRoot)
        expect(bulkRecord[1]).to.equal(luw1) // signer
        expect(bulkRecord[2]).to.equal(1) // processedCount
      })

      it('success with valid leaf and proof (with customHistoryId)', async () => {
        // choose a leaf and get details and proof
        const srrIdx = 2
        const srr = bulkActionsWithCustomHistoryId[srrIdx]
        const srrLeafString = hashStringsWithCustomHistoryId[srrIdx]

        const txRspPromise =
          transferFromWithProvenanceWithProofWithCustomHistory(srrIdx)

        await expect(txRspPromise)
          .to.emit(bulk, BULK_CONTRACT_EVENT_KEYS.transfer)
          .withArgs(
            merkleRootWithCustomHistoryId,
            ZERO_ADDRESS,
            srr.data.tokenId,
            srrLeafString
          )
        const bulkRecord = await bulk.batches(merkleRootWithCustomHistoryId)
        expect(bulkRecord[1]).to.equal(luw1) // signer
        expect(bulkRecord[2]).to.equal(1) // processedCount
      })

      it('rejects if luw is not a srr owner', async () => {
        const srrIdx = 3
        await expect(
          transferFromWithProvenanceWithProof(srrIdx)
        ).to.eventually.be.rejectedWith(`This is not a SRR owner`)
      })

      it('rejects if luw is not a srr owner (with customHistoryId)', async () => {
        const srrIdx = 3
        await expect(
          transferFromWithProvenanceWithProofWithCustomHistory(srrIdx)
        ).to.eventually.be.rejectedWith(`This is not a SRR owner`)
      })

      it('rejects if leaf already processed', async () => {
        // call create first time succeeds
        const srrIdx = 2
        await transferFromWithProvenanceWithProof(srrIdx)

        // now call create again for the same leaf
        return expect(
          transferFromWithProvenanceWithProof(srrIdx)
        ).to.eventually.be.rejectedWith(`SRR already processed.`)
      })
    })
  })
})
