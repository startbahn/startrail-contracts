import { expect, use } from 'chai'
import chaiAsPromised from 'chai-as-promised'
import { BigNumber } from 'ethers'
import hre, { ethers } from 'hardhat'
import { ContractKeys } from '../startrail-common-js/contracts/types'
import { zeroBytes32 } from '../startrail-common-js/ethereum/utils'
import { Logger } from '../startrail-common-js/logger'
import {
  CollectionSetLockExternalTransferRecord,
  StartrailRegistryApproveSRRByCommitmentV2Record,
  StartrailRegistryCancelSRRCommitmentRecord,
} from '../startrail-common-js/meta-tx/eip712-message-types'
import { CollectionApproveSRRByCommitmentV2Record } from '../startrail-common-js/meta-tx/eip712-message-types/collection.types'
import { MetaTxRequestType } from '../startrail-common-js/meta-tx/meta-tx-request-registry'

import { Wallet } from '@ethersproject/wallet'
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers'

import { CollectionProxyFeaturesAggregate } from '../typechain-types'
import { getWallets } from '../utils/hardhat-helpers'
import { nameRegistrySet } from '../utils/name-registry-set'
import {
  assertExecutionSuccessEmitted,
  assertRevert,
} from './helpers/assertions'
import { setupCollection } from './helpers/collections'
import { fixtureDefault } from './helpers/fixtures'
import {
  createLicensedUserWalletDirect,
  createSRRRequest,
  encodeSignExecute,
  randomSha256,
  randomText,
} from './helpers/utils'

use(chaiAsPromised)

Logger.setSilent(true)

const wallets = getWallets(hre)
const adminEOAWallet = wallets[0]
const handlerEOAWallet = wallets[1]
const artistEOAWallet = wallets[2]
const outsiderEOAWallet = wallets[3]
const anEOAOwnerWallet = wallets[4]

const metadataDigest = randomSha256()

// Contract handles
let startrailRegistry

