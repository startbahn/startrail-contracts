import hre from 'hardhat'
import _ from 'lodash'
import { ethers, BigNumber } from 'ethers'
import { assert, expect, use } from 'chai'
import chaiAsPromised from 'chai-as-promised'
import { solidity } from 'ethereum-waffle'
import {
  TransactionReceipt,
  TransactionResponse,
} from '@ethersproject/abstract-provider'

import { ContractKeys } from '../startrail-common-js/contracts/types'
import { MetaTxRequestType } from '../startrail-common-js/meta-tx/types'
import {
  randomAddress,
  randomTokenId,
  randomBoolean,
} from '../startrail-common-js/test-helpers/test-utils'
import defaults from 'lodash/defaults'
import { assertEqualBigNumberArrays, assertRevert } from './helpers/assertions'
import { fixtureDefault } from './helpers/fixtures'
import {
  randomSha256,
  randomText,
  sendWithEIP2771,
  ZERO_ADDRESS,
} from './helpers/utils'

import chainIds from '../utils/chain-ids'
import {
  decodeEventLog,
  getWallets,
  suppressLoggerWarnings,
} from '../utils/hardhat-helpers'
import { lumCreateWallet } from '../utils/lum-create-wallet'
import { metaTxSend } from '../utils/meta-tx-send'
import { nameRegistrySet } from '../utils/name-registry-set'
import { signMetaTx } from '../utils/opensea-helpers'
import { Administrator } from '../startrail-common-js/contracts/administrator'

use(chaiAsPromised)
use(solidity)

suppressLoggerWarnings(ethers)
suppressLoggerWarnings(hre.ethers)

const SCHEMA_URI_PREFIX =
  process.env.SCHEMA_URI_PREFIX || 'https://api.startrail.io/api/v1/metadata/'

const emptyValue =
  '0x0000000000000000000000000000000000000000000000000000000000000000'

// Signing wallets
const wallets = getWallets(hre)
const administratorWallet = wallets[0]
const noAuthWallet = wallets[1]
const handlerWallet = wallets[2]
const openSeaProxyWallet = wallets[4]
const sellerWallet = wallets[5]
const marketplaceWallet = wallets[6]
const bulkTransferWallet = wallets[7]
const bulkIssueWallet = wallets[8]
const trustedForwarderWallet = wallets[9]

// Shared test data
const isPrimaryIssuer = true
const recipient = randomAddress()

let metadataDigest = ''
let historyMetadataDigest = ''
let customHistoryName = ''
let customHistoryTypeName = ''

// Contract handles
let startrailRegistry: ethers.Contract
let metaTxForwarder: ethers.Contract
let nameRegistry: ethers.Contract
let administrator: Administrator
let luwAddress = null
let artistAddress = null
let anotherArtistAddress = null

/*
 *
 * Transaction sending helpers
 *
 */

/**
 * Send an EIP2771 call to StartrailRegistry using the trustedForwarderWallet which
 * is an EOA wallet masquerading as the MetaTxForwarder for unit testing
 * @param fnName StartrailRegistry function name or function signature
 * @param args Array of arguments to the function fnName
 * @return Resolved tx receipt
 */
const sendFromTrustedForwarder = (
  fnName: string,
  args: any[],
  eip2771Sender = luwAddress
): Promise<TransactionReceipt> =>
  sendWithEIP2771(
    startrailRegistry,
    fnName,
    args,
    eip2771Sender,
    trustedForwarderWallet
  ).then((txRsp: TransactionResponse) => txRsp.wait(0))

const createSRRFromLicensedUser = async (createArgs?: {
  isPrimaryIssuerArg?: boolean
  artistAddressArg?: string
  metadataDigestArg?: string
  lockExternalTransferArg?: boolean
  issuerAddress?: string
}): Promise<number> => {
  //  default to global shared test data
  const createProps = defaults(createArgs, {
    isPrimaryIssuerArg: isPrimaryIssuer,
    artistAddressArg: artistAddress,
    metadataDigestArg: metadataDigest,
    lockExternalTransferArg: false,
    issuerAddress: luwAddress,
  })

  const txReceipt = await sendFromTrustedForwarder(
    'createSRRFromLicensedUser(bool,address,bytes32,bool)',
    [
      createProps.isPrimaryIssuerArg,
      createProps.artistAddressArg,
      createProps.metadataDigestArg,
      createProps.lockExternalTransferArg,
    ],
    createProps.issuerAddress
  )

  const eventArgs = decodeEventLog(
    startrailRegistry,
    'CreateSRR(uint256,(bool,address,address),bytes32,bool)',
    txReceipt.logs[1]
  )

  return eventArgs[0].toNumber() // tokenId
}

const createSRRFromLicensedUserWithRandomInputs = (
  artistAddressArg: string
): Promise<number> =>
  createSRRFromLicensedUser({
    isPrimaryIssuerArg: randomBoolean(),
    artistAddressArg: artistAddressArg,
    metadataDigestArg: randomSha256(),
    lockExternalTransferArg: randomBoolean(),
    issuerAddress: luwAddress,
  })

const addCustomHistoryType = (historyTypeName): Promise<number> =>
  startrailRegistry
    .addCustomHistoryType(historyTypeName)
    .then((txRsp) => txRsp.wait(0))
    .then(
      (txReceipt) =>
        startrailRegistry.interface.parseLog(txReceipt.logs[0]).args.id
    )

const writeCustomHistory = (
  historyName,
  historyTypeId,
  metadataDigestArg = historyMetadataDigest
): Promise<number> =>
  startrailRegistry
    .writeCustomHistory(historyName, historyTypeId, metadataDigestArg)
    .then((txRsp) => txRsp.wait(0))
    .then(
      (txReceipt) =>
        startrailRegistry.interface.parseLog(txReceipt.logs[0]).args.id
    )

const updateCustomHistory = (
  historyId,
  metadataDigestArg = historyMetadataDigest
): Promise<number> =>
  startrailRegistry
    .updateCustomHistory(historyId, metadataDigestArg)
    .then((txRsp) => txRsp.wait(0))
    .then(
      (txReceipt) =>
        startrailRegistry.interface.parseLog(txReceipt.logs[0]).args.id
    )

const approve = async (signer, to, tokenId): Promise<TransactionReceipt> => {
  const savedSigner = startrailRegistry.signer

  const approvalPromise = startrailRegistry
    .connect(signer)
    .approve(to, tokenId)
    .then((txRsp) => txRsp.wait(0))

  startrailRegistry.connect(savedSigner)

  return approvalPromise
}

const setApprovalForAll = (
  signer,
  operator,
  approved
): Promise<TransactionReceipt> => {
  const savedSigner = startrailRegistry.signer

  const approvalPromise = startrailRegistry
    .connect(signer)
    .setApprovalForAll(operator, approved)
    .then((txRsp) => txRsp.wait(0))

  startrailRegistry.connect(savedSigner)

  return approvalPromise
}

const approveSRRByCommitment = (
  tokenId,
  commitment,
  metadataDigestArg,
  customHistoryId?
): Promise<TransactionReceipt> =>
  customHistoryId
    ? sendFromTrustedForwarder(
        'approveSRRByCommitment(uint256,bytes32,string,uint256)',
        [tokenId, commitment, metadataDigestArg, customHistoryId]
      )
    : sendFromTrustedForwarder(
        'approveSRRByCommitment(uint256,bytes32,string)',
        [tokenId, commitment, metadataDigestArg]
      )

const transferSRRByReveal = async (
  toAddress,
  reveal,
  tokenId,
  isIntermediary?
): Promise<TransactionReceipt> =>
  startrailRegistry['transferSRRByReveal(address,bytes32,uint256,bool)'](
    toAddress,
    reveal,
    tokenId,
    isIntermediary
  ).then((txRsp) => txRsp.wait(0))

const setLockExternalTransfer = (
  signer,
  tokenId,
  flag
): Promise<TransactionReceipt> =>
  startrailRegistry
    .connect(signer)
    .setLockExternalTransfer(tokenId, flag)
    .then((txRsp) => txRsp.wait(0))

const lockExternalTransfer = (tokenId): Promise<TransactionResponse> =>
  startrailRegistry.lockExternalTransfer(tokenId)

const safeTransferFrom = (
  signer,
  from,
  to,
  tokenId
): Promise<TransactionReceipt> =>
  startrailRegistry
    .connect(signer)
    [`safeTransferFrom(address,address,uint256)`](from, to, tokenId)
    .then((txRsp) => txRsp.wait(0))

