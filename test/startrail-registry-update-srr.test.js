const hre = require('hardhat')

const { expect, use } = require('chai')
const chaiAsPromised = require('chai-as-promised')

const { MetaTxRequestType } = require('../startrail-common-js/meta-tx/types')
const { randomAddress } = require('../startrail-common-js/test-helpers/test-utils')

const { assertRevert } = require('./helpers/assertions')
const { fixtureDefault } = require('./helpers/fixtures')
const { lumCreateWallet } = require('../utils/lum-create-wallet')
const {
  decodeEventLog,
  getAdministratorInstance,
  getWallets,
} = require('../utils/hardhat-helpers')
const { randomSha256 } = require('./helpers/utils')
const { metaTxSend } = require('../utils/meta-tx-send')

use(chaiAsPromised)

// Signing wallets
const wallets = getWallets(hre)
const noAuthWallet = wallets[1]
const ownerWallet = wallets[2]

// Shared test data
const isPrimaryIssuer = true
const artistAddress = randomAddress()

let startrailRegistry
let luwHandler, luwArtist, anotherArtist
let metadataDigest

describe('StartrailRegistry SRR updates', () => {
  before(async () => {
    // For updateSRR and updateSRRMetadata use the full contract deployment
    // without swapping out contracts with EOAs. This is required because for
    // updateSRR the StartrailRegistry contract calls back to LUM to check
    // the LU is valid.
    ;({ startrailRegistry } = await hre.waffle.loadFixture(fixtureDefault))

    const random32ByteHash = () => hre.ethers.utils.id(String(Math.random()))

    luwArtist = await lumCreateWallet({
      owners: [ownerWallet.address],
      threshold: 1,
      englishName: 'Test Artist English',
      originalName: 'test Artist Original',
      userType: 'artist',
      salt: random32ByteHash(),
    })

    luwHandler = await lumCreateWallet({
      owners: [ownerWallet.address],
      threshold: 1,
      englishName: 'Test Handler English',
      originalName: 'Test Handler Original',
      userType: 'handler',
      salt: random32ByteHash(),
    })

    anotherArtist = await lumCreateWallet({
      owners: [ownerWallet.address],
      threshold: 1,
      englishName: 'Test Another Artist English',
      originalName: 'Test Another Artist Original',
      userType: 'artist',
      salt: random32ByteHash(),
    })
  })

  beforeEach(async () => {
    // Setup Test Data
    metadataDigest = randomSha256()
  })

  const createSRRMetaTx = async () => {
    const createSRRTxReceipt = await metaTxSend({
      requestTypeKey:
        MetaTxRequestType.StartrailRegistryCreateSRRWithLockExternalTransfer,
      requestData: {
        isPrimaryIssuer,
        artistAddress: luwArtist,
        metadataDigest,
        lockExternalTransfer: false,
      },
      fromAddress: luwHandler,
      signerWallet: ownerWallet,
    })

    // return tokenId
    return decodeEventLog(
      startrailRegistry,
      'CreateSRR(uint256,(bool,address,address),bytes32,bool)',
      createSRRTxReceipt.logs[1]
    )[0].toNumber()
  }

  describe('updateSRR', () => {
    it('called by an Issuer', async () => {
      // Create SRR first
      const tokenId = await createSRRMetaTx()

      // Update SRR
      const newArtistAddress = randomAddress()
      const newIsPrimaryIssuer = !isPrimaryIssuer
      const updateSRRTxReceipt = await metaTxSend({
        requestTypeKey: MetaTxRequestType.StartrailRegistryUpdateSRR,
        requestData: {
          tokenId,
          isPrimaryIssuer: newIsPrimaryIssuer,
          artistAddress: newArtistAddress,
        },
        fromAddress: luwHandler,
        signerWallet: ownerWallet,
      })

      const updateEventArgs = decodeEventLog(
        startrailRegistry,
        'UpdateSRR(uint256,bool,address,address)',
        updateSRRTxReceipt.logs[0]
      )
      expect(updateEventArgs[0]).to.equal(tokenId)
      expect(updateEventArgs[1]).to.equal(newIsPrimaryIssuer)
      expect(updateEventArgs[2]).to.equal(newArtistAddress)
      expect(updateEventArgs[3]).to.equal(luwHandler)

      const srrUpdateData = await startrailRegistry.getSRR(tokenId)
      expect(srrUpdateData[0][0]).to.equal(newIsPrimaryIssuer)
      expect(srrUpdateData[0][1]).to.equal(newArtistAddress)
    })

    it('called from the Administrator contract', async () => {
      // Create SRR first
      const tokenId = await createSRRMetaTx()

      // Update SRR
      const newArtistAddress = randomAddress()
      const newIsPrimaryIssuer = !isPrimaryIssuer

      const {
        data: updateEncoded,
      } = await startrailRegistry.populateTransaction.updateSRR(
        tokenId,
        newIsPrimaryIssuer,
        newArtistAddress
      )

      const admin = await getAdministratorInstance(hre)
      const updateSRRTxReceipt = await admin.execTransaction({
        to: startrailRegistry.address,
        data: updateEncoded,
        waitConfirmed: true,
      })

      const updateEventArgs = decodeEventLog(
        startrailRegistry,
        'UpdateSRR(uint256,bool,address,address)',
        updateSRRTxReceipt.logs[0]
      )
      expect(updateEventArgs[0]).to.equal(tokenId)
      expect(updateEventArgs[1]).to.equal(newIsPrimaryIssuer)
      expect(updateEventArgs[2]).to.equal(newArtistAddress)
      expect(updateEventArgs[3]).to.equal(admin.contract.address)

      const srrUpdateData = await startrailRegistry.getSRR(tokenId)
      expect(srrUpdateData[0][0]).to.equal(newIsPrimaryIssuer)
      expect(srrUpdateData[0][1]).to.equal(newArtistAddress)
    })

    it('rejects if tokenId does not exist', async () =>
      assertRevert(
        metaTxSend({
          requestTypeKey: MetaTxRequestType.StartrailRegistryUpdateSRR,
          requestData: {
            tokenId: 123456,
            isPrimaryIssuer: true,
            artistAddress: randomAddress(),
          },
          fromAddress: luwHandler,
          signerWallet: ownerWallet,
        }),
        `The tokenId does not exist`
      ))

    it('rejects if msg.sender is not the Startrail Administrator or the Issuer or the Artist', async () => {
      // Create SRR first
      const tokenId = await createSRRMetaTx()

      const startrailRegistryNotTrusted = startrailRegistry.connect(
        noAuthWallet
      )
      return assertRevert(
        startrailRegistryNotTrusted.updateSRR(
          tokenId,
          isPrimaryIssuer,
          artistAddress
        ),
        `Caller is not the Startrail Administrator or an Issuer or an Artist`
      )
    })

    it('rejects if the meta tx signer is not the Issuer or the Artist or the Startrail Administrator', async () => {
      // Create SRR first
      const tokenId = await createSRRMetaTx()

      // Update SRR

      return assertRevert(
        metaTxSend({
          requestTypeKey: MetaTxRequestType.StartrailRegistryUpdateSRR,
          requestData: {
            tokenId,
            isPrimaryIssuer: !isPrimaryIssuer,
            artistAddress: randomAddress(),
          },
          fromAddress: anotherArtist,
          signerWallet: ownerWallet,
        }),
        `Caller is not the Startrail Administrator or an Issuer or an Artist`
      )
    })
  })

  describe('updateSRRMetadata', () => {
    it('called by an Issuer', async () => {
      // Create SRR first
      const tokenId = await createSRRMetaTx()

      // Update SRR metadata tx
      const newMetadataDigest = randomSha256()
      const updateSRRMetadataTxReceipt = await metaTxSend({
        requestTypeKey: MetaTxRequestType.StartrailRegistryUpdateSRRMetadata,
        requestData: {
          tokenId,
          metadataDigest: newMetadataDigest,
        },
        fromAddress: luwHandler,
        signerWallet: ownerWallet,
      })

      const srrUpdateData = await startrailRegistry.getSRR(tokenId)
      expect(srrUpdateData[1]).to.equal(newMetadataDigest)

      const updateEventArgs = decodeEventLog(
        startrailRegistry,
        'UpdateSRRMetadataDigest',
        updateSRRMetadataTxReceipt.logs[0]
      )
      expect(updateEventArgs[0]).to.equal(tokenId)
      expect(updateEventArgs[1]).to.equal(newMetadataDigest)
    })

    it('called by an Artist', async () => {
      // Create SRR first
      const tokenId = await createSRRMetaTx()

      // Update SRR metadata tx
      const newMetadataDigest = randomSha256()
      const updateSRRMetadataTxReceipt = await metaTxSend({
        requestTypeKey: MetaTxRequestType.StartrailRegistryUpdateSRRMetadata,
        requestData: {
          tokenId,
          metadataDigest: newMetadataDigest,
        },
        fromAddress: luwArtist,
        signerWallet: ownerWallet,
      })

      const srrUpdateData = await startrailRegistry.getSRR(tokenId)
      expect(srrUpdateData[1]).to.equal(newMetadataDigest)

      const updateEventArgs = decodeEventLog(
        startrailRegistry,
        'UpdateSRRMetadataDigest',
        updateSRRMetadataTxReceipt.logs[0]
      )
      expect(updateEventArgs[0]).to.equal(tokenId)
      expect(updateEventArgs[1]).to.equal(newMetadataDigest)
    })

    it('called from the Administrator contract', async () => {
      // Create SRR first
      const tokenId = await createSRRMetaTx()

      // Update SRR metadata tx
      const newMetadataDigest = randomSha256()
      const {
        data: updateEncoded,
      } = await startrailRegistry.populateTransaction.updateSRRMetadata(
        tokenId,
        newMetadataDigest
      )

      const admin = await getAdministratorInstance(hre)
      const updateSRRMetadataTxReceipt = await admin.execTransaction({
        to: startrailRegistry.address,
        data: updateEncoded,
        waitConfirmed: true,
      })

      const srrUpdateData = await startrailRegistry.getSRR(tokenId)
      expect(srrUpdateData[1]).to.equal(newMetadataDigest)

      const updateEventArgs = decodeEventLog(
        startrailRegistry,
        'UpdateSRRMetadataDigest',
        updateSRRMetadataTxReceipt.logs[0]
      )
      expect(updateEventArgs[0]).to.equal(tokenId)
      expect(updateEventArgs[1]).to.equal(newMetadataDigest)
    })

    it('rejects if tokenId does not exist', () =>
      assertRevert(
        metaTxSend({
          requestTypeKey: MetaTxRequestType.StartrailRegistryUpdateSRRMetadata,
          requestData: {
            tokenId: 123456,
            metadataDigest: randomSha256(),
          },
          fromAddress: luwHandler,
          signerWallet: ownerWallet,
        }),
        `The tokenId does not exist`
      ))

    it('rejects if msg.sender is not an Issuer (via forwarder) or An Artist or the Admin contract', async () => {
      const startrailRegistryNotTrusted = startrailRegistry.connect(
        noAuthWallet
      )

      const tokenId = await createSRRMetaTx()

      return assertRevert(
        startrailRegistryNotTrusted.updateSRRMetadata(tokenId, metadataDigest),
        `Caller is not the Startrail Administrator or an Issuer or an Artist`
      )
    })

    it('rejects if the meta tx signer is not the Issuer or the Artist or the Startrail Administrator', async () => {
      // Create SRR first
      const tokenId = await createSRRMetaTx()

      const newMetadataDigest = randomSha256()

      return assertRevert(
        metaTxSend({
          requestTypeKey: MetaTxRequestType.StartrailRegistryUpdateSRRMetadata,
          requestData: {
            tokenId,
            metadataDigest: newMetadataDigest,
          },
          fromAddress: anotherArtist,
          signerWallet: ownerWallet,
        }),
        `Caller is not the Startrail Administrator or an Issuer or an Artist`
      )
    })
  })
})
