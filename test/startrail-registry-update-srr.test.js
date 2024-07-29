const hre = require('hardhat')

const { expect, use } = require('chai')
const chaiAsPromised = require('chai-as-promised')
const { loadFixture } = require('@nomicfoundation/hardhat-network-helpers')
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
const { randomSha256, randomCID, ZERO_ADDRESS, ZERO_METADATA_DIGEST } = require('./helpers/utils')
const { metaTxSend } = require('../utils/meta-tx-send')

use(chaiAsPromised)

// Signing wallets
const wallets = getWallets(hre)
const noAuthWallet = wallets[1]
const ownerWallet = wallets[2]

// Shared test data
const isPrimaryIssuer = true
const artistAddress = randomAddress()

const defaultRoyaltyReceiver = randomAddress()
const defaultRoyaltyBasisPoints = 1_570 // 15.7%

let startrailRegistry
let luwHandler, luwArtist, anotherArtist
let metadataDigest

describe('StartrailRegistry SRR updates', () => {
  before(async () => {
    // For updateSRR and updateSRRMetadata use the full contract deployment
    // without swapping out contracts with EOAs. This is required because for
    // updateSRR the StartrailRegistry contract calls back to LUM to check
    // the LU is valid.
    ; ({ startrailRegistry } = await loadFixture(fixtureDefault))

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

  const createSRRMetaTx = async (royaltyReceiver = ZERO_ADDRESS, royaltyBasisPoints = 0, recipient = ZERO_ADDRESS, metadataCID = null) => {
    const createSRRTxReceipt = await metaTxSend({
      requestTypeKey:
        MetaTxRequestType.StartrailRegistryCreateSRRFromLicensedUserWithIPFSAndRoyalty,
      requestData: {
        isPrimaryIssuer,
        artistAddress: luwArtist,
        metadataCID: metadataCID || await randomCID(),
        lockExternalTransfer: false,
        to: recipient,
        royaltyReceiver,
        royaltyBasisPoints
      },
      fromAddress: luwHandler,
      signerWallet: ownerWallet,
    })

    // return tokenId
    return decodeEventLog(
      startrailRegistry,
      'CreateSRR(uint256,(bool,address,address),string,bool)',
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

      const { data: updateEncoded } =
        await startrailRegistry.populateTransaction.updateSRR(
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

      const startrailRegistryNotTrusted =
        startrailRegistry.connect(noAuthWallet)
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

  describe('updateSRRMetadataWithCid', () => {
    it('called by an Issuer', async () => {
      // Create SRR first
      const tokenId = await createSRRMetaTx()

      // Update SRR metadata tx
      const newCid = await randomCID()
      const updateSRRMetadataTxReceipt = await metaTxSend({
        requestTypeKey:
          MetaTxRequestType.StartrailRegistryUpdateSRRMetadataWithCid,
        requestData: {
          tokenId,
          metadataCID: newCid,
        },
        fromAddress: luwHandler,
        signerWallet: ownerWallet,
      })

      const srrUpdateData = await startrailRegistry.getSRR(tokenId)
      expect(srrUpdateData[1]).to.equal(ZERO_METADATA_DIGEST) // metadata digest
      expect(srrUpdateData[2]).to.equal(newCid) // metadata cid

      const updateEventArgs = decodeEventLog(
        startrailRegistry,
        'UpdateSRRMetadataCID(uint256,string)',
        updateSRRMetadataTxReceipt.logs[0]
      )
      expect(updateEventArgs[0]).to.equal(tokenId)
      expect(updateEventArgs[1]).to.equal(newCid)
    })

    it('called by an Artist', async () => {
      // Create SRR first
      const tokenId = await createSRRMetaTx()

      // Update SRR metadata tx
      const newCid = await randomCID()
      const updateSRRMetadataTxReceipt = await metaTxSend({
        requestTypeKey:
          MetaTxRequestType.StartrailRegistryUpdateSRRMetadataWithCid,
        requestData: {
          tokenId,
          metadataCID: newCid,
        },
        fromAddress: luwArtist,
        signerWallet: ownerWallet,
      })

      const updateEventArgs = decodeEventLog(
        startrailRegistry,
        'UpdateSRRMetadataCID(uint256,string)',
        updateSRRMetadataTxReceipt.logs[0]
      )
      expect(updateEventArgs[0]).to.equal(tokenId)
      expect(updateEventArgs[1]).to.equal(newCid)
    })

    it('called from the Administrator contract', async () => {
      // Create SRR first
      const tokenId = await createSRRMetaTx()

      // Update SRR metadata tx
      const newCid = await randomCID()
      const { data: updateEncoded } =
        await startrailRegistry.populateTransaction[
          `updateSRRMetadata(uint256,string)`
        ](tokenId, newCid)

      const admin = await getAdministratorInstance(hre)
      const updateSRRMetadataTxReceipt = await admin.execTransaction({
        to: startrailRegistry.address,
        data: updateEncoded,
        waitConfirmed: true,
      })

      const updateEventArgs = decodeEventLog(
        startrailRegistry,
        'UpdateSRRMetadataCID(uint256,string)',
        updateSRRMetadataTxReceipt.logs[0]
      )
      expect(updateEventArgs[0]).to.equal(tokenId)
      expect(updateEventArgs[1]).to.equal(newCid)
    })

    it('update royalty', async () => {
      // Create SRR first
      const tokenId = await createSRRMetaTx()

      // Update SRR metadata tx
      const newCid = await randomCID()
      const updateSRRMetadataTxReceipt = await metaTxSend({
        requestTypeKey:
          MetaTxRequestType.StartrailRegistryUpdateSRRMetadataWithCid,
        requestData: {
          tokenId,
          metadataCID: newCid,
        },
        fromAddress: luwArtist,
        signerWallet: ownerWallet,
      })

      const updateEventArgs = decodeEventLog(
        startrailRegistry,
        'UpdateSRRMetadataCID(uint256,string)',
        updateSRRMetadataTxReceipt.logs[0]
      )
      expect(updateEventArgs[0]).to.equal(tokenId)
      expect(updateEventArgs[1]).to.equal(newCid)
    })

    it('rejects if tokenId does not exist', async () => {
      const newCid = await randomCID()
      assertRevert(
        metaTxSend({
          requestTypeKey:
            MetaTxRequestType.StartrailRegistryUpdateSRRMetadataWithCid,
          requestData: {
            tokenId: 123456,
            metadataCID: newCid,
          },
          fromAddress: luwHandler,
          signerWallet: ownerWallet,
        }),
        `The tokenId does not exist`
      )
    })

    it('rejects if msg.sender is not an Issuer (via forwarder) or An Artist or the Admin contract', async () => {
      const tokenId = await createSRRMetaTx()
      const startrailRegistryNotTrusted =
        startrailRegistry.connect(noAuthWallet)

      const newCid = await randomCID()

      return assertRevert(
        startrailRegistryNotTrusted[`updateSRRMetadata(uint256,string)`](
          tokenId,
          newCid
        ),
        `Caller is not the Startrail Administrator or an Issuer or an Artist`
      )
    })

    it('rejects if the meta tx signer is not the Issuer or the Artist or the Startrail Administrator', async () => {
      // Create SRR first
      const tokenId = await createSRRMetaTx()
      const newCid = await randomCID()

      return assertRevert(
        metaTxSend({
          requestTypeKey:
            MetaTxRequestType.StartrailRegistryUpdateSRRMetadataWithCid,
          requestData: {
            tokenId,
            metadataCID: newCid,
          },
          fromAddress: anotherArtist,
          signerWallet: ownerWallet,
        }),
        `Caller is not the Startrail Administrator or an Issuer or an Artist`
      )
    })
  })

  describe('updateSRRRoyalty', () => {
    it('called by an Issuer', async () => {
      // Create SRR first
      const tokenId = await createSRRMetaTx(defaultRoyaltyReceiver, defaultRoyaltyBasisPoints)

      // Update SRR royalty tx
      const royaltyReceiver = randomAddress()
      const royaltyBasisPoints = 500 // 5%
      const updateSRRRoyaltyTxReceipt = await metaTxSend({
        requestTypeKey: MetaTxRequestType.StartrailRegistryUpdateSRRRoyalty,
        requestData: {
          tokenId,
          royaltyReceiver,
          royaltyBasisPoints,
        },
        fromAddress: luwHandler,
        signerWallet: ownerWallet,
      })

      const royaltyEvent = decodeEventLog(
        startrailRegistry,
        'RoyaltiesSet(uint256,(address,uint16))',
        updateSRRRoyaltyTxReceipt.logs[0]
      )[1]

      expect(royaltyEvent[0]).to.equal(royaltyReceiver)
      expect(royaltyEvent[1]).to.equal(royaltyBasisPoints)
    })

    it('called by an Artist', async () => {
      // Create SRR first
      const tokenId = await createSRRMetaTx(defaultRoyaltyReceiver, defaultRoyaltyBasisPoints)

      // Update SRR royalty tx
      const royaltyReceiver = randomAddress()
      const royaltyBasisPoints = 500 // 5%
      const updateSRRRoyaltyTxReceipt = await metaTxSend({
        requestTypeKey: MetaTxRequestType.StartrailRegistryUpdateSRRRoyalty,
        requestData: {
          tokenId,
          royaltyReceiver,
          royaltyBasisPoints,
        },
        fromAddress: luwArtist,
        signerWallet: ownerWallet,
      })

      const royaltyEvent = decodeEventLog(
        startrailRegistry,
        'RoyaltiesSet(uint256,(address,uint16))',
        updateSRRRoyaltyTxReceipt.logs[0]
      )[1]

      expect(royaltyEvent[0]).to.equal(royaltyReceiver)
      expect(royaltyEvent[1]).to.equal(royaltyBasisPoints)
    })

    it('called from the Administrator contract', async () => {
      // Create SRR first
      const tokenId = await createSRRMetaTx(defaultRoyaltyReceiver, defaultRoyaltyBasisPoints)

      // Update SRR metadata tx
      const royaltyReceiver = randomAddress()
      const royaltyBasisPoints = 500 // 5%
      const { data: updateEncoded } =
        await startrailRegistry.populateTransaction[
          `updateSRRRoyalty(uint256,address,uint16)`
        ](tokenId, royaltyReceiver, royaltyBasisPoints)

      const admin = await getAdministratorInstance(hre)
      const updateSRRRoyaltyTxReceipt = await admin.execTransaction({
        to: startrailRegistry.address,
        data: updateEncoded,
        waitConfirmed: true,
      })

      const royaltyEvent = decodeEventLog(
        startrailRegistry,
        'RoyaltiesSet(uint256,(address,uint16))',
        updateSRRRoyaltyTxReceipt.logs[0]
      )[1]

      expect(royaltyEvent[0]).to.equal(royaltyReceiver)
      expect(royaltyEvent[1]).to.equal(royaltyBasisPoints)
    })

    it('rejects if tokenId does not exist', async () => {
      assertRevert(
        metaTxSend({
          requestTypeKey: MetaTxRequestType.StartrailRegistryUpdateSRRRoyalty,
          requestData: {
            tokenId: 123456,
            royaltyReceiver: randomAddress(),
            royaltyBasisPoints: 500, // 5%
          },
          fromAddress: luwHandler,
          signerWallet: ownerWallet,
        }),
        `The tokenId does not exist`
      )
    })

    it('rejects if msg.sender is not an Issuer (via forwarder) or An Artist or the Admin contract', async () => {
      const tokenId = await createSRRMetaTx()
      const startrailRegistryNotTrusted =
        startrailRegistry.connect(noAuthWallet)

      const royaltyReceiver = randomAddress()
      const royaltyBasisPoints = 500 // 5%

      return assertRevert(
        startrailRegistryNotTrusted[`updateSRRRoyalty(uint256,address,uint16)`](
          tokenId,
          royaltyReceiver,
          royaltyBasisPoints
        ),
        `Caller is not the Startrail Administrator or an Issuer or an Artist`
      )
    })

    it('rejects if the meta tx signer is not the Issuer or the Artist or the Startrail Administrator', async () => {
      // Create SRR first
      const tokenId = await createSRRMetaTx(defaultRoyaltyReceiver, defaultRoyaltyBasisPoints)
      const royaltyReceiver = randomAddress()
      const royaltyBasisPoints = 500 // 5%
      return assertRevert(
        metaTxSend({
          requestTypeKey: MetaTxRequestType.StartrailRegistryUpdateSRRRoyalty,
          requestData: {
            tokenId,
            royaltyReceiver,
            royaltyBasisPoints,
          },
          fromAddress: anotherArtist,
          signerWallet: ownerWallet,
        }),
        `Caller is not the Startrail Administrator or an Issuer or an Artist`
      )
    })

    it('rejects if royalty basis points is greater than 10000 (100%)', async () => {
      // Create SRR first
      const tokenId = await createSRRMetaTx(defaultRoyaltyReceiver, defaultRoyaltyBasisPoints)
      const royaltyReceiver = randomAddress()
      const royaltyBasisPoints = 11000 // 110%
      await assertRevert(
        metaTxSend({
          requestTypeKey: MetaTxRequestType.StartrailRegistryUpdateSRRRoyalty,
          requestData: {
            tokenId,
            royaltyReceiver,
            royaltyBasisPoints,
          },
          fromAddress: luwHandler,
          signerWallet: ownerWallet,
        }),
        'ERC2981: royalty fee will exceed salePrice'
      )
    })

    it('rejects if royalty receiver address is zero address', async () => {
      // Create SRR first
      const tokenId = await createSRRMetaTx(defaultRoyaltyReceiver, defaultRoyaltyBasisPoints)
      const royaltyReceiver = ZERO_ADDRESS
      const royaltyBasisPoints = 500 // 5%
      await assertRevert(
        metaTxSend({
          requestTypeKey: MetaTxRequestType.StartrailRegistryUpdateSRRRoyalty,
          requestData: {
            tokenId,
            royaltyReceiver,
            royaltyBasisPoints,
          },
          fromAddress: luwHandler,
          signerWallet: ownerWallet,
        }),
        'ERC2981: royalty receiver can not be address(0)'
      )
    })
  })

  describe('updateSRRRoyaltyReceiverMulti', () => {
    it('called from the Administrator contract', async () => {
      // Create SRR first
      const tokenId1 = await createSRRMetaTx(defaultRoyaltyReceiver, defaultRoyaltyBasisPoints)
      const tokenId2 = await createSRRMetaTx(defaultRoyaltyReceiver, defaultRoyaltyBasisPoints)

      const royaltyReceiver = randomAddress()

      // Update SRR Royalty Receiver Multi
      const { data: updateEncoded } =
        await startrailRegistry.populateTransaction[
          `updateSRRRoyaltyReceiverMulti(uint256[],address)`
        ]([tokenId1, tokenId2], royaltyReceiver)

      const admin = await getAdministratorInstance(hre)
      const txReceipt = await admin.execTransaction({
        to: startrailRegistry.address,
        data: updateEncoded,
        waitConfirmed: true,
      })

      const royalty1Event = decodeEventLog(
        startrailRegistry,
        'RoyaltiesSet(uint256,(address,uint16))',
        txReceipt.logs[0]
      )[1]

      const royalty2Event = decodeEventLog(
        startrailRegistry,
        'RoyaltiesSet(uint256,(address,uint16))',
        txReceipt.logs[1]
      )[1]

      expect(royalty1Event[0]).to.equal(royaltyReceiver)
      expect(royalty1Event[1]).to.equal(defaultRoyaltyBasisPoints)

      expect(royalty2Event[0]).to.equal(royaltyReceiver)
      expect(royalty2Event[1]).to.equal(defaultRoyaltyBasisPoints)
    })

    it('rejects if msg.sender is not an Administrator', async () => {
      const royaltyReceiver = randomAddress()

      await assertRevert(
        startrailRegistry[`updateSRRRoyaltyReceiverMulti(uint256[],address)`](
          [123456], royaltyReceiver
        ),
        `Caller is not the Startrail Administrator`
      )
    })

    it('rejects if tokenId does not exist', async () => {
      const royaltyReceiver = randomAddress()

      const { data: updateEncoded } =
        await startrailRegistry.populateTransaction[
          `updateSRRRoyaltyReceiverMulti(uint256[],address)`
        ]([123456], royaltyReceiver)

      const admin = await getAdministratorInstance(hre)

      let error = null
      try {
        txReceipt = await admin.execTransaction({
          to: startrailRegistry.address,
          data: updateEncoded,
          waitConfirmed: true,
        })
      } catch (err) {
        error = err.message
      }

      expect(error).to.contain('administrator.execTransaction: failure')
    })

  })
})
