import { BigNumber, Wallet } from 'ethers'
import { BytesLike, randomBytes } from 'ethers/lib/utils'
import { ethers } from 'hardhat'
import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { MetaTxRequestType } from '../../startrail-common-js/meta-tx/meta-tx-request-registry'
import { aCID } from '../../startrail-common-js/test-helpers/test-data'
import { randomAddress } from '../../startrail-common-js/test-helpers/test-utils'

import { CollectionProxyFeaturesAggregate } from '../../typechain-types'
import {
  createLicensedUserWalletDirect,
  encodeSignExecute,
  ZERO_ADDRESS,
} from './utils'

const randomString = (): string => Math.random().toString().substring(2, 8)

interface CollectionProperties {
  name?: string
  symbol?: string
  creationSalt?: BytesLike
}

const createCollection = async (
  creatorLUAddress: string,
  creatorLUOwnerSigner: Wallet,
  collectionProperties?: CollectionProperties
): Promise<string> => {
  const {
    name = randomString(),
    symbol = randomString(),
    creationSalt = randomBytes(32),
  } = collectionProperties

  return encodeSignExecute({
    requestTypeKey: MetaTxRequestType.CollectionFactoryCreateCollection,
    fromAddress: creatorLUAddress,
    requestData: { name, symbol, salt: creationSalt },
    signerWallets: [creatorLUOwnerSigner],
    gasLimit: 1_000_000,
  })
    .then((txRsp) => txRsp.wait())
    .then((txReceipt) =>
      // collection address - skip over fist 12 to get the 20 byte address
      ethers.utils.hexDataSlice(txReceipt.logs[0].topics[1], 12)
    )
}

interface CreateSRRProperties {
  isPrimaryIssuer?: boolean
  artistAddress?: string
  metadataCID?: string
  lockExternalTransfer?: boolean
  to?: string
  royaltyReceiver?: string
  royaltyBasisPoints?: BigNumber
}

const createSRR = async (
  fromAddress: string,
  createSRRSigner: Wallet,
  destination: string,
  {
    isPrimaryIssuer = true,
    artistAddress = randomAddress(),
    metadataCID = aCID,
    lockExternalTransfer = false,
    to = ZERO_ADDRESS,
    royaltyReceiver = randomAddress(),
    royaltyBasisPoints = BigNumber.from(100),
  }: CreateSRRProperties
) =>
  encodeSignExecute({
    requestTypeKey: MetaTxRequestType.CollectionCreateSRR,
    fromAddress,
    requestData: {
      destination,
      isPrimaryIssuer,
      artistAddress,
      metadataCID,
      lockExternalTransfer,
      to,
      royaltyReceiver,
      royaltyBasisPoints,
    },
    signerWallets: [createSRRSigner],
  })
    .then((tx) => tx.wait())
    .then((txReceipt) => BigNumber.from(txReceipt.logs[0].topics[3]))
/**
 * Setup an LUW, Collection and single SRR on the Collection for testing.
 * @param hre HardhatRuntimeEnvironment
 * @param adminWallet An owner of the admin contract - required to create the LUW
 * @param collectionOwnerWallet EOA to be owner of the new LUW and thus signer for collection owner
 * @returns collectionOwnerLUAddress - address of the new LUW
 * @returns collection - contract handle of the newly created collection contract
 * @returns tokenId - id of newly issued SRR
 */
const setupCollection = async (
  hre: HardhatRuntimeEnvironment,
  adminWallet: Wallet,
  collectionOwnerWallet: Wallet
): Promise<{
  collectionOwnerLUAddress: string
  collection: CollectionProxyFeaturesAggregate
  tokenId: BigNumber
}> => {
  let collectionOwnerLUAddress: string
  let collectionAddress: string
  let collection: CollectionProxyFeaturesAggregate
  let tokenId: BigNumber

    // create an LU owned by the given wallet
  ;({ walletAddress: collectionOwnerLUAddress } =
    await createLicensedUserWalletDirect(
      hre,
      {
        owners: [collectionOwnerWallet.address],
      },
      adminWallet
    ))

  collectionAddress = await createCollection(
    collectionOwnerLUAddress,
    collectionOwnerWallet,
    {}
  )

  tokenId = await createSRR(
    collectionOwnerLUAddress,
    collectionOwnerWallet,
    collectionAddress,
    {}
  )

  collection = await ethers.getContractAt(
    'CollectionProxyFeaturesAggregate',
    collectionAddress,
    collectionOwnerWallet
  )

  return {
    collectionOwnerLUAddress,
    collection,
    tokenId,
  }
}

export { createCollection, createSRR, setupCollection }
