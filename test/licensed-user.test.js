const hre = require('hardhat')
const { ethers } = require('ethers')

const { assert, expect, use } = require('chai')
const chaiAsPromised = require('chai-as-promised')
const { loadFixture } = require('@nomicfoundation/hardhat-network-helpers')

const { ContractKeys } = require('../startrail-common-js/contracts/types')
const { sha256 } = require('../startrail-common-js/digest/sha256')
const { zeroBytes32 } = require('../startrail-common-js/ethereum/utils')
const { Logger } = require('../startrail-common-js/logger')
const {
  MetaTxRequestType,
} = require('../startrail-common-js/meta-tx/meta-tx-request-registry')

const {
  assertExecutionSuccessEmitted,
  assertRevert,
} = require('./helpers/assertions')
const { fixtureDefault } = require('./helpers/fixtures')
const { logGasUsedFromTxRspPromise } = require('./helpers/log-gas')
const {
  generateLicensedUserCreate2Address,
  createLicensedUserWalletDirect,
  createLicensedUserWalletRequest,
  createSRRRequest,
  encodeSignExecute,
  licensedUserArrayToRecord,
} = require('./helpers/utils')
const { decodeEventLog, getWallets } = require('../utils/hardhat-helpers')
const { nameRegistrySet } = require('../utils/name-registry-set')

use(chaiAsPromised)

Logger.setSilent(true)

const wallets = getWallets(hre)
const adminEOAWallet = wallets[0]
const handlerEOAWallet = wallets[1]
const artistEOAWallet = wallets[2]
const outsiderEOAWallet = wallets[3]