describe('MetaTxForwarder', () => {
  before(async function () {
    ;({ startrailRegistry } = await loadFixture(fixtureDefault))
    // For unit testing set the administrator to an EOA wallet.
    // This will allow transactions to be sent directly.
    await nameRegistrySet(
      hre,
      ContractKeys.Administrator,
      adminEOAWallet.address,
      false // don't logMsg (to console)
    )
  })

  describe('executeTransactionLUW', () => {
    describe('wallet checks', () => {
      interface ExecuteTxTestCase {
        name: string
        threshold: number
        ownerAddresses: string[]
        passSigners: Wallet[]
        wrongSigners: Wallet[]
        notEnoughSigners?: Wallet[]
        luAddress?: string
        txRequestData?: Record<string, number | boolean | string>
      }

      //
      // Dynamically generate test case functions from these sets of
      // test input data
      //

      const EXEC_TEST_CASES: ExecuteTxTestCase[] = [
        {
          name: '1 of 1',
          threshold: 1,
          ownerAddresses: [handlerEOAWallet.address],
          passSigners: [handlerEOAWallet],
          wrongSigners: [artistEOAWallet],
        },
        {
          name: '1 of 2',
          threshold: 1,
          ownerAddresses: [handlerEOAWallet.address, artistEOAWallet.address],
          passSigners: [handlerEOAWallet],
          wrongSigners: [adminEOAWallet],
          notEnoughSigners: [],
        },
        {
          name: '2 of 2',
          threshold: 2,
          ownerAddresses: [handlerEOAWallet.address, artistEOAWallet.address],
          passSigners: [handlerEOAWallet, artistEOAWallet],
          wrongSigners: [adminEOAWallet, artistEOAWallet],
          notEnoughSigners: [artistEOAWallet],
        },
        {
          name: '2 of 3',
          threshold: 2,
          ownerAddresses: [
            handlerEOAWallet.address,
            artistEOAWallet.address,
            adminEOAWallet.address,
          ],
          passSigners: [artistEOAWallet, handlerEOAWallet],
          wrongSigners: [outsiderEOAWallet, artistEOAWallet],
          notEnoughSigners: [handlerEOAWallet],
        },
        {
          name: '3 of 3',
          threshold: 3,
          ownerAddresses: [
            handlerEOAWallet.address,
            artistEOAWallet.address,
            adminEOAWallet.address,
          ],
          // shuffle the order to test they get sorted properly:
          passSigners: [adminEOAWallet, artistEOAWallet, handlerEOAWallet],
          wrongSigners: [handlerEOAWallet, outsiderEOAWallet, artistEOAWallet],
          notEnoughSigners: [handlerEOAWallet, adminEOAWallet],
        },
      ]

      before(async () => {
        for (const testCase of EXEC_TEST_CASES) {
          const { walletAddress } = await createLicensedUserWalletDirect(
            hre,
            {
              owners: testCase.ownerAddresses,
              threshold: testCase.threshold,
            },
            adminEOAWallet
          )
          testCase.luAddress = walletAddress
        }
      })

      EXEC_TEST_CASES.forEach(async (testCase) => {
        describe(`${testCase.name} wallet`, () => {
          const requestType =
            MetaTxRequestType.StartrailRegistryCreateSRRFromLicensedUserWithIPFSAndRoyalty

          beforeEach(async () => {
            // Execution request props
            testCase.txRequestData = await createSRRRequest()
          })

          it(`should execute transaction`, async () => {
            const txRsp2 = await encodeSignExecute({
              requestTypeKey: requestType,
              fromAddress: testCase.luAddress,
              requestData: testCase.txRequestData,
              signerWallets: testCase.passSigners,
            })
            await assertExecutionSuccessEmitted(txRsp2)
            // await logGasUsedFromTxRspPromise(txRsp2)
          })

          it(`should reject execution when signature not signed by owner`, () =>
            // Sign with at least one Wallet who is NOT the owner of luAddress
            assertRevert(
              encodeSignExecute({
                requestTypeKey: requestType,
                fromAddress: testCase.luAddress,
                requestData: testCase.txRequestData,
                signerWallets: testCase.wrongSigners, // wrong signers
              }),
              `Signer in signatures is not an owner of this wallet`
            ))

          if (testCase.notEnoughSigners) {
            it(`should reject execution when signature count below threshold`, () =>
              // Signing with a wallet count that is below the threshold
              assertRevert(
                encodeSignExecute({
                  requestTypeKey: requestType,
                  fromAddress: testCase.luAddress,
                  requestData: testCase.txRequestData,
                  signerWallets: testCase.notEnoughSigners, // UNDER THRESHOLD
                }),
                `Signatures data too short`
              ))
          }
        })
      })

      it(`should execute transaction with calldata (data field) [STARTRAIL-737]`, async () => {
        // Setup an LUW and issue a token
        const { walletAddress: fromAddress } =
          await createLicensedUserWalletDirect(
            hre,
            {
              owners: [handlerEOAWallet.address],
            },
            adminEOAWallet
          )
        const issueRequest = await createSRRRequest()
        const tokenId = await encodeSignExecute({
          requestTypeKey:
            MetaTxRequestType.StartrailRegistryCreateSRRFromLicensedUserWithIPFSAndRoyalty,
          fromAddress,
          requestData: issueRequest,
          signerWallets: [handlerEOAWallet],
        })
          .then((txRsp) => txRsp.wait())
          .then((txReceipt) =>
            ethers.BigNumber.from(txReceipt.logs[0].topics[3])
          )

        const requestType =
          MetaTxRequestType.StartrailRegistryApproveSRRByCommitmentV2
        const approveRequestData = {
          tokenId: tokenId.toString(),
          commitment: randomSha256(), // bytes32
          historyMetadataHash: metadataDigest, // string
        }

        const txRsp = await encodeSignExecute({
          requestTypeKey: requestType,
          fromAddress,
          requestData: approveRequestData,
          signerWallets: [handlerEOAWallet],
        })

        await assertExecutionSuccessEmitted(txRsp)
      })
    })

    describe('meta tx request types with destination passed in (collections)', () => {
      let collectionOwnerLUWAddress: string
      let collectionOwnerSigner = handlerEOAWallet
      let collection: CollectionProxyFeaturesAggregate

      let tokenId: BigNumber

      before(async () => {
        ;({ collectionOwnerLUWAddress, collection, tokenId } =
          await setupCollection(hre, adminEOAWallet, handlerEOAWallet))
      })

      it('should execute with a valid destination contract', async () => {
        expect(await collection.getLockExternalTransfer(tokenId)).to.be.false

        // build request with the destination
        const requestData: CollectionSetLockExternalTransferRecord = {
          destination: collection.address,
          flag: true,
          tokenId,
        }
        await encodeSignExecute({
          requestTypeKey: MetaTxRequestType.CollectionSetLockExternalTransfer,
          fromAddress: collectionOwnerLUWAddress,
          requestData,
          signerWallets: [collectionOwnerSigner],
        }).then((txRsp) => txRsp.wait())

        expect(await collection.getLockExternalTransfer(tokenId)).to.be.true
      })
    })
  })

  describe('executeTransactionEOA', () => {
    let requestType: MetaTxRequestType

    let eoaAddress: string
    let fromAddress: string
    let tokenId: BigNumber
    let approveRequestData: StartrailRegistryApproveSRRByCommitmentV2Record
    let reveal: string

    beforeEach(async () => {
      // createSRR from handerWallet
      const { walletAddress } = await createLicensedUserWalletDirect(
        hre,
        {
          owners: [handlerEOAWallet.address],
        },
        adminEOAWallet
      )
      fromAddress = walletAddress
      const issueRequest = await createSRRRequest()
      tokenId = await encodeSignExecute({
        requestTypeKey:
          MetaTxRequestType.StartrailRegistryCreateSRRFromLicensedUserWithIPFSAndRoyalty,
        fromAddress: fromAddress,
        requestData: issueRequest,
        signerWallets: [handlerEOAWallet],
      })
        .then((txRsp) => txRsp.wait())
        .then((txReceipt) => ethers.BigNumber.from(txReceipt.logs[0].topics[3]))

      // approveSRRByCommitment from handlerWallet
      requestType = MetaTxRequestType.StartrailRegistryApproveSRRByCommitmentV2
      const target = randomText() + '@gmail.com'
      const targetBytes = ethers.utils.toUtf8Bytes(target)
      reveal = ethers.utils.keccak256(targetBytes)

      const commitment = ethers.utils.keccak256(reveal)

      approveRequestData = {
        tokenId: tokenId.toString(),
        commitment: commitment, // bytes32
        historyMetadataHash: metadataDigest, // string
      }

      const txRsp = await encodeSignExecute({
        requestTypeKey: requestType,
        fromAddress,
        requestData: approveRequestData,
        signerWallets: [handlerEOAWallet],
      })
      await assertExecutionSuccessEmitted(txRsp)

      // transferSRRByReveal from LU(handlerWallet) to EOA
      eoaAddress = artistEOAWallet.address
      await startrailRegistry[
        'transferSRRByReveal(address,bytes32,uint256,bool)'
      ](eoaAddress, reveal, tokenId, false).then((txRsp) => txRsp.wait(0))
      expect(await startrailRegistry.ownerOf(tokenId)).to.equal(eoaAddress)
    })

    it(`approveSRRByCommitment from EOA (requiresDataField=true)`, async () => {
      const { commitment: commitmentBefore } =
        await startrailRegistry.getSRRCommitment(tokenId)
      expect(commitmentBefore).to.equal(zeroBytes32)

      const txRsp = await encodeSignExecute({
        requestTypeKey: requestType,
        fromAddress: eoaAddress,
        requestData: approveRequestData,
        signerWallets: [artistEOAWallet],
        fromEOA: true,
      })
      await assertExecutionSuccessEmitted(txRsp)

      const { commitment: commitmentAfter } =
        await startrailRegistry.getSRRCommitment(tokenId)
      expect(commitmentAfter).to.equal(approveRequestData.commitment)
    })

    it(`cancelSRRCommitment from EOA (requiresDataField=false)`, async () => {
      // approveSRRByCommitment from EOA
      const approveTxRsp = await encodeSignExecute({
        requestTypeKey: requestType,
        fromAddress: eoaAddress,
        requestData: approveRequestData,
        signerWallets: [artistEOAWallet],
        fromEOA: true,
      })
      await assertExecutionSuccessEmitted(approveTxRsp)

      const { commitment: commitmentAfterApprove } =
        await startrailRegistry.getSRRCommitment(tokenId)
      expect(commitmentAfterApprove).to.equal(approveRequestData.commitment)

      // CancelSRRCommitment from EOA
      const cancelApproveTxRsp = await encodeSignExecute({
        requestTypeKey: MetaTxRequestType.StartrailRegistryCancelSRRCommitment,
        fromAddress: eoaAddress,
        requestData: {
          tokenId: tokenId.toString(),
        } as StartrailRegistryCancelSRRCommitmentRecord,
        signerWallets: [artistEOAWallet],
        fromEOA: true,
      })
      await assertExecutionSuccessEmitted(cancelApproveTxRsp)

      const { commitment: commitmentAfterCancel } =
        await startrailRegistry.getSRRCommitment(tokenId)
      expect(commitmentAfterCancel).to.equal(zeroBytes32)
    })

    it(`should reject execution when signature not signed by owner`, () =>
      assertRevert(
        encodeSignExecute({
          requestTypeKey: requestType,
          fromAddress: fromAddress,
          requestData: approveRequestData,
          signerWallets: [outsiderEOAWallet],
          fromEOA: true,
        }),
        `Signer verification failed`
      ))

    it(`should reject execution if signer uses invalid nonce`, () =>
      assertRevert(
        encodeSignExecute({
          requestTypeKey: requestType,
          fromAddress: fromAddress,
          requestData: approveRequestData,
          signerWallets: [artistEOAWallet],
          fromEOA: true,
          invalidNonce: true,
        }),
        'Invalid nonce'
      ))

    describe('meta tx request type with destination passed in (collections)', () => {
      const aReveal = ethers.utils.id('owner_secret')
      const aCommitment = ethers.utils.keccak256(aReveal)
      const aHistoryHash = ethers.utils.id('history_hash')

      let collectionOwnerLUWAddress: string
      let collection: CollectionProxyFeaturesAggregate
      let collectionTokenId: BigNumber

      let eoaOwnerWallet = anEOAOwnerWallet
      let eoaOwnerAddress = eoaOwnerWallet.address

      before(async () => {
        ;({
          collection,
          collectionOwnerLUWAddress,
          tokenId: collectionTokenId,
        } = await setupCollection(hre, adminEOAWallet, handlerEOAWallet))

        // transfer ownership of new token on new collection to an EOA owner
        // so we can use that new owner in the tests
        const approveTxRsp = await encodeSignExecute({
          requestTypeKey: MetaTxRequestType.CollectionApproveSRRByCommitmentV2,
          fromAddress: collectionOwnerLUWAddress,
          requestData: {
            destination: collection.address,
            tokenId: collectionTokenId.toString(),
            commitment: aCommitment,
            historyMetadataHash: aHistoryHash,
          },
          signerWallets: [handlerEOAWallet],
        })
        await assertExecutionSuccessEmitted(approveTxRsp)
        await collection.transferSRRByReveal(
          eoaOwnerAddress,
          aReveal,
          collectionTokenId,
          false
        )
        expect(await collection.ownerOf(collectionTokenId)).to.equal(
          eoaOwnerAddress
        )
      })

      it('should execute with a valid destination contract', async () => {
        const approveTxRsp = await encodeSignExecute({
          requestTypeKey: MetaTxRequestType.CollectionApproveSRRByCommitmentV2,
          fromEOA: true,
          fromAddress: eoaOwnerAddress,
          requestData: {
            destination: collection.address,
            tokenId: collectionTokenId.toString(),
            commitment: aCommitment,
            historyMetadataHash: aHistoryHash,
          } as CollectionApproveSRRByCommitmentV2Record,
          signerWallets: [eoaOwnerWallet],
        })
        await assertExecutionSuccessEmitted(approveTxRsp)
        expect(await collection.getSRRCommitment(collectionTokenId)).deep.equal(
          [aCommitment, aHistoryHash, BigNumber.from(`0`)]
        )
      })
    })
  })
})
