import { expect, use } from 'chai'
import chaiAsPromised from 'chai-as-promised'
import hre from 'hardhat'
import { ContractKeys } from '../startrail-common-js/contracts/types'
import { MetaTxRequestType } from '../startrail-common-js/meta-tx/types'

import { loadFixture } from '@nomicfoundation/hardhat-network-helpers'

import { CollectionProxyFeaturesAggregate } from '../typechain-types'
import { getWallets } from '../utils/hardhat-helpers'
import { nameRegistrySet } from '../utils/name-registry-set'
import { setupCollection } from './helpers/collections'
import { fixtureDefault } from './helpers/fixtures'
import { encodeSignExecute } from './helpers/utils'

use(chaiAsPromised)

// Signing wallets
const wallets = getWallets(hre)
const adminEOAWallet = wallets[0]
const handlerEOAWallet = wallets[1]
const newOwnerWallet = wallets[2]

describe('Collection transferOwnership', () => {
  let collectionOwnerLUAddress: string
  let collectionOwnerSigner = handlerEOAWallet
  let collection: CollectionProxyFeaturesAggregate

  before(async function () {
    await loadFixture(fixtureDefault)

    // For unit testing set the administrator to an EOA wallet.
    // This will allow transactions to be sent directly.
    await nameRegistrySet(
      hre,
      ContractKeys.Administrator,
      adminEOAWallet.address,
      false // don't logMsg (to console)
    )

    // create a collection
    ;({ collectionOwnerLUAddress, collection } = await setupCollection(
      hre,
      adminEOAWallet,
      collectionOwnerSigner
    ))
  })

  it('transfer from LUW to EOA and back to LUW again', async () => {
    expect(await collection.owner()).to.equal(collectionOwnerLUAddress)

    // LUW owner to EOA owner
    await encodeSignExecute({
      requestTypeKey: MetaTxRequestType.CollectionTransferOwnership,
      fromAddress: collectionOwnerLUAddress,
      requestData: {
        destination: collection.address,
        newOwner: newOwnerWallet.address,
      },
      signerWallets: [collectionOwnerSigner],
    }).then((txRsp) => txRsp.wait())

    expect(await collection.owner()).to.equal(newOwnerWallet.address)

    // EOA owner to LUW owner
    await encodeSignExecute({
      requestTypeKey: MetaTxRequestType.CollectionTransferOwnership,
      fromAddress: newOwnerWallet.address,
      fromEOA: true,
      requestData: {
        destination: collection.address,
        newOwner: collectionOwnerLUAddress,
      },
      signerWallets: [newOwnerWallet],
    }).then((txRsp) => txRsp.wait())

    expect(await collection.owner()).to.equal(collectionOwnerLUAddress)
  })
})
