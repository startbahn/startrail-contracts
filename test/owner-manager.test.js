/*
 * Test copied from gnosis/safe-contracts:
 *   https://github.com/gnosis/safe-contracts/blob/1264b77bbda5327ad668432c6efe470a20b1d75c/test/licensedUserManagerManagement.js
 *
 * Adapted to test modifications made to the OwnerManager.sol as it is used
 *   by LicensedUserManager.sol
 */

const hre = require('hardhat')

const { assert, expect, use } = require('chai')
const chaiAsPromised = require('chai-as-promised')
const { loadFixture } = require('@nomicfoundation/hardhat-network-helpers')

const { ContractKeys } = require('../startrail-common-js/contracts/types')
const { Logger } = require('../startrail-common-js/logger')
const {
  MetaTxRequestType,
} = require('../startrail-common-js/meta-tx/meta-tx-request-registry')

const {
  assertExecutionSuccessEmitted,
  assertExecutionFailure,
  assertRevert,
} = require('./helpers/assertions')
const { fixtureDefault } = require('./helpers/fixtures')
const {
  createLicensedUserWalletDirect,
  encodeSignExecute,
  ZERO_ADDRESS,
  SENTINEL_ADDRESS,
} = require('./helpers/utils')
const { getWallets } = require('../utils/hardhat-helpers')
const { nameRegistrySet } = require('../utils/name-registry-set')

use(chaiAsPromised)

Logger.setSilent(true)

const assertOwnerList = async (lum, luwAddress, owners) => {
  assert.sameMembers(await lum.getOwners(luwAddress), owners)
  const isOwnerResults = await Promise.all(
    owners.map((owner) => lum.isOwner(luwAddress, owner))
  )
  const allOwners = isOwnerResults.includes(false) === false
  return assert.isTrue(allOwners)
}

