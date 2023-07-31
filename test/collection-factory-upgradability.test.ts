import { expect, use } from 'chai'
import chaiAsPromised from 'chai-as-promised'
import hre, { ethers, upgrades } from 'hardhat'
import { randomAddress } from '../startrail-common-js/test-helpers/test-utils'

import { CollectionFactory } from '../typechain-types'
import { getContractFactory, getWallets } from '../utils/hardhat-helpers'

use(chaiAsPromised)

// Signing wallets
const wallets = getWallets(hre)
const noAuthWallet = wallets[1]

describe('CollectionFactory upgradability', () => {
  let featureRegistryAddress: string
  let collectionProxyImplAddress: string
  let cf: CollectionFactory

  before(async () => {
    const scfrFactory = await hre.ethers.getContractFactory(
      'StartrailCollectionFeatureRegistry'
    )
    const scfr = await scfrFactory.deploy(randomAddress(), randomAddress())
    await scfr.deployed()
    featureRegistryAddress = scfr.address

    const cpImplFactory = await hre.ethers.getContractFactory('CollectionProxy')
    const cpImpl = await cpImplFactory.deploy()
    await cpImpl.deployed()
    collectionProxyImplAddress = cpImpl.address
  })

  beforeEach(async () => {
    const cfFactory = await getContractFactory(hre, 'CollectionFactory')
    cf = (await upgrades.deployProxy(
      cfFactory,
      [featureRegistryAddress, collectionProxyImplAddress],
      {
        kind: 'uups',
      }
    )) as CollectionFactory
    await cf.deployed()
  })

  it('is initialized', async () => {
    expect(await cf.featureRegistry()).to.equal(featureRegistryAddress)
    expect(ethers.utils.isAddress(await cf.collectionRegistry())).to.be.true
  })

  it('admin can upgrade', async () => {
    const cfFactoryV2 = await hre.ethers.getContractFactory(
      'MockCollectionFactoryForUpgrade'
    )

    // first prove the function only in V2 is not there:
    const notReallyV2 = cfFactoryV2.attach(cf.address)
    await expect(notReallyV2.aNewFn()).to.reverted

    // now upgrade and try the function in V2
    const cfV2 = await upgrades.upgradeProxy(cf.address, cfFactoryV2)
    expect(await cfV2.aNewFn()).to.equal(42)
  })

  it('non-admin cannot upgrade', async () => {
    const cfFactoryV2 = await hre.ethers.getContractFactory(
      'MockCollectionFactoryForUpgrade'
    )
    const cfFactoryV2WithNoAuthSigner = cfFactoryV2.connect(noAuthWallet)
    await expect(
      upgrades.upgradeProxy(cf.address, cfFactoryV2WithNoAuthSigner)
    ).to.be.revertedWith(`Ownable: caller is not the owner`)
  })
})