const safeTransferFromWithData = (
  signer,
  from,
  to,
  tokenId,
  data
): Promise<TransactionReceipt> =>
  startrailRegistry
    .connect(signer)
    [`safeTransferFrom(address,address,uint256,bytes)`](from, to, tokenId, data)
    .then((txRsp) => txRsp.wait(0))

const transferFrom = (signer, from, to, tokenId): Promise<TransactionReceipt> =>
  startrailRegistry
    .connect(signer)
    [`transferFrom(address,address,uint256)`](from, to, tokenId)
    .then((txRsp) => txRsp.wait(0))

const transferFromWithProvenance = async (
  to,
  tokenId,
  historyDigest,
  customHistoryId,
  isIntermediary
): Promise<TransactionReceipt> =>
  sendFromTrustedForwarder(
    'transferFromWithProvenance(address,uint256,string,uint256,bool)',
    [to, tokenId, historyDigest, customHistoryId, isIntermediary]
  )

/*
 *
 * Assertion helpers
 *
 */

const assertLogApprovalFromTxReceipt = (txReceipt, tokenId, owner, to) => {
  const parsedLog = startrailRegistry.interface.parseLog(txReceipt.logs[0])
  expect(parsedLog.name).to.equal(`Approval`)
  expect(parsedLog.args.tokenId).to.equal(tokenId)
  expect(parsedLog.args.owner).to.equal(owner)
  expect(parsedLog.args.approved).to.equal(to)
}

const assertLogApprovalForAll = (txReceipt, operator, approved) => {
  const parsedLog = startrailRegistry.interface.parseLog(txReceipt.logs[0])
  expect(parsedLog.name).to.equal(`ApprovalForAll`)
  expect(parsedLog.args.operator).to.equal(operator)
  expect(parsedLog.args.approved).to.equal(approved)
}

const assertCommitment = (tokenId, expectedCommitment) =>
  startrailRegistry
    .getSRRCommitment(tokenId)
    .then((commitment) => expect(commitment[0]).to.equal(expectedCommitment))

const assertLogCommitmentFromTxReceipt = (
  txReceipt,
  tokenId,
  commitment,
  customHistoryId?
) => {
  const parsedLog = startrailRegistry.interface.parseLog(txReceipt.logs[0])
  const logArgs = parsedLog.args

  expect(logArgs.owner).to.equal(luwAddress)
  expect(logArgs.commitment).to.equal(commitment)
  expect(logArgs.tokenId.toNumber()).to.equal(tokenId)

  if (customHistoryId) {
    expect(logArgs.customHistoryId).to.be.equal(customHistoryId)
  }
}

const assertTransferByReveal = async (
  txReceipt,
  toAddress,
  tokenId,
  isIntermediary
) => {
  const provLog = startrailRegistry.interface.parseLog(txReceipt.logs[0])
  expect(provLog.args.tokenId.toNumber()).to.equal(tokenId)
  expect(provLog.args.to).to.equal(toAddress)
  expect(provLog.args.from).to.equal(luwAddress)
  expect(provLog.args.historyMetadataDigest).to.equal(metadataDigest)
  expect(provLog.args.historyMetadataURI).to.equal(
    SCHEMA_URI_PREFIX + metadataDigest + '.json'
  )
  expect(provLog.args.isIntermediary).to.equal(isIntermediary)

  const approvalLog = startrailRegistry.interface.parseLog(txReceipt.logs[1])
  // console.log(parsedLogApproval)
  expect(approvalLog.args.owner).to.equal(luwAddress)
  expect(approvalLog.args.approved).to.equal(ZERO_ADDRESS)
  expect(approvalLog.args.tokenId.toNumber()).to.equal(tokenId)

  const transferLog = startrailRegistry.interface.parseLog(txReceipt.logs[2])
  // console.log(parsedLogTransfer)

  expect(transferLog.args.from).to.equal(luwAddress)
  expect(transferLog.args.to).to.equal(toAddress)
  expect(transferLog.args.tokenId).to.equal(tokenId)

  const currentOwner = await startrailRegistry.ownerOf(tokenId)
  expect(currentOwner).to.equal(toAddress)
}

const assertLogLockExternalTransferFromTxReceipt = (
  txReceipt,
  tokenId,
  flag
) => {
  const parsedLog = startrailRegistry.interface.parseLog(txReceipt.logs[0])
  expect(parsedLog.name).to.equal(`LockExternalTransfer`)
  expect(parsedLog.args.tokenId).to.equal(tokenId)
  expect(parsedLog.args.flag).to.equal(flag)
}

const assertLogTransferFromTxReceipt = (
  txReceipt,
  tokenId,
  from,
  to,
  withProvenance = false
) => {
  const parsedLog0 = startrailRegistry.interface.parseLog(
    txReceipt.logs[withProvenance ? 1 : 0]
  )
  expect(parsedLog0.name).to.equal(`Approval`)
  expect(parsedLog0.args.owner).to.equal(from)
  expect(parsedLog0.args.approved).to.equal(ZERO_ADDRESS)

  const parsedLog1 = startrailRegistry.interface.parseLog(
    txReceipt.logs[withProvenance ? 2 : 1]
  )
  expect(parsedLog1.name).to.equal(`Transfer`)
  expect(parsedLog1.args.from).to.equal(from)
  expect(parsedLog1.args.to).to.equal(to)
  expect(parsedLog1.args.tokenId).to.equal(tokenId)
}

const assertLogProvenanceFromTxReceipt = (
  txReceipt,
  historyDigest,
  customHistoryId,
  isIntermediary
) => {
  const expectedCustomHistoryId =
    customHistoryId == 0 ? undefined : customHistoryId
  const parsedLog0 = startrailRegistry.interface.parseLog(txReceipt.logs[0])
  expect(parsedLog0.name).to.equal(`Provenance`)
  expect(parsedLog0.args.customHistoryId).to.equal(expectedCustomHistoryId)
  expect(parsedLog0.args.historyMetadataDigest).to.equal(historyDigest)
  expect(parsedLog0.args.isIntermediary).to.equal(isIntermediary)
}