describe('OwnerManager', function () {
  // Contract handles
  let lum

  // EOA wallets
  let adminWallet
  let owner1Wallet
  let owner2Wallet
  let owner3Wallet
  let owner4Wallet

  // EOA addresses
  let owner1Address
  let owner2Address
  let owner3Address
  let owner4Address

  // Multiple signer licensed user wallet setup in beforeEach
  let luwAddress
  let luwOwnerList

  before(async () => {
    const wallets = getWallets(hre)

    adminWallet = wallets[0]

    owner1Wallet = wallets[1]
    owner2Wallet = wallets[2]
    owner3Wallet = wallets[3]
    owner4Wallet = wallets[4]

    owner1Address = owner1Wallet.address
    owner2Address = owner2Wallet.address
    owner3Address = owner3Wallet.address
    owner4Address = owner4Wallet.address
  })

  beforeEach(async function () {
    ;({ lum } = await loadFixture(fixtureDefault))

    // For unit testing set the administrator to an EOA wallet.
    // This will allow transactions to be sent directly.
    await nameRegistrySet(
      hre,
      ContractKeys.Administrator,
      adminWallet.address,
      false // don't logMsg (to console)
    )

    luwOwnerList = [owner1Address, owner2Address]
    const { walletAddress } = await createLicensedUserWalletDirect(
      hre,
      {
        owners: luwOwnerList,
        threshold: 1,
      },
      adminWallet
    )
    luwAddress = walletAddress
  })

  describe('addOwner', () => {
    const addOwner = ({ newOwner, threshold }, signer = owner1Wallet) => {
      const addOwnerRequestParams = {
        _wallet: luwAddress,
        _owner: newOwner,
        _threshold: threshold,
      }
      return encodeSignExecute({
        requestTypeKey: MetaTxRequestType.WalletAddOwner,
        fromAddress: luwAddress,
        requestData: addOwnerRequestParams,
        signerWallets: [signer],
      })
    }

    const assertAddedOwner = async ({
      txRspPromise,
      luwAddress,
      expectedAddedOwner,
      expectedThreshold,
      expectChangedThresholdEvent,
      fromAdministrator,
    }) => {
      const txRsp = await txRspPromise

      return Promise.all([
        assert.equal(await lum.getThreshold(luwAddress), expectedThreshold),

        assertOwnerList(lum, luwAddress, [...luwOwnerList, expectedAddedOwner]),

        expect(txRspPromise)
          .to.emit(lum, 'AddedOwner')
          .withArgs(luwAddress, expectedAddedOwner),

        expectChangedThresholdEvent === true
          ? expect(txRspPromise)
              .to.emit(lum, 'ChangedThreshold')
              .withArgs(luwAddress, expectedThreshold)
          : undefined,

        !fromAdministrator ? assertExecutionSuccessEmitted(txRsp) : undefined,
      ])
    }

    const assertAddOwnerFails = async (addOwnerProps) => {
      const txPromise = addOwner(addOwnerProps)
      await assertExecutionFailure(
        txPromise,
        addOwnerProps.expectedErrorMessage
      )
    }

    it('should add owner and change threshold (from LUW)', async () => {
      assert.equal(
        await lum.getThreshold(luwAddress),
        1,
        'starting threshold should be 1'
      )
      await assertOwnerList(lum, luwAddress, luwOwnerList)

      const newThreshold = 2

      return assertAddedOwner({
        txRspPromise: addOwner({
          newOwner: owner3Address,
          threshold: newThreshold,
        }),
        luwAddress,
        expectedAddedOwner: owner3Address,
        expectedThreshold: newThreshold,
        expectChangedThresholdEvent: true,
      })
    })

    it('should add owner and change threshold (from Administrator)', async () => {
      assert.equal(
        await lum.getThreshold(luwAddress),
        1,
        'starting threshold should be 1'
      )
      await assertOwnerList(lum, luwAddress, luwOwnerList)

      const newThreshold = 2
      const lumFromAdmin = lum.connect(adminWallet)
      const txRspPromise = lumFromAdmin.addOwner(luwAddress, owner3Address, 2)

      return assertAddedOwner({
        txRspPromise,
        luwAddress,
        expectedAddedOwner: owner3Address,
        expectedThreshold: newThreshold,
        expectChangedThresholdEvent: true,
        fromAdministrator: true,
      })
    })

    it('should add owner and leave threshold if threshold unchanged', async () => {
      const threshold = 1

      assert.equal(
        await lum.getThreshold(luwAddress),
        threshold,
        'starting threshold should be 1'
      )
      await assertOwnerList(lum, luwAddress, luwOwnerList)

      return assertAddedOwner({
        txRspPromise: addOwner({ newOwner: owner3Address, threshold }),
        luwAddress,
        expectedAddedOwner: owner3Address,
        expectedThreshold: threshold,
        expectChangedThresholdEvent: false,
      })
    })

    it('should reject attempt to add owner when meta tx signer is not an owner', () =>
      assertRevert(
        addOwner(
          {
            newOwner: owner4Address,
            threshold: 1,
          },
          owner4Wallet
        ),
        `Signer in signatures is not an owner of this wallet`
      ))

    it('should reject attempt to add owner when direct call not from admin', () => {
      const lumFromNonAdmin = lum.connect(owner1Wallet)
      return assertRevert(
        lumFromNonAdmin.addOwner(luwAddress, owner3Address, 2),
        `Wallet function can only be called from trusted forwarder or admin`
      )
    })

    it('should reject attempt to add duplicate owner', async () =>
      assertAddOwnerFails({
        newOwner: owner1Address,
        threshold: 1,
        expectedErrorMessage: 'Address is already an owner',
      }))

    it('should reject attempt to add zero address', () =>
      assertAddOwnerFails({
        newOwner: ZERO_ADDRESS,
        threshold: 1,
        expectedErrorMessage: 'Invalid owner address provided',
      }))

    it('should reject attempt to add sentinal address', () =>
      assertAddOwnerFails({
        newOwner: SENTINEL_ADDRESS,
        threshold: 1,
        expectedErrorMessage: 'Invalid owner address provided',
      }))
  })

  describe('removeOwner', () => {
    let luw3OwnerList
    let luw3OwnersAddress

    const removeOwner = (
      { prevOwner, ownerToRemove, threshold },
      signer = owner1Wallet
    ) => {
      const removeOwnerRequestParams = {
        _wallet: luw3OwnersAddress,
        _prevOwner: prevOwner,
        _owner: ownerToRemove,
        _threshold: threshold,
      }
      return encodeSignExecute({
        requestTypeKey: MetaTxRequestType.WalletRemoveOwner,
        fromAddress: luw3OwnersAddress,
        requestData: removeOwnerRequestParams,
        signerWallets: [signer],
      })
    }

    const assertRemovedOwner = async ({
      txRspPromise,
      expectedOwnerList,
      expectedRemovedOwner,
    }) => {
      const txRsp = await txRspPromise
      return Promise.all([
        assertOwnerList(lum, luw3OwnersAddress, expectedOwnerList),
        expect(txRspPromise)
          .to.emit(lum, 'RemovedOwner')
          .withArgs(luw3OwnersAddress, expectedRemovedOwner),
        assertExecutionSuccessEmitted(txRsp),
      ])
    }

    const assertRemoveOwnerFails = async (removeOwnerProps) => {
      const txPromise = removeOwner(removeOwnerProps)
      await assertExecutionFailure(
        txPromise,
        removeOwnerProps.expectedErrorMessage
      )
    }

    beforeEach(async () => {
      // create wallet with 3 owners for removeOwner unit tests to use
      luw3OwnerList = [owner1Address, owner2Address, owner3Address]
      const { walletAddress } = await createLicensedUserWalletDirect(
        hre,
        {
          owners: [owner1Address, owner2Address, owner3Address],
          threshold: 1,
        },
        adminWallet
      )
      luw3OwnersAddress = walletAddress
    })

    it('should remove owner from front of owner list', () =>
      assertRemovedOwner({
        txRspPromise: removeOwner({
          prevOwner: SENTINEL_ADDRESS,
          ownerToRemove: luw3OwnerList[0],
          threshold: 1,
        }),
        expectedOwnerList: [luw3OwnerList[1], luw3OwnerList[2]],
        expectedRemovedOwner: luw3OwnerList[0],
      }))

    it('should remove owner from middle of owner list', () =>
      assertRemovedOwner({
        txRspPromise: removeOwner({
          prevOwner: luw3OwnerList[0],
          ownerToRemove: luw3OwnerList[1],
          threshold: 1,
        }),
        expectedOwnerList: [luw3OwnerList[0], luw3OwnerList[2]],
        expectedRemovedOwner: luw3OwnerList[1],
      }))

    it('should remove owner from end of owner list', () =>
      assertRemovedOwner({
        txRspPromise: removeOwner({
          prevOwner: luw3OwnerList[1],
          ownerToRemove: luw3OwnerList[2],
          threshold: 1,
        }),
        expectedOwnerList: [luw3OwnerList[0], luw3OwnerList[1]],
        expectedRemovedOwner: luw3OwnerList[2],
      }))

    it('should reject attempt to remove owner when meta tx signer is not an owner', () =>
      assertRevert(
        removeOwner(
          {
            prevOwner: luw3OwnerList[1],
            ownerToRemove: luw3OwnerList[2],
            threshold: 1,
          },
          owner4Wallet // not an owner
        ),
        `Signer in signatures is not an owner of this wallet`
      ))

    it('should reject attempt to remove owner when direct call not from admin', () => {
      const lumFromNonAdmin = lum.connect(owner1Wallet)
      return assertRevert(
        lumFromNonAdmin.removeOwner(
          luwAddress,
          owner3Address,
          owner4Address,
          1
        ),
        `Wallet function can only be called from trusted forwarder or admin`
      )
    })

    it('should reject attempt to reduce threshold below owner count', () =>
      assertRemoveOwnerFails({
        prevOwner: luw3OwnerList[0],
        ownerToRemove: luw3OwnerList[1],
        threshold: 0,
        expectedErrorMessage: 'Threshold needs to be greater than 0',
      }))

    it('should reject attempt to remove sentinal owner', () =>
      assertRemoveOwnerFails({
        prevOwner: luw3OwnerList[0],
        ownerToRemove: SENTINEL_ADDRESS,
        threshold: 1,
        expectedErrorMessage: 'Invalid owner address provided',
      }))

    it('should reject attempt to remove zero address owner', () =>
      assertRemoveOwnerFails({
        prevOwner: luw3OwnerList[0],
        ownerToRemove: ZERO_ADDRESS,
        threshold: 1,
        expectedErrorMessage: 'Invalid owner address provided',
      }))
  })

  describe('swapOwner', () => {
    let luw3OwnerList
    let luw3OwnersAddress

    const swapOwner = (
      { prevOwner, oldOwner, newOwner },
      signer = owner1Wallet
    ) => {
      const swapOwnerRequestParams = {
        _wallet: luw3OwnersAddress,
        _prevOwner: prevOwner,
        _oldOwner: oldOwner,
        _newOwner: newOwner,
      }
      return encodeSignExecute({
        requestTypeKey: MetaTxRequestType.WalletSwapOwner,
        fromAddress: luw3OwnersAddress,
        requestData: swapOwnerRequestParams,
        signerWallets: [signer],
      })
    }

    const assertSwappedOwner = async ({
      txRspPromise,
      expectedOwnerList,
      expectedRemovedOwner,
      expectedAddedOwner,
    }) => {
      const txRsp = await txRspPromise
      return Promise.all([
        assertOwnerList(lum, luw3OwnersAddress, expectedOwnerList),
        expect(txRspPromise)
          .to.emit(lum, 'RemovedOwner')
          .withArgs(luw3OwnersAddress, expectedRemovedOwner),
        expect(txRspPromise)
          .to.emit(lum, 'AddedOwner')
          .withArgs(luw3OwnersAddress, expectedAddedOwner),
        assertExecutionSuccessEmitted(txRsp),
      ])
    }

    const assertSwapOwnerFails = async (props) => {
      const txPromise = swapOwner(props)
      await assertExecutionFailure(txPromise, props.expectedErrorMessage)
    }

    beforeEach(async () => {
      // create wallet with 3 owners for swapOwner unit tests to use
      luw3OwnerList = [owner1Address, owner2Address, owner3Address]
      const { walletAddress } = await createLicensedUserWalletDirect(
        hre,
        {
          owners: luw3OwnerList,
          threshold: 1,
        },
        adminWallet
      )
      luw3OwnersAddress = walletAddress
    })

    it('should swap owner at the front of the owner list', () =>
      assertSwappedOwner({
        txRspPromise: swapOwner({
          prevOwner: SENTINEL_ADDRESS,
          oldOwner: luw3OwnerList[0],
          newOwner: owner4Address,
        }),
        expectedOwnerList: [owner4Address, luw3OwnerList[1], luw3OwnerList[2]],
        expectedRemovedOwner: luw3OwnerList[0],
        expectedAddedOwner: owner4Address,
      }))

    it('should swap owner from middle of owner list', () =>
      assertSwappedOwner({
        txRspPromise: swapOwner({
          prevOwner: luw3OwnerList[0],
          oldOwner: luw3OwnerList[1],
          newOwner: owner4Address,
        }),
        expectedOwnerList: [luw3OwnerList[0], owner4Address, luw3OwnerList[2]],
        expectedRemovedOwner: luw3OwnerList[1],
        expectedAddedOwner: owner4Address,
      }))

    it('should swap owner from end of owner list', () =>
      assertSwappedOwner({
        txRspPromise: swapOwner({
          prevOwner: luw3OwnerList[1],
          oldOwner: luw3OwnerList[2],
          newOwner: owner4Address,
        }),
        expectedOwnerList: [luw3OwnerList[0], luw3OwnerList[1], owner4Address],
        expectedRemovedOwner: luw3OwnerList[2],
        expectedAddedOwner: owner4Address,
      }))

    it('should reject attempt to swap owner when meta tx signer is not an owner', () =>
      assertRevert(
        swapOwner(
          {
            prevOwner: luw3OwnerList[1],
            oldOwner: luw3OwnerList[2],
            newOwner: owner4Address,
          },
          owner4Wallet // not an owner
        ),
        `Signer in signatures is not an owner of this wallet`
      ))

    it('should reject attempt to swap owner when direct call not from admin', () => {
      const lumFromNonAdmin = lum.connect(owner1Wallet)
      return assertRevert(
        lumFromNonAdmin.swapOwner(
          luwAddress,
          owner2Address,
          owner3Address,
          owner4Address
        ),
        `Wallet function can only be called from trusted forwarder or admin`
      )
    })

    it('should reject attempt to swap to an already existing owner', () =>
      assertSwapOwnerFails({
        prevOwner: luw3OwnerList[0],
        oldOwner: luw3OwnerList[1],
        newOwner: luw3OwnerList[2],
        expectedErrorMessage: 'Address is already an owner',
      }))

    it('should reject attempt to swap from sentinal owner', () =>
      assertSwapOwnerFails({
        prevOwner: luw3OwnerList[0],
        oldOwner: SENTINEL_ADDRESS,
        newOwner: owner4Address,
        expectedErrorMessage: 'Invalid owner address provided',
      }))

    it('should reject attempt to swap to sentinal owner', () =>
      assertSwapOwnerFails({
        prevOwner: luw3OwnerList[0],
        oldOwner: luw3OwnerList[1],
        newOwner: SENTINEL_ADDRESS,
        expectedErrorMessage: 'Invalid owner address provided',
      }))

    it('should reject attempt to swap from zero address owner', () =>
      assertSwapOwnerFails({
        prevOwner: luw3OwnerList[0],
        oldOwner: ZERO_ADDRESS,
        newOwner: owner4Address,
        expectedErrorMessage: 'Invalid owner address provided',
      }))

    it('should reject attempt to swap to zero address owner', () =>
      assertSwapOwnerFails({
        prevOwner: luw3OwnerList[0],
        oldOwner: luw3OwnerList[1],
        newOwner: ZERO_ADDRESS,
        expectedErrorMessage: 'Invalid owner address provided',
      }))
  })

  describe('changeThreshold', () => {
    let luw3OwnersAddress

    const changeThreshold = (newThreshold, signer = owner1Wallet) => {
      const changeThresholdRequestParams = {
        _wallet: luw3OwnersAddress,
        _threshold: String(newThreshold), // must be String or BigNumber
      }
      return encodeSignExecute({
        requestTypeKey: MetaTxRequestType.WalletChangeThreshold,
        fromAddress: luw3OwnersAddress,
        requestData: changeThresholdRequestParams,
        signerWallets: [signer],
      })
    }

    const assertChangeThresholdFails = async (
      newThreshold,
      expectedErrorMessage
    ) => {
      const txPromise = changeThreshold(newThreshold)
      await assertExecutionFailure(txPromise, expectedErrorMessage)
    }

    beforeEach(async () => {
      // create wallet with 3 owners for changeThreshold unit tests to use
      luw3OwnerList = [owner1Address, owner2Address, owner3Address]
      const { walletAddress } = await createLicensedUserWalletDirect(
        hre,
        {
          owners: [owner1Address, owner2Address, owner3Address],
          threshold: 1,
        },
        adminWallet
      )
      luw3OwnersAddress = walletAddress
    })

    it('should change threshold when valid value given', async () => {
      const newThreshold = 2
      const txRspPromise = changeThreshold(newThreshold)
      const txRsp = await txRspPromise
      expect(txRspPromise)
        .to.emit(lum, 'ChangedThreshold')
        .withArgs(luw3OwnersAddress, newThreshold),
        await assertExecutionSuccessEmitted(txRsp)
    })

    it('should reject attempt to change threshold when meta tx signer is not an owner', () =>
      assertRevert(
        changeThreshold(
          1,
          owner4Wallet // not an owner
        ),
        `Signer in signatures is not an owner of this wallet`
      ))

    it('should reject attempt to change threshold when direct call not from admin', () => {
      const lumFromNonAdmin = lum.connect(owner1Wallet)
      return assertRevert(
        lumFromNonAdmin.changeThreshold(luwAddress, 2),
        `Wallet function can only be called from trusted forwarder or admin`
      )
    })

    it('should reject attempt to change threshold above owner count', () =>
      assertChangeThresholdFails(4, 'Threshold cannot exceed owner count'))

    it('should reject attempt to change threshold to zero', () =>
      assertChangeThresholdFails(0, 'Threshold needs to be greater than 0'))
  })
})