describe('LicensedUserManager', () => {
  // Contract handles
  let lum

  before(async function () {
    ;({ lum } = await loadFixture(fixtureDefault))

    // For unit testing set the administrator to an EOA wallet.
    // This will allow transactions to be sent directly.
    await nameRegistrySet(
      hre,
      ContractKeys.Administrator,
      adminEOAWallet.address,
      false // don't logMsg (to console)
    )
  })

  const getLicensedUser = (lum, walletAddress) =>
    lum
      .getLicensedUser(walletAddress)
      .then((detailsArray) => licensedUserArrayToRecord(detailsArray))

  describe('createWallet', () => {
    it('should create user wallet with predictable create2 addresses', async () => {
      const walletRequest = createLicensedUserWalletRequest({
        owners: [handlerEOAWallet.address],
      })
      const createEventArgs = await createLicensedUserWalletDirect(
        hre,
        walletRequest.details,
        adminEOAWallet,
        walletRequest.salt
      )

      // Verify emitted event properties
      assert.sameMembers(createEventArgs.owners, walletRequest.details.owners)
      expect(createEventArgs.englishName).to.equal(
        walletRequest.details.englishName
      )
      expect(createEventArgs.originalName).to.equal(
        walletRequest.details.originalName
      )
      expect(createEventArgs.userType).to.equal(walletRequest.details.userType)
      expect(createEventArgs.threshold).to.equal(
        walletRequest.details.threshold
      )
      expect(createEventArgs.salt).to.equal(walletRequest.salt)

      // Verify the Create2 address
      const walletAddress = createEventArgs.walletAddress

      const expectedAddress = await generateLicensedUserCreate2Address(
        lum.address,
        walletRequest.salt
      )
      expect(walletAddress).to.equal(expectedAddress)

      // Verify the luw details from state
      const walletDetails = await getLicensedUser(lum, walletAddress)

      expect(walletDetails.englishName).to.equal(
        walletRequest.details.englishName
      )
      expect(walletDetails.originalName).to.equal(
        walletRequest.details.originalName
      )
      expect(walletDetails.userType).to.equal(walletRequest.details.userType)
      expect(walletDetails.active).to.be.true

      expect(walletDetails.threshold).to.equal(walletRequest.details.threshold)
      expect(await lum.getThreshold(walletAddress)).to.equal(
        walletRequest.details.threshold
      )

      assert.sameMembers(walletRequest.details.owners, walletDetails.owners)
      assert.sameMembers(
        await lum.getOwners(walletAddress),
        walletRequest.details.owners
      )

      // Verify getters
      expect(await lum.isActiveWallet(walletAddress)).to.equal(true)
      expect(await lum.isSingleOwner(walletAddress)).to.equal(true)
      expect(await lum.walletExists(walletAddress)).to.equal(true)
    })

    it('should reject create multi from non-admin wallet', () => {
      const walletRequest = createLicensedUserWalletRequest({
        owners: [handlerEOAWallet.address],
      })
      const lumHandler = lum.connect(handlerEOAWallet)
      return assertRevert(
        lumHandler.createWallet(...Object.values(walletRequest)),
        `Caller is not the Startrail Administrator`
      )
    })
  })

  describe('createWalletFromMigration', () => {
    const createFromMigrationRequest = (overrideProps) => {
      const createRequest = createLicensedUserWalletRequest({
        ...overrideProps,
      })
      delete createRequest.salt // salt not used for migration creates

      createRequest.contractAddress = ethers.Wallet.createRandom().address
      createRequest.originChain = 'eip155:1'
      createRequest.originTimestamp = ethers.BigNumber.from(Date.now())

      return createRequest
    }

    const createFromMigration = async (createRequest) =>
      lum
        .createWalletFromMigration(
          createRequest.details,
          createRequest.contractAddress,
          createRequest.originChain,
          createRequest.originTimestamp
        )
        .then((txRsp) => txRsp.wait(0))
        .then((txReceipt) =>
          decodeEventLog(lum, 'CreateLicensedUserWallet', txReceipt.logs[0])
        )

    it('should create multi user wallet from migration with known address', async () => {
      const walletRequest = createFromMigrationRequest({
        owners: [handlerEOAWallet.address],
      })

      const createEventArgs = await createFromMigration(walletRequest)
      expect(createEventArgs.salt).to.equal(zeroBytes32)

      const walletDetails = await getLicensedUser(
        lum,
        walletRequest.contractAddress
      )

      expect(walletDetails.originalName).to.equal(
        walletRequest.details.originalName
      )
      expect(walletDetails.englishName).to.equal(
        walletRequest.details.englishName
      )
      expect(walletDetails.userType).to.equal(walletRequest.details.userType)
      expect(walletDetails.active).to.be.true
      expect(await lum.getThreshold(walletRequest.contractAddress)).to.equal(
        walletRequest.details.threshold
      )
      assert.sameMembers(
        await lum.getOwners(walletRequest.contractAddress),
        walletRequest.details.owners
      )
    })

    it('should reject create multi from migration from non-admin wallet', () => {
      const walletRequest = createFromMigrationRequest({
        owners: [handlerEOAWallet.address],
      })
      const lumHandler = lum.connect(handlerEOAWallet)
      return assertRevert(
        lumHandler.createWalletFromMigration(
          walletRequest.details,
          walletRequest.contractAddress,
          walletRequest.originChain,
          walletRequest.originTimestamp
        ),
        `Caller is not the Startrail Administrator`
      )
    })
  })

  describe('executeTransactionLUW', () => {
    //
    // Dynamically generate test case functions from these sets of
    // test input data
    //

    const EXEC_TEST_CASES = [
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
          MetaTxRequestType.StartrailRegistryCreateSRRWithLockExternalTransfer

        beforeEach(async () => {
          // Execution request props
          testCase.txRequestData = createSRRRequest()
        })

        it(`should execute transaction`, async () => {
          const txRsp2 = await encodeSignExecute({
            requestTypeKey: requestType,
            fromAddress: testCase.luAddress,
            requestData: testCase.txRequestData,
            signerWallets: testCase.passSigners,
          })
          await assertExecutionSuccessEmitted(txRsp2)
          await logGasUsedFromTxRspPromise(txRsp2)
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
      const issueRequest = createSRRRequest()
      const tokenId = await encodeSignExecute({
        requestTypeKey:
          MetaTxRequestType.StartrailRegistryCreateSRRWithLockExternalTransfer,
        fromAddress: fromAddress,
        requestData: issueRequest,
        signerWallets: [handlerEOAWallet],
      })
        .then((txRsp) => txRsp.wait())
        .then((txReceipt) => ethers.BigNumber.from(txReceipt.logs[0].topics[3]))

      const requestType =
        MetaTxRequestType.StartrailRegistryApproveSRRByCommitmentV2
      const approveRequestData = {
        tokenId: tokenId.toString(),
        commitment: ethers.utils.id('a-secret'), // bytes32
        historyMetadataHash: sha256('some json'), // string
      }

      const txRsp = await encodeSignExecute({
        requestTypeKey: requestType,
        fromAddress: fromAddress,
        requestData: approveRequestData,
        signerWallets: [handlerEOAWallet],
      })
      await assertExecutionSuccessEmitted(txRsp)
      await logGasUsedFromTxRspPromise(txRsp)
    })
  })

  describe('addOwner', () => {
    const owner1 = handlerEOAWallet
    const owner2 = artistEOAWallet
    const threshold = 1

    let luwAddress
    let luDetails
    let addOwnerRequest

    beforeEach(async () => {
      const { walletAddress } = await createLicensedUserWalletDirect(
        hre,
        {
          owners: [owner1.address],
        },
        adminEOAWallet
      )
      luwAddress = walletAddress
      luDetails = await lum.getLicensedUser(luwAddress)
      addOwnerRequest = {
        wallet: luwAddress,
        owner: owner2.address,
        threshold,
      }
    })

    const assertAddOwnerAndSingleToMulti = async () => {
      // Assert new multi has correct details
      const walletDetails = await getLicensedUser(lum, luwAddress)

      const expectedNewOwnerList = [owner1.address, addOwnerRequest.owner]
      assert.sameMembers(walletDetails.owners, expectedNewOwnerList)
      assert.sameMembers(await lum.getOwners(luwAddress), expectedNewOwnerList)

      expect(walletDetails.threshold).to.equal(threshold)
      expect(await lum.getThreshold(luwAddress)).to.equal(threshold)

      expect(await lum.isActiveWallet(luwAddress)).to.equal(true)
      expect(await lum.isSingleOwner(luwAddress)).to.equal(false)
      expect(await lum.walletExists(luwAddress)).to.equal(true)

      // remaining details unchanged:
      expect(walletDetails.originalName).to.equal(luDetails.originalName)
      expect(walletDetails.englishName).to.equal(luDetails.englishName)
      expect(walletDetails.userType).to.equal(luDetails.userType)
      expect(walletDetails.active).to.be.true
    }

    it('should convert a single to a multi wallet', async () => {
      // triggers LUM.singleToMulti()
      await encodeSignExecute({
        requestTypeKey: MetaTxRequestType.WalletAddOwner,
        fromAddress: luwAddress,
        requestData: addOwnerRequest,
        signerWallets: [owner1],
      })
      await assertAddOwnerAndSingleToMulti()
    })

    it('should succeed when sent directly from admin', async () => {
      // lum handle has admin EOA (owner 0) so this should succeed
      await lum.addOwner(...Object.values(addOwnerRequest))
      await assertAddOwnerAndSingleToMulti()
    })

    it('should reject attempt to convert user by a non owner', () =>
      assertRevert(
        encodeSignExecute({
          requestTypeKey: MetaTxRequestType.WalletAddOwner,
          fromAddress: luwAddress,
          requestData: addOwnerRequest,
          signerWallets: [owner2],
        }),
        `Signer in signatures is not an owner of this wallet`
      ))

    it('should reject direct call from non admin', () => {
      const lumFromNonAdmin = lum.connect(outsiderEOAWallet)
      return assertRevert(
        lumFromNonAdmin.addOwner(...Object.values(addOwnerRequest)),
        `Wallet function can only be called from trusted forwarder or admin`
      )
    })
  })

  describe('update wallet details', () => {
    //
    // Dynamically generate test case functions from these sets of
    // test input data
    //

    const SET_NAME_TEST_CASES = [
      {
        metaTxRequestType: MetaTxRequestType.WalletSetEnglishName,
        fieldName: 'englishName',
        functionName: 'setEnglishName',
      },
      {
        metaTxRequestType: MetaTxRequestType.WalletSetOriginalName,
        fieldName: 'originalName',
        functionName: 'setOriginalName',
      },
    ]

    SET_NAME_TEST_CASES.forEach(async (testCase) => {
      describe(testCase.functionName, () => {
        const metaTxRequestType = testCase.metaTxRequestType

        const owner1 = handlerEOAWallet
        const owner2 = artistEOAWallet

        let luwAddress
        let setNameRequest

        beforeEach(async () => {
          const { walletAddress } = await createLicensedUserWalletDirect(
            hre,
            {
              owners: [owner1.address],
            },
            adminEOAWallet
          )
          luwAddress = walletAddress
          setNameRequest = {
            wallet: luwAddress,
            name: 'new name!',
          }
        })

        const assertUpdateWalletDetail = async (txReceipt) => {
          // check event
          const updateEvent = decodeEventLog(
            lum,
            'UpdateLicensedUserDetail',
            txReceipt.logs[0]
          )
          expect(updateEvent[0]).to.equal(luwAddress)
          expect(updateEvent[1]).to.equal(testCase.fieldName)
          expect(updateEvent[2]).to.equal(setNameRequest.name)

          // check state
          const luDetails = await getLicensedUser(lum, luwAddress)
          expect(luDetails[testCase.fieldName]).to.equal(setNameRequest.name)
        }

        it(`should succeed when authorized by wallet owner`, async () => {
          const txReceipt = await encodeSignExecute({
            requestTypeKey: metaTxRequestType,
            fromAddress: luwAddress,
            requestData: setNameRequest,
            signerWallets: [owner1],
          }).then((tx) => tx.wait())
          await assertUpdateWalletDetail(txReceipt)
        })

        it(`should succeed when called by admin`, async () => {
          const txReceipt = await lum[testCase.functionName](
            luwAddress,
            setNameRequest.name
          ).then((tx) => tx.wait())
          await assertUpdateWalletDetail(txReceipt)
        })

        it('should reject attempt with existing LU but signaure from a non owner', () =>
          assertRevert(
            encodeSignExecute({
              requestTypeKey: metaTxRequestType,
              fromAddress: luwAddress,
              requestData: setNameRequest,
              signerWallets: [owner2],
            }),
            `Signer in signatures is not an owner of this wallet`
          ))

        it('should reject direct call from non admin', () => {
          const lumFromNonAdmin = lum.connect(outsiderEOAWallet)
          return assertRevert(
            lumFromNonAdmin[testCase.functionName](
              ...Object.values(setNameRequest)
            ),
            `Wallet function can only be called from trusted forwarder or admin`
          )
        })
      })
    })
  })
})