describe('StartrailRegistry', () => {
  /**
   * Run the fixtureDefault then swap out the the Administrator
   * and MetaTxForwarder contracts with EOA wallets.
   *
   * This makes unit tests simpler and allows for direct calls to the
   * StartrailRegistry.
   */
  const fixtureDefaultWithEOAForwarderAndAdmin = async (): Promise<
    TransactionResponse
  > => {
    ;({
      startrailRegistry,
      metaTxForwarder,
      nameRegistry,
      administrator,
    } = await hre.waffle.loadFixture(fixtureDefault))
    await nameRegistrySet(
      hre,
      ContractKeys.Administrator,
      administratorWallet.address
    )
    return await startrailRegistry.setTrustedForwarder(
      trustedForwarderWallet.address
    )
  }

  before(async () => {
    await fixtureDefaultWithEOAForwarderAndAdmin()
    const random32ByteHash = () => hre.ethers.utils.id(String(Math.random()))

    await startrailRegistry.setTrustedForwarder(metaTxForwarder.address)
    await nameRegistry.set(
      ContractKeys.Administrator,
      administrator.contract.address
    )

    artistAddress = await lumCreateWallet({
      owners: [handlerWallet.address],
      threshold: 1,
      englishName: 'Test Artist English',
      originalName: 'test Artist Original',
      userType: 'artist',
      salt: random32ByteHash(),
    })

    luwAddress = await lumCreateWallet({
      owners: [handlerWallet.address],
      threshold: 1,
      englishName: 'Test Handler English',
      originalName: 'Test Handler Original',
      userType: 'handler',
      salt: random32ByteHash(),
    })

    anotherArtistAddress = await lumCreateWallet({
      owners: [handlerWallet.address],
      threshold: 1,
      englishName: 'Test Another Artist English',
      originalName: 'Test Another Artist Original',
      userType: 'artist',
      salt: random32ByteHash(),
    })

    await nameRegistrySet(
      hre,
      ContractKeys.Administrator,
      administratorWallet.address
    )
    await startrailRegistry.setTrustedForwarder(trustedForwarderWallet.address)
  })

  beforeEach(async () => {
    // Setup Test Data
    metadataDigest = randomSha256()
    historyMetadataDigest = randomSha256()
    customHistoryName = randomText()
    customHistoryTypeName = randomText()
  })

  describe('createSRRFromLicensedUser', () => {
    it('issue SRR with EIP2771 forwarded sender', async () => {
      const txReceipt = await sendFromTrustedForwarder(
        'createSRRFromLicensedUser(bool,address,bytes32,bool)',
        [isPrimaryIssuer, artistAddress, metadataDigest, false]
      )

      const eventArgs = decodeEventLog(
        startrailRegistry,
        'CreateSRR(uint256,(bool,address,address),bytes32,bool)',
        txReceipt.logs[1]
      )

      const tokenId = eventArgs[0].toNumber()
      expect(Number.isInteger(tokenId)).to.be.true
      expect(tokenId > 0).to.be.true

      const srr = eventArgs[1]
      expect(srr[0]).to.equal(isPrimaryIssuer)
      expect(srr[1]).to.equal(artistAddress)
      expect(srr[2]).to.equal(luwAddress)

      expect(eventArgs[2]).to.equal(metadataDigest)
    })

    it('rejects if msg.sender is not the trusted forwarder', async () => {
      // send from wallet other than the trusted forwarder
      const startrailRegistryNotTrusted = startrailRegistry.connect(
        noAuthWallet
      )
      await assertRevert(
        startrailRegistryNotTrusted[
          `createSRRFromLicensedUser(bool,address,bytes32,bool)`
        ](isPrimaryIssuer, artistAddress, metadataDigest, false),
        `Function can only be called through the trusted Forwarder`
      )
    })
  })

  describe('createSRRFromLicensedUser (with recipient address)', () => {
    it('issues with EIP2771 forwarded sender', async () => {
      const txReceipt = await sendFromTrustedForwarder(
        'createSRRFromLicensedUser(bool,address,bytes32,bool,address)',
        [isPrimaryIssuer, artistAddress, metadataDigest, false, recipient]
      )

      const eventArgs = decodeEventLog(
        startrailRegistry,
        'CreateSRR(uint256,(bool,address,address),bytes32,bool)',
        txReceipt.logs[1]
      )

      const tokenId = eventArgs[0].toNumber()

      const transferArgs = decodeEventLog(
        startrailRegistry,
        'Transfer(address, address, uint256)',
        txReceipt.logs[3]
      )

      expect(Number.isInteger(tokenId)).to.be.true
      expect(tokenId > 0).to.be.true

      const srr = eventArgs[1]
      expect(srr[0]).to.equal(isPrimaryIssuer)
      expect(srr[1]).to.equal(artistAddress)
      expect(srr[2]).to.equal(luwAddress)

      expect(transferArgs[1]).to.equal(recipient)
      expect(transferArgs[2]).to.equal(tokenId)

      expect(await startrailRegistry.ownerOf(tokenId)).to.equal(recipient)

      expect(eventArgs[2]).to.equal(metadataDigest)
    })

    it('rejects if msg.sender is not the trusted forwarder', async () => {
      // send from wallet other than the trusted forwarder
      const startrailRegistryNotTrusted = startrailRegistry.connect(
        noAuthWallet
      )
      await assertRevert(
        startrailRegistryNotTrusted[
          `createSRRFromLicensedUser(bool,address,bytes32,bool,address)`
        ](isPrimaryIssuer, artistAddress, metadataDigest, false, recipient),
        `Function can only be called through the trusted Forwarder`
      )
    })
  })

  describe('createSRRFromBulk', () => {
    before(async () => {
      // Set BulkIssue to an EOA wallet to enable direct sending
      await nameRegistry.set(ContractKeys.BulkIssue, bulkIssueWallet.address)
    })

    it('issues when sent from BulkIssue', async () => {
      const issuerAddress = randomAddress()
      const bulkIssueMetadata = randomSha256()
      const {
        data: bulkIssueData,
      } = await startrailRegistry.populateTransaction.createSRRFromBulk(
        isPrimaryIssuer,
        artistAddress,
        bulkIssueMetadata,
        issuerAddress,
        false
      )

      await bulkIssueWallet
        .sendTransaction({
          to: startrailRegistry.address,
          data: bulkIssueData,
        })
        .then((txRsp) => txRsp.wait(0))
    })

    it('rejects if NOT sent from BulkIssue', async () => {
      // send from wallet other than the trusted forwarder
      const startrailRegistryNotTrusted = startrailRegistry.connect(
        noAuthWallet
      )
      await assertRevert(
        startrailRegistryNotTrusted.createSRRFromBulk(
          isPrimaryIssuer,
          artistAddress,
          metadataDigest,
          randomAddress(), // issuer
          false
        ),
        `The sender is not the Bulk related contract`
      )
    })
  })

  describe('approveSRRByCommitmentFromBulk', () => {
    let tokenId, commitment, historyDigest

    before(async () => {
      // Set BulkTransfer to an EOA wallet to enable direct sending
      await nameRegistry.set(
        ContractKeys.BulkTransfer,
        bulkTransferWallet.address
      )
    })

    it('send tx when sent from BulkTransfer', async () => {
      tokenId = await createSRRFromLicensedUser()
      commitment = randomSha256()
      historyDigest = randomSha256()

      const {
        data: bulkTransferData,
      } = await startrailRegistry.populateTransaction.approveSRRByCommitmentFromBulk(
        tokenId,
        commitment,
        historyDigest,
        0
      )

      await bulkTransferWallet
        .sendTransaction({
          to: startrailRegistry.address,
          data: bulkTransferData,
        })
        .then((txRsp) => txRsp.wait(0))
    })

    it('rejects if NOT sent from BulkTransfer', async () => {
      // send from wallet other than the trusted forwarder
      const startrailRegistryNotTrusted = startrailRegistry.connect(
        noAuthWallet
      )
      await assertRevert(
        startrailRegistryNotTrusted.approveSRRByCommitmentFromBulk(
          tokenId,
          commitment,
          historyDigest,
          0
        ),
        `The sender is not the Bulk related contract`
      )
    })
  })

  describe('customHistory', () => {
    it('success to create customHistoryType', async () => {
      const txReceipt = await startrailRegistry
        .addCustomHistoryType(customHistoryTypeName)
        .then((txRsp) => txRsp.wait(0))

      const parsedLog = startrailRegistry.interface.parseLog(txReceipt.logs[0])
      expect(parsedLog.args.id).to.be.above(0)
      expect(parsedLog.args.historyType).to.equal(customHistoryTypeName)
    })

    it('failed to create customHistoryType if caller is not admin', async () => {
      await assertRevert(
        sendFromTrustedForwarder('addCustomHistoryType(string)', [
          customHistoryTypeName,
        ]),
        `Caller is not the Startrail Administrator`
      )
    })

    it('failed to create customHistoryType with same historyType', async () => {
      await addCustomHistoryType(customHistoryTypeName)
      await assertRevert(
        addCustomHistoryType(customHistoryTypeName),
        `History type with the same name already exists`
      )
    })

    it('success to create customHistory with customHistoryTypeId', async () => {
      const customHistoryTypeId = await addCustomHistoryType(
        customHistoryTypeName
      )

      const txReceipt = await startrailRegistry
        .writeCustomHistory(
          customHistoryTypeName,
          customHistoryTypeId,
          historyMetadataDigest
        )
        .then((txRsp) => txRsp.wait(0))

      const parsedLog = startrailRegistry.interface.parseLog(txReceipt.logs[0])
      expect(parsedLog.args.id).to.be.above(0)
      expect(parsedLog.args.name).to.equal(customHistoryTypeName)
      expect(parsedLog.args.customHistoryTypeId).to.equal(customHistoryTypeId)
      expect(parsedLog.args.metadataDigest).to.equal(historyMetadataDigest)
    })

    it("failed to create customHistory if customHistoryTypeId doesn't exist", async () => {
      const customHistoryTypeId = 111
      await assertRevert(
        writeCustomHistory(customHistoryName, customHistoryTypeId),
        `The custom history type id does not exist`
      )
    })

    it('failed to create customHistory if caller is not admin', async () => {
      const customHistoryTypeId = await addCustomHistoryType(
        customHistoryTypeName
      )
      await assertRevert(
        sendFromTrustedForwarder('writeCustomHistory(string,uint256,bytes32)', [
          customHistoryName,
          customHistoryTypeId,
          historyMetadataDigest,
        ]),
        `Caller is not the Startrail Administrator`
      )
    })
  })

  describe('updateCustomHistory', () => {
    it('success to update customHistory with customHistoryId', async () => {
      const updatedDigest =
        '0x001c7d6fdb9885b02689d0d76b34fe73e7706b3e9e841c16a8f8264077d197cd'

      const customHistoryTypeId = await addCustomHistoryType(
        customHistoryTypeName
      )

      const customHistoryId = await writeCustomHistory(
        customHistoryName,
        customHistoryTypeId
      )

      const txReceipt = await startrailRegistry
        .updateCustomHistory(customHistoryId, updatedDigest)
        .then((txRsp) => txRsp.wait(0))

      const parsedLog = startrailRegistry.interface.parseLog(txReceipt.logs[0])
      expect(parsedLog.args.id).to.be.equal(customHistoryId)
      expect(parsedLog.args.metadataDigest).to.equal(updatedDigest)
    })

    it("failed to create customHistory if customHistoryTypeId doesn't exist", async () => {
      const customHistoryId = 111
      const updatedDigest =
        '0x001c7d6fdb9885b02689d0d76b34fe73e7706b3e9e841c16a8f8264077d197cd'

      await assertRevert(
        updateCustomHistory(customHistoryId, updatedDigest),
        `The custom history id does not exist`
      )
    })

    it('failed to create customHistory if caller is not admin', async () => {
      const updatedDigest =
        '0x001c7d6fdb9885b02689d0d76b34fe73e7706b3e9e841c16a8f8264077d197cd'

      const customHistoryTypeId = await addCustomHistoryType(
        customHistoryTypeName
      )

      const customHistoryId = await writeCustomHistory(
        customHistoryName,
        customHistoryTypeId
      )

      await assertRevert(
        sendFromTrustedForwarder('updateCustomHistory(uint256,bytes32)', [
          customHistoryId,
          updatedDigest,
        ]),
        `Caller is not the Startrail Administrator`
      )
    })
  })

  describe('approveSRRByCommitment', () => {
    it('success to approveSRRByCommitment without customHistory', async () => {
      const tokenId = await createSRRFromLicensedUser()
      const reveal = randomSha256()
      const commitment = ethers.utils.keccak256(reveal)

      const txReceipt = await approveSRRByCommitment(
        tokenId,
        commitment,
        metadataDigest
      )
      assertLogCommitmentFromTxReceipt(txReceipt, tokenId, commitment)
      await assertCommitment(tokenId, commitment)
    })

    it('success to approveSRRByCommitment with customHistory', async () => {
      const tokenId = await createSRRFromLicensedUser()
      const reveal = randomSha256()
      const commitment = ethers.utils.keccak256(reveal)

      const customHistoryTypeId = await addCustomHistoryType(
        customHistoryTypeName
      )
      const customHistoryId = await writeCustomHistory(
        customHistoryName,
        customHistoryTypeId
      )

      const txReceipt = await approveSRRByCommitment(
        tokenId,
        commitment,
        metadataDigest,
        customHistoryId
      )
      assertLogCommitmentFromTxReceipt(
        txReceipt,
        tokenId,
        commitment,
        customHistoryId
      )
      await assertCommitment(tokenId, commitment)
    })

    it("failed to approveSRRByCommitment with customHistory if customHistory doesn't exist", async () => {
      const tokenId = await createSRRFromLicensedUser()
      const reveal = randomSha256()
      const commitment = ethers.utils.keccak256(reveal)

      const customHistoryId = 5

      await assertRevert(
        sendFromTrustedForwarder(
          'approveSRRByCommitment(uint256,bytes32,string,uint256)',
          [tokenId, commitment, metadataDigest, customHistoryId]
        ),
        `The custom history id does not exist`
      )
    })

    it("failed to approveSRRByCommitment with customHistory if token doesn't exist", async () => {
      const tokenId = 3452342 // doesn't exist
      const reveal = randomSha256()
      const commitment = ethers.utils.keccak256(reveal)

      const customHistoryTypeId = await addCustomHistoryType(
        customHistoryTypeName
      )
      const customHistoryId = await writeCustomHistory(
        customHistoryName,
        customHistoryTypeId
      )

      await assertRevert(
        sendFromTrustedForwarder(
          'approveSRRByCommitment(uint256,bytes32,string,uint256)',
          [tokenId, commitment, metadataDigest, customHistoryId]
        ),
        `ERC721: owner query for nonexistent token`
      )
    })
  })

  describe('cancelSRRCommitment', () => {
    const cancelSRRCommitment = (tokenId) =>
      sendFromTrustedForwarder('cancelSRRCommitment(uint256)', [tokenId])

    const assertTxCancelSRRCommitment = async (txReceipt, tokenId) => {
      const parsedLog = startrailRegistry.interface.parseLog(txReceipt.logs[0])
      expect(parsedLog.args.tokenId.toNumber()).to.equal(tokenId)
    }

    const assertCommitmentIsBlank = (tokenId) =>
      startrailRegistry
        .getSRRCommitment(tokenId)
        .then((commitment) => expect(commitment[0]).to.be.equal(emptyValue))

    let approvedTokenId

    beforeEach(async () => {
      approvedTokenId = await createSRRFromLicensedUser()
      const reveal = randomSha256()
      const commitment = ethers.utils.keccak256(reveal)
      await approveSRRByCommitment(approvedTokenId, commitment, metadataDigest)
    })

    it('success to cancel commitment by either owner or admin', async () => {
      const txReceiptCancel = await cancelSRRCommitment(approvedTokenId)
      assertTxCancelSRRCommitment(txReceiptCancel, approvedTokenId)
      await assertCommitmentIsBlank(approvedTokenId)
    })

    it('fails from non-authorized address', () =>
      assertRevert(
        startrailRegistry
          .connect(noAuthWallet)
          .cancelSRRCommitment(approvedTokenId),
        'Sender is neither a SRR owner nor the admin'
      ))
  })

  describe('transferSRRByReveal', () => {
    it('success to approve and transfer without custom history with isIntermediary is false', async () => {
      const tokenId = await createSRRFromLicensedUser()
      const reveal = randomSha256()
      const commitment = ethers.utils.keccak256(reveal)

      await approveSRRByCommitment(tokenId, commitment, metadataDigest)

      const toAddress = randomAddress()
      const isIntermediary = false
      const txReceipt = await transferSRRByReveal(
        toAddress,
        reveal,
        tokenId,
        isIntermediary
      )

      await assertTransferByReveal(
        txReceipt,
        toAddress,
        tokenId,
        isIntermediary
      )
    })

    it('success to approve and transfer without custom history with isIntermediary is true', async () => {
      const tokenId = await createSRRFromLicensedUser()
      const reveal = randomSha256()
      const commitment = ethers.utils.keccak256(reveal)

      await approveSRRByCommitment(tokenId, commitment, metadataDigest)

      const toAddress = randomAddress()
      const isIntermediary = true
      const txReceipt = await transferSRRByReveal(
        toAddress,
        reveal,
        tokenId,
        isIntermediary
      )

      await assertTransferByReveal(
        txReceipt,
        toAddress,
        tokenId,
        isIntermediary
      )
    })

    it('success to approve and transfer with custom history with isIntermediary is false', async () => {
      const tokenId = await createSRRFromLicensedUser()

      const reveal = randomSha256()
      const commitment = ethers.utils.keccak256(reveal)

      const customHistoryTypeId = await addCustomHistoryType(
        customHistoryTypeName
      )
      const customHistoryId = await writeCustomHistory(
        customHistoryName,
        customHistoryTypeId
      )

      await approveSRRByCommitment(
        tokenId,
        commitment,
        metadataDigest,
        customHistoryId
      )

      const toAddress = randomAddress()
      const isIntermediary = false
      const txReceipt = await transferSRRByReveal(
        toAddress,
        reveal,
        tokenId,
        isIntermediary
      )

      await assertTransferByReveal(
        txReceipt,
        toAddress,
        tokenId,
        isIntermediary
      )
    })

    it('success to approve and transfer with custom history with isIntermediary is true', async () => {
      const tokenId = await createSRRFromLicensedUser()

      const reveal = randomSha256()
      const commitment = ethers.utils.keccak256(reveal)

      const customHistoryTypeId = await addCustomHistoryType(
        customHistoryTypeName
      )
      const customHistoryId = await writeCustomHistory(
        customHistoryName,
        customHistoryTypeId
      )

      await approveSRRByCommitment(
        tokenId,
        commitment,
        metadataDigest,
        customHistoryId
      )

      const toAddress = randomAddress()
      const isIntermediary = true
      const txReceipt = await transferSRRByReveal(
        toAddress,
        reveal,
        tokenId,
        isIntermediary
      )

      await assertTransferByReveal(
        txReceipt,
        toAddress,
        tokenId,
        isIntermediary
      )
    })

    it('failed to transfer when commitment and reveal missmatch', async () => {
      const tokenId = await createSRRFromLicensedUser()

      const reveal = randomSha256()

      const commitment = ethers.utils.keccak256(reveal)

      const customHistoryTypeId = await addCustomHistoryType(
        customHistoryTypeName
      )
      const customHistoryId = await writeCustomHistory(
        customHistoryName,
        customHistoryTypeId
      )

      await approveSRRByCommitment(
        tokenId,
        commitment,
        metadataDigest,
        customHistoryId
      )

      const missmatchReveal = ethers.utils.id(`${randomText()}@outlook.com`)
      const toAddress = randomAddress()

      await assertRevert(
        transferSRRByReveal(toAddress, missmatchReveal, tokenId),
        `Hash of reveal doesn't match`
      )
    })
  })

  describe(`transferFromMarketplace`, () => {
    it(`success to lockExternalTransfer and setLockExternalTransfer`, async () => {
      const tokenId = await createSRRFromLicensedUser()

      // initially false
      expect(await lockExternalTransfer(tokenId)).to.false

      // set to true
      const txReceiptSetLock1 = await setLockExternalTransfer(
        administratorWallet,
        tokenId,
        true
      )
      assertLogLockExternalTransferFromTxReceipt(
        txReceiptSetLock1,
        tokenId,
        true
      )
      expect(await lockExternalTransfer(tokenId)).to.be.true

      // set back to false again
      const txReceiptSetLock2 = await setLockExternalTransfer(
        administratorWallet,
        tokenId,
        false
      )
      assertLogLockExternalTransferFromTxReceipt(
        txReceiptSetLock2,
        tokenId,
        false
      )
      expect(await lockExternalTransfer(tokenId)).to.be.false
    })

    it(`failed setLockExternalTransfer if the sender is neither an issuer nor the admin`, async () => {
      const tokenId = await createSRRFromLicensedUser()
      await assertRevert(
        setLockExternalTransfer(noAuthWallet, tokenId, true),
        `This is neither a issuer nor the admin`
      )
    })

    it(`success to approve by administrator`, async () => {
      const tokenId = await createSRRFromLicensedUser()
      expect(startrailRegistry.ownerOf(tokenId)).to.not.equal(
        administratorWallet.address
      )

      const txReceiptApprove = await approve(
        administratorWallet,
        marketplaceWallet.address,
        tokenId
      )

      assertLogApprovalFromTxReceipt(
        txReceiptApprove,
        tokenId,
        luwAddress, // owner - issuer in createSRRFromLicensedUser
        marketplaceWallet.address
      )
    })

    it(`failed approve by administrator if LockExternalTransfer flag is set`, async () => {
      const tokenId = await createSRRFromLicensedUser()
      await setLockExternalTransfer(administratorWallet, tokenId, true)
      expect(await lockExternalTransfer(tokenId)).to.be.true

      await assertRevert(
        approve(administratorWallet, marketplaceWallet.address, tokenId),
        `Transfer is locked for this token`
      )
    })

    it(`failed approve by administrator if tokenId owner is not administrator and LockExternalTransfer flag is set`, async () => {
      const tokenId = await createSRRFromLicensedUser()

      await approve(administratorWallet, marketplaceWallet.address, tokenId)
      await transferFrom(
        marketplaceWallet,
        luwAddress,
        marketplaceWallet.address,
        tokenId
      )

      await setLockExternalTransfer(administratorWallet, tokenId, true)
      expect(await lockExternalTransfer(tokenId)).to.be.true

      await assertRevert(
        approve(administratorWallet, noAuthWallet.address, tokenId),
        `Transfer is locked for this token`
      )
    })

    it(`success to approve by administrator when creating an SRR, LockExternalTransfer flag is set to false`, async () => {
      const tokenId = await createSRRFromLicensedUser()
      await approve(administratorWallet, marketplaceWallet.address, tokenId)
      // TODO: assert
    })

    it(`failed approve by administrator when creating an SRR, LockExternalTransfer flag is set to true`, async () => {
      const tokenId = await createSRRFromLicensedUser({
        lockExternalTransferArg: true,
      })
      expect(await lockExternalTransfer(tokenId)).to.be.true
      await assertRevert(
        approve(administratorWallet, marketplaceWallet.address, tokenId),
        `Transfer is locked for this token`
      )
    })

    it(`success to approve and transferFrom`, async () => {
      const tokenId = await createSRRFromLicensedUser()

      // approve to marketplace, transfer from administrator to no auth account
      await approve(administratorWallet, marketplaceWallet.address, tokenId)
      const currentOwner = await startrailRegistry.ownerOf(tokenId)
      const txReceiptTransfer1 = await transferFrom(
        marketplaceWallet,
        currentOwner,
        noAuthWallet.address,
        tokenId
      )
      assertLogTransferFromTxReceipt(
        txReceiptTransfer1,
        tokenId,
        currentOwner,
        noAuthWallet.address
      )

      // approve to marketplace, transfer from no auth account to administrator
      await approve(noAuthWallet, marketplaceWallet.address, tokenId)
      const txReceiptTransfer2 = await transferFrom(
        marketplaceWallet,
        noAuthWallet.address,
        administratorWallet.address,
        tokenId
      )
      assertLogTransferFromTxReceipt(
        txReceiptTransfer2,
        tokenId,
        noAuthWallet.address,
        administratorWallet.address
      )
    })

    it(`success to approve and safeTransferFrom`, async () => {
      const tokenId = await createSRRFromLicensedUser()

      // approve to marketplace, transfer from administrator to no auth account
      const txReceiptApprove1 = await approve(
        administratorWallet,
        marketplaceWallet.address,
        tokenId
      )
      assertLogApprovalFromTxReceipt(
        txReceiptApprove1,
        tokenId,
        luwAddress, // owner - issuer in createSRRFromLicensedUser
        marketplaceWallet.address
      )

      const currentOwner = await startrailRegistry.ownerOf(tokenId)
      const txReceiptTransfer1 = await safeTransferFrom(
        marketplaceWallet,
        currentOwner,
        noAuthWallet.address,
        tokenId
      )
      assertLogTransferFromTxReceipt(
        txReceiptTransfer1,
        tokenId,
        currentOwner,
        noAuthWallet.address
      )

      // approve to marketplace, transfer from no auth account to administrator
      const txReceiptApprove2 = await approve(
        noAuthWallet,
        marketplaceWallet.address,
        tokenId
      )
      assertLogApprovalFromTxReceipt(
        txReceiptApprove2,
        tokenId,
        noAuthWallet.address,
        marketplaceWallet.address
      )

      const txReceiptTransfer2 = await safeTransferFrom(
        marketplaceWallet,
        noAuthWallet.address,
        administratorWallet.address,
        tokenId
      )
      assertLogTransferFromTxReceipt(
        txReceiptTransfer2,
        tokenId,
        noAuthWallet.address,
        administratorWallet.address
      )
    })

    it(`success to approve and safeTransferFromWithData`, async () => {
      const tokenId = await createSRRFromLicensedUser()

      // approve to marketplace, transfer from administrator to no auth account
      await approve(administratorWallet, marketplaceWallet.address, tokenId)
      const currentOwner = await startrailRegistry.ownerOf(tokenId)
      const txReceiptTransfer1 = await safeTransferFromWithData(
        marketplaceWallet,
        currentOwner,
        noAuthWallet.address,
        tokenId,
        '0x'
      )
      assertLogTransferFromTxReceipt(
        txReceiptTransfer1,
        tokenId,
        currentOwner,
        noAuthWallet.address
      )

      // approve to marketplace, transfer from no auth account to administrator
      await approve(noAuthWallet, marketplaceWallet.address, tokenId)
      const txReceiptTransfer2 = await safeTransferFromWithData(
        marketplaceWallet,
        noAuthWallet.address,
        administratorWallet.address,
        tokenId,
        '0x'
      )
      assertLogTransferFromTxReceipt(
        txReceiptTransfer2,
        tokenId,
        noAuthWallet.address,
        administratorWallet.address
      )
    })

    it(`failed approve if signer is not an owner`, async () => {
      const tokenId = await createSRRFromLicensedUser()

      // approve to marketplace, transfer from administrator to no auth account
      await approve(administratorWallet, marketplaceWallet.address, tokenId)
      const currentOwner = await startrailRegistry.ownerOf(tokenId)
      await safeTransferFrom(
        marketplaceWallet,
        currentOwner,
        noAuthWallet.address,
        tokenId
      )

      await assertRevert(
        approve(marketplaceWallet, marketplaceWallet.address, tokenId),
        `ERC721: approve caller is not owner nor approved for all`
      )
    })

    it(`failed approve if LockExternalTransfer flag is set`, async () => {
      const tokenId = await createSRRFromLicensedUser()

      // approve to marketplace, transfer from administrator to no auth account
      await approve(administratorWallet, marketplaceWallet.address, tokenId)
      const currentOwner = await startrailRegistry.ownerOf(tokenId)
      await safeTransferFrom(
        marketplaceWallet,
        currentOwner,
        noAuthWallet.address,
        tokenId
      )

      await setLockExternalTransfer(administratorWallet, tokenId, true)
      expect(await lockExternalTransfer(tokenId)).to.be.true

      await assertRevert(
        approve(noAuthWallet, marketplaceWallet.address, tokenId),
        `Transfer is locked for this token`
      )
    })

    it(`success to setApprovalForAll and transferFrom`, async () => {
      const tokenId = await createSRRFromLicensedUser({
        issuerAddress: handlerWallet.address,
      })

      const txReceiptApprovalForAll = await setApprovalForAll(
        handlerWallet,
        marketplaceWallet.address,
        true
      )
      assertLogApprovalForAll(
        txReceiptApprovalForAll,
        marketplaceWallet.address,
        true
      )

      const currentOwner = await startrailRegistry.ownerOf(tokenId)
      const toAddress = randomAddress()
      const txReceiptTransfer = await transferFrom(
        marketplaceWallet,
        currentOwner,
        toAddress,
        tokenId
      )
      assertLogTransferFromTxReceipt(
        txReceiptTransfer,
        tokenId,
        currentOwner,
        toAddress
      )
    })

    it(`success to setApprovalForAll and safeTransferFrom`, async () => {
      const tokenId = await createSRRFromLicensedUser({
        issuerAddress: handlerWallet.address,
      })

      const txReceiptApprovalForAll = await setApprovalForAll(
        handlerWallet,
        marketplaceWallet.address,
        true
      )
      assertLogApprovalForAll(
        txReceiptApprovalForAll,
        marketplaceWallet.address,
        true
      )

      const currentOwner = await startrailRegistry.ownerOf(tokenId)
      const toAddress = randomAddress()
      const txReceiptTransfer = await safeTransferFrom(
        marketplaceWallet,
        currentOwner,
        toAddress,
        tokenId
      )
      assertLogTransferFromTxReceipt(
        txReceiptTransfer,
        tokenId,
        currentOwner,
        toAddress
      )
    })

    it(`success to setApprovalForAll and safeTransferFromWithData`, async () => {
      const tokenId = await createSRRFromLicensedUser({
        issuerAddress: handlerWallet.address,
      })

      const txReceiptApprovalForAll = await setApprovalForAll(
        handlerWallet,
        marketplaceWallet.address,
        true
      )
      assertLogApprovalForAll(
        txReceiptApprovalForAll,
        marketplaceWallet.address,
        true
      )

      const currentOwner = await startrailRegistry.ownerOf(tokenId)
      const toAddress = randomAddress()

      const txReceiptTransfer = await safeTransferFromWithData(
        marketplaceWallet,
        currentOwner,
        toAddress,
        tokenId,
        '0x'
      )
      assertLogTransferFromTxReceipt(
        txReceiptTransfer,
        tokenId,
        currentOwner,
        toAddress
      )
    })

    describe(`setApprovalForAll transfer checks`, () => {
      it(`success to setApprovalForAll but failed transferFrom if signer is not owner nor approved`, async () => {
        const tokenId = await createSRRFromLicensedUser({
          issuerAddress: handlerWallet.address,
        })

        await setApprovalForAll(handlerWallet, marketplaceWallet.address, true)
        const currentOwner = await startrailRegistry.ownerOf(tokenId)
        const toAddress = randomAddress()

        await assertRevert(
          transferFrom(noAuthWallet, currentOwner, toAddress, tokenId),
          `ERC721: transfer caller is not owner nor approved`
        )
      })

      it(`success to setApprovalForAll but failed transferFrom if LockExternalTransfer flag is set`, async () => {
        const tokenId = await createSRRFromLicensedUser({
          issuerAddress: handlerWallet.address,
        })

        await setApprovalForAll(handlerWallet, marketplaceWallet.address, true)
        await setLockExternalTransfer(administratorWallet, tokenId, true)
        expect(await lockExternalTransfer(tokenId)).to.be.true

        const currentOwner = await startrailRegistry.ownerOf(tokenId)
        const toAddress = randomAddress()
        await assertRevert(
          transferFrom(marketplaceWallet, currentOwner, toAddress, tokenId),
          `Transfer is locked for this token`
        )
      })

      it(`success to setApprovalForAll but failed safeTransferFrom if signer is not owner nor approved`, async () => {
        const tokenId = await createSRRFromLicensedUser({
          issuerAddress: handlerWallet.address,
        })

        await setApprovalForAll(handlerWallet, marketplaceWallet.address, true)

        const currentOwner = await startrailRegistry.ownerOf(tokenId)
        const toAddress = randomAddress()
        await assertRevert(
          safeTransferFrom(noAuthWallet, currentOwner, toAddress, tokenId),
          `ERC721: transfer caller is not owner nor approved`
        )
      })

      it(`success to setApprovalForAll but failed safeTransferFrom if LockExternalTransfer flag is set`, async () => {
        const tokenId = await createSRRFromLicensedUser({
          issuerAddress: handlerWallet.address,
        })
        await setApprovalForAll(handlerWallet, marketplaceWallet.address, true)
        await setLockExternalTransfer(administratorWallet, tokenId, true)
        expect(await lockExternalTransfer(tokenId)).to.be.true

        const currentOwner = await startrailRegistry.ownerOf(tokenId)
        const toAddress = randomAddress()
        await assertRevert(
          safeTransferFrom(marketplaceWallet, currentOwner, toAddress, tokenId),
          `Transfer is locked for this token`
        )
      })

      it(`success to setApprovalForAll but failed safeTransferFromWithData if signer is not owner nor approved`, async () => {
        const tokenId = await createSRRFromLicensedUser({
          issuerAddress: handlerWallet.address,
        })
        await setApprovalForAll(handlerWallet, marketplaceWallet.address, true)
        const currentOwner = await startrailRegistry.ownerOf(tokenId)
        const toAddress = randomAddress()
        await assertRevert(
          safeTransferFromWithData(
            noAuthWallet,
            currentOwner,
            toAddress,
            tokenId,
            '0x'
          ),
          `ERC721: transfer caller is not owner nor approved`
        )
      })

      it(`success to setApprovalForAll but failed safeTransferFromWithData if LockExternalTransfer flag is set`, async () => {
        const tokenId = await createSRRFromLicensedUser({
          issuerAddress: handlerWallet.address,
        })
        await setApprovalForAll(handlerWallet, marketplaceWallet.address, true)
        await setLockExternalTransfer(administratorWallet, tokenId, true)
        expect(await lockExternalTransfer(tokenId)).to.equal(true)

        const currentOwner = await startrailRegistry.ownerOf(tokenId)
        const toAddress = randomAddress()

        await assertRevert(
          safeTransferFromWithData(
            marketplaceWallet,
            currentOwner,
            toAddress,
            tokenId,
            '0x'
          ),
          `Transfer is locked for this token`
        )
      })
    })
  })

  describe('transferFromWithProvenance', () => {
    it('success to transferFromWithProvenance', async () => {
      const tokenId = await createSRRFromLicensedUser()
      const fromAddress = await startrailRegistry.ownerOf(tokenId)
      const toAddress = randomAddress()

      const txReceiptTransfer = await transferFromWithProvenance(
        toAddress,
        tokenId,
        metadataDigest,
        0,
        false
      )
      assertLogProvenanceFromTxReceipt(
        txReceiptTransfer,
        metadataDigest,
        0,
        false
      )
      assertLogTransferFromTxReceipt(
        txReceiptTransfer,
        tokenId,
        fromAddress,
        toAddress,
        true
      )
      expect(await startrailRegistry.ownerOf(tokenId)).to.equal(toAddress)
    })

    it('success to transferFromWithProvenance with customHistoryId', async () => {
      const tokenId = await createSRRFromLicensedUser()
      const toAddress = randomAddress()

      const customHistoryTypeId = await addCustomHistoryType(
        customHistoryTypeName
      )
      const customHistoryId = await writeCustomHistory(
        customHistoryName,
        customHistoryTypeId
      )

      await transferFromWithProvenance(
        toAddress,
        tokenId,
        metadataDigest,
        customHistoryId,
        false
      )
      expect(await startrailRegistry.ownerOf(tokenId)).to.equal(toAddress)
    })

    it('failed transferFromWithProvenance as a MetaTx if lock external transfer is true', async () => {
      const tokenId = await createSRRFromLicensedUser()
      const toAddress = randomAddress()

      await setLockExternalTransfer(administratorWallet, tokenId, true)

      await assertRevert(
        transferFromWithProvenance(
          toAddress,
          tokenId,
          metadataDigest,
          0,
          false
        ),
        `Transfer is locked for this token`
      )
    })
  })

  // describe("approveFromAdmin", () => {
  //   it("success approve second transfer from admin", async () => {
  //     const tokenId = await createSRRFromLicensedUser();
  //     const toAddress = randomAddress();

  //     const txReceipt = await sendFromTrustedForwarder("approveFromAdmin", [
  //       toAddress,
  //       tokenId,
  //     ]);
  //     const parsedLog = startrailRegistry.interface.parseLog(txReceipt.logs[0]);
  //     // console.log(parsedLog);
  //   });

  //   it("failed approve second transfer from admin if not trusted forwarder", async () => {
  //     const tokenId = await createSRRFromLicensedUser();
  //     const toAddress = randomAddress();

  //     await assertRevert(
  //       startrailRegistry.approveFromAdmin(toAddress, tokenId),
  //       `Function can only be called through the trusted Forwarder`
  //     );
  //   });
  // });

  describe('getters', () => {
    let tokenId
    let tokenMetadataDigest
    let expectedTokenURI
    const expectedContractURI = 'https://example.com/example.json'

    before(async () => {
      tokenMetadataDigest = ethers.utils.id('some digest')
      expectedTokenURI = `https://api.startrail.io/api/v1/metadata/${tokenMetadataDigest}.json`

      tokenId = await createSRRFromLicensedUser({
        isPrimaryIssuerArg: isPrimaryIssuer,
        artistAddressArg: artistAddress,
        metadataDigestArg: tokenMetadataDigest,
        lockExternalTransferArg: false,
      })

      await startrailRegistry.setContractURI(expectedContractURI)
    })

    it('tokenURI(uint256 tokenId)', async () =>
      expect(await startrailRegistry['tokenURI(uint256)'](tokenId)).to.equal(
        expectedTokenURI
      ))

    it('tokenURI(string metadataDigest)', async () =>
      expect(
        await startrailRegistry['tokenURI(string)'](tokenMetadataDigest)
      ).to.equal(expectedTokenURI))

    it('contractURI', async () =>
      expect(await startrailRegistry.contractURI()).to.equal(
        expectedContractURI
      ))
  })

  describe('addHistory', () => {
    const HISTORIES_COUNT = 2
    const TOKENS_COUNT = 5

    const customHistoryIds = []
    const tokenIds = []
    const otherTokenIds = []

    before(async () => {
      // the following could be done in parallel by using different channel
      // ids. this would require a change to the function sending the
      // transactions.
      for (let i = 0; i < HISTORIES_COUNT; i++) {
        customHistoryIds[i] = await writeCustomHistory(
          randomText(),
          1,
          randomSha256()
        ).then((id) => BigNumber.from(id))
      }
      for (let i = 0; i < TOKENS_COUNT; i++) {
        tokenIds[i] = await createSRRFromLicensedUserWithRandomInputs(
          artistAddress
        ).then((id) => BigNumber.from(id))
      }

      for (let i = 0; i < TOKENS_COUNT; i++) {
        otherTokenIds[i] = await createSRRFromLicensedUserWithRandomInputs(
          anotherArtistAddress
        ).then((id) => BigNumber.from(id))
      }
    })

    const assertHistoryEmitted = (txReceipt) => {
      const eventArgs = decodeEventLog(
        startrailRegistry,
        'History',
        txReceipt.logs[0]
      )
      assertEqualBigNumberArrays(eventArgs.customHistoryIds, customHistoryIds)
      assertEqualBigNumberArrays(eventArgs.tokenIds, tokenIds)
    }

    it('success from issuer - 2 histories, 5 tokens', async () => {
      // We need a real LUW and forwarding with LUM connected for the modifier
      // check StartrailRegistry.onlyIssuerOrArtistOrAdministrator.
      // So the direct tx method we use elsewhere in this test file is not
      // sufficient.
      // Revert the direct trusted forwarder and admin addresses and restore
      // them again at the end of this test case
      await startrailRegistry.setTrustedForwarder(metaTxForwarder.address)
      await nameRegistry.set(
        ContractKeys.Administrator,
        administrator.contract.address
      )

      const txReceipt = await metaTxSend({
        requestTypeKey: MetaTxRequestType.StartrailRegistryAddHistory,
        requestData: {
          tokenIds,
          customHistoryIds,
        },
        fromAddress: luwAddress,
        signerWallet: handlerWallet,
      })
      assertHistoryEmitted(txReceipt)

      // restore direct forwarder and admin as in before()
      await nameRegistrySet(
        hre,
        ContractKeys.Administrator,
        administratorWallet.address
      )
      await startrailRegistry.setTrustedForwarder(
        trustedForwarderWallet.address
      )
    })

    it('success from artist - 2 histories, 5 tokens', async () => {
      // We need a real LUW and forwarding with LUM connected for the modifier
      // check StartrailRegistry.onlyIssuerOrArtistOrAdministrator.
      // So the direct tx method we use elsewhere in this test file is not
      // sufficient.
      // Revert the direct trusted forwarder and admin addresses and restore
      // them again at the end of this test case
      await startrailRegistry.setTrustedForwarder(metaTxForwarder.address)
      await nameRegistry.set(
        ContractKeys.Administrator,
        administrator.contract.address
      )

      const txReceipt = await metaTxSend({
        requestTypeKey: MetaTxRequestType.StartrailRegistryAddHistory,
        requestData: {
          tokenIds,
          customHistoryIds,
        },
        fromAddress: artistAddress,
        signerWallet: handlerWallet,
      })
      assertHistoryEmitted(txReceipt)

      // restore direct forwarder and admin as in before()
      await nameRegistrySet(
        hre,
        ContractKeys.Administrator,
        administratorWallet.address
      )
      await startrailRegistry.setTrustedForwarder(
        trustedForwarderWallet.address
      )
    })

    it('success from administrator - 2 histories, 5 tokens', async () => {
      const txReceipt = await startrailRegistry
        .addHistory(tokenIds, customHistoryIds)
        .then((txRsp) => txRsp.wait(0))
      assertHistoryEmitted(txReceipt)
    })

    it("rejects customHistoryId that doesn't exist", () =>
      assertRevert(
        startrailRegistry.addHistory(tokenIds, [...customHistoryIds, 99]),
        `The custom history id does not exist`
      ))

    it("rejects tokenId that doesn't exist", () =>
      assertRevert(
        startrailRegistry.addHistory([...tokenIds, 99], customHistoryIds),
        `one of the tokenIds does not exist`
      ))

    it('rejects tokenIds.length * customHistoryIds.length > max', async () => {
      // (501 x 2) > max [max=1000]
      const tooManyTokenIds = Array.from({ length: 501 }, () => randomTokenId())
      await assertRevert(
        startrailRegistry.addHistory(tooManyTokenIds, customHistoryIds),
        `maximum number of combined tokens and histories exceeded`
      )
    })

    it('rejects if the meta tx signer is not the Issuer or the Artist or the Startrail Administrator', async () => {
      await startrailRegistry.setTrustedForwarder(metaTxForwarder.address)
      await nameRegistry.set(
        ContractKeys.Administrator,
        administrator.contract.address
      )

      await assertRevert(
        metaTxSend({
          requestTypeKey: MetaTxRequestType.StartrailRegistryAddHistory,
          requestData: {
            tokenIds,
            customHistoryIds,
          },
          fromAddress: anotherArtistAddress,
          signerWallet: handlerWallet,
        }),
        'Caller is not the Startrail Administrator or an Issuer or an Artist'
      )

      // restore direct forwarder and admin as in before()
      await nameRegistrySet(
        hre,
        ContractKeys.Administrator,
        administratorWallet.address
      )
      await startrailRegistry.setTrustedForwarder(
        trustedForwarderWallet.address
      )
    })

    it('rejects if an SRR issued or created by other LUWs', async () => {
      await startrailRegistry.setTrustedForwarder(metaTxForwarder.address)
      await nameRegistry.set(
        ContractKeys.Administrator,
        administrator.contract.address
      )

      await assertRevert(
        metaTxSend({
          requestTypeKey: MetaTxRequestType.StartrailRegistryAddHistory,
          requestData: {
            tokenIds: _.union(tokenIds, otherTokenIds),
            customHistoryIds,
          },
          fromAddress: anotherArtistAddress,
          signerWallet: handlerWallet,
        }),
        'Caller is not the Startrail Administrator or an Issuer or an Artist'
      )

      // restore direct forwarder and admin as in before()
      await nameRegistrySet(
        hre,
        ContractKeys.Administrator,
        administratorWallet.address
      )
      await startrailRegistry.setTrustedForwarder(
        trustedForwarderWallet.address
      )
    })
  })

  describe('setMaxCombinedHistoryRecords', () => {
    it('administrator can set new max', async () => {
      const initalMax = 1000
      const newMax = 9999

      expect(await startrailRegistry.maxCombinedHistoryRecords()).to.equal(
        initalMax
      )
      await startrailRegistry
        .setMaxCombinedHistoryRecords(newMax)
        .then((txRsp) => txRsp.wait(0))
      expect(await startrailRegistry.maxCombinedHistoryRecords()).to.equal(
        newMax
      )
    })

    it('rejects if msg.sender is not the administrator', async () => {
      const startrailRegistryNotAdmin = startrailRegistry.connect(noAuthWallet)
      await assertRevert(
        startrailRegistryNotAdmin.setMaxCombinedHistoryRecords(10000),
        `Caller is not the Startrail Administrator`
      )
    })
  })

  describe('transferOwnership', () => {
    it('administrator can set new owner for opensea owner() function', async () => {
      const newOwner = noAuthWallet.address

      const txReceipt = await startrailRegistry
        .transferOwnership(newOwner)
        .then((txRsp) => txRsp.wait(0))

      const parsedLog = startrailRegistry.interface.parseLog(txReceipt.logs[0])
      expect(parsedLog.name).to.equal(`OwnershipTransferred`)
      expect(parsedLog.args.newOwner).to.equal(newOwner)

      expect(await startrailRegistry.owner()).to.equal(newOwner)
    })

    it('rejects if msg.sender is not the administrator', async () => {
      const startrailRegistryNotAdmin = startrailRegistry.connect(noAuthWallet)
      await assertRevert(
        startrailRegistryNotAdmin.transferOwnership(
          administratorWallet.address
        ),
        `Caller is not the Startrail Administrator`
      )
    })
  })

  describe('OpenSea integration', () => {
    describe('setContractURI', () => {
      it('succeeds to set', async () => {
        const newValue = 'https://example.com/newvalue.json'
        await startrailRegistry.setContractURI(newValue)
        expect(await startrailRegistry.contractURI()).to.equal(newValue)
      })

      it('fails when called by non admin', async () => {
        const setContractURI = async (signer, _contractURI) => {
          await startrailRegistry
            .connect(signer)
            [`setContractURI(string)`](_contractURI)
            .then((txRsp) => txRsp.wait(0))
        }

        await assertRevert(
          setContractURI(noAuthWallet, 'whatever'),
          'Caller is not the Startrail Administrator'
        )
      })
    })

    describe('setOpenSeaMetaTxIntegration', () => {
      const proxyAddress = randomAddress()
      const domainName = `new name`

      it('administrator can set', async () => {
        const domainSeperatorBefore = await startrailRegistry.getDomainSeperator()

        await startrailRegistry
          .setOpenSeaMetaTxIntegration(proxyAddress, domainName)
          .then((txRsp) => txRsp.wait(0))

        expect(await startrailRegistry.getOpenSeaProxyAddress()).to.equal(
          proxyAddress
        )
        expect(await startrailRegistry.getDomainSeperator()).to.not.equal(
          domainSeperatorBefore
        )

        // restore original values for other tests to keep using
        await startrailRegistry.setOpenSeaMetaTxIntegration(
          openSeaProxyWallet.address,
          `Startrail`
        )
      })

      it('rejects if msg.sender is not the administrator', async () => {
        const startrailRegistryNotAdmin = startrailRegistry.connect(
          noAuthWallet
        )
        await assertRevert(
          startrailRegistryNotAdmin.setOpenSeaMetaTxIntegration(
            proxyAddress,
            domainName
          ),
          `Caller is not the Startrail Administrator`
        )
      })
    })

    describe(`executeMetaTransaction`, () => {
      const sellerAddress = sellerWallet.address

      let buyerAddress
      let srrId

      beforeEach(async () => {
        buyerAddress = randomAddress()
        srrId = await createSRRFromLicensedUser()
        await transferFromWithProvenance(
          sellerAddress,
          srrId,
          randomSha256(),
          0,
          false
        )
      })

      it('success when details are correct', async () => {
        const {
          data: transferFromCalldata,
        } = await startrailRegistry.populateTransaction.transferFrom(
          sellerAddress,
          buyerAddress,
          srrId
        )

        const signatureSplit = await signMetaTx(
          startrailRegistry,
          sellerWallet,
          transferFromCalldata
        )

        await startrailRegistry.executeMetaTransaction(
          sellerAddress,
          transferFromCalldata,
          signatureSplit.r,
          signatureSplit.s,
          signatureSplit.v
        )

        expect(await startrailRegistry.ownerOf(srrId)).to.equal(buyerAddress)
      })

      describe(`failure 'Signer and signature do not match'`, () => {
        const sendMetaTxAndAssertRevert = async (
          nonce,
          signerWallet = sellerWallet
        ) => {
          const {
            data: transferFromCalldata,
          } = await startrailRegistry.populateTransaction.transferFrom(
            sellerAddress,
            buyerAddress,
            srrId
          )
          const signatureSplit = await signMetaTx(
            startrailRegistry,
            signerWallet,
            transferFromCalldata,
            nonce
          )
          await assertRevert(
            startrailRegistry.executeMetaTransaction(
              sellerAddress,
              transferFromCalldata,
              signatureSplit.r,
              signatureSplit.s,
              signatureSplit.v
            ),
            `Signer and signature do not match`
          )
        }

        it('when nonce too low', async () => {
          const lastNonce = (await startrailRegistry.getNonce(sellerAddress))
            .sub(1)
            .toString()
          return sendMetaTxAndAssertRevert(lastNonce, sellerWallet)
        })

        it('when nonce too high', async () => {
          const futureNonce = (await startrailRegistry.getNonce(sellerAddress))
            .add(1)
            .toString()
          return sendMetaTxAndAssertRevert(futureNonce, sellerWallet)
        })

        it('when signed by non owner', async () => {
          const nextNonce = (
            await startrailRegistry.getNonce(sellerAddress)
          ).toString()
          return sendMetaTxAndAssertRevert(nextNonce, noAuthWallet)
        })
      })
    })

    describe(`isApprovedForAll OpenSea proxy whitelisting`, () => {
      const transferFromOpenSeaProxy = async () => {
        const srrId = await createSRRFromLicensedUser()
        const srrOwnerAddress = await startrailRegistry.ownerOf(srrId)
        const buyerAddress = randomAddress()

        const startrailRegistryOpenSeaProxy = startrailRegistry.connect(
          openSeaProxyWallet
        )
        await startrailRegistryOpenSeaProxy.transferFrom(
          srrOwnerAddress,
          buyerAddress,
          srrId
        )

        expect(await startrailRegistry.ownerOf(srrId)).to.equal(buyerAddress)
      }

      it(`proxy allowed to transfer`, () => transferFromOpenSeaProxy())

      describe(`setOpenSeaApproveAllKillSwitch`, () => {
        it(`disables OpenSea whitelisting`, async () => {
          await startrailRegistry.setOpenSeaApproveAllKillSwitch(true)
          await assertRevert(
            transferFromOpenSeaProxy(),
            `ERC721: transfer caller is not owner nor approved`
          )
        })

        it(`rejects if msg.sender is not the administrator`, async () => {
          const startrailRegistryNotAdmin = startrailRegistry.connect(
            noAuthWallet
          )
          await assertRevert(
            startrailRegistryNotAdmin.setOpenSeaApproveAllKillSwitch(true),
            `Caller is not the Startrail Administrator`
          )
        })
      })
    })

    it('getChainId', () =>
      startrailRegistry
        .getChainId()
        .then((chainId) =>
          expect(chainId).to.equal(BigNumber.from(String(chainIds.hardhat)))
        ))

    it('getNonce', () =>
      startrailRegistry
        .getNonce(randomAddress())
        .then((nonce) => expect(nonce).to.equal(0)))
  })

  describe('setTrustedForwarder', () => {
    it('throws if trusted forwarder is 0 address', async () => {
      try {
        await startrailRegistry.setTrustedForwarder(ZERO_ADDRESS)
        // should fail if it does not throw
        assert.fail("should have thrown error")
      } catch (error) {
        // TODO: Update the error msg after compiler upgrade and use assertRevert
        expect(error.message).to.equal(
          'Transaction reverted without a reason string'
        )
      }
    })
  })

  describe('setNameRegistryAddress', () => {
    it('throws if nameRegistry is 0 address', async () => {
      const { startrailRegistry } = await hre.waffle.loadFixture(fixtureDefault)

      await assertRevert(
        startrailRegistry.setNameRegistryAddress(ZERO_ADDRESS),
        `nameRegistry cannot be 0 address`
      )
    })
  })
})
