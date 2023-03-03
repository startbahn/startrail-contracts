import { BigNumber, Contract, Wallet } from 'ethers'
import { BytesLike, Interface, randomBytes } from 'ethers/lib/utils'

import { ethers } from 'hardhat'
import { MetaTxRequestType } from '../../startrail-common-js/meta-tx/meta-tx-request-registry'
import { aCID } from '../../startrail-common-js/test-helpers/test-data'
import { randomAddress } from '../../startrail-common-js/test-helpers/test-utils'

import { encodeSignExecute, ZERO_ADDRESS } from '../../test/helpers/utils'
import { StartrailCollectionFeatureRegistry } from '../../typechain-types'
import { FacetCutAction, FacetCutDefinition } from './types'

const registerSelectors = async (
  featureRegistry: StartrailCollectionFeatureRegistry,
  featureContractAddress: string,
  functionSelectors: string[],
  initData?: BytesLike
): Promise<void> => {
  const cut: FacetCutDefinition = {
    target: featureContractAddress,
    action: FacetCutAction.Add,
    selectors: functionSelectors,
  }
  // console.log('Register selectors input:', JSON.stringify(cut, null, 2))

  const tx = await featureRegistry.diamondCut(
    [cut],
    initData ? cut.target : ethers.constants.AddressZero,
    initData || `0x`
  )

  const receipt = await tx.wait()
  if (!receipt.status) {
    throw Error(`Register selectors tx failed: ${tx.hash}`)
  }
}

const getSelectors = (contract: Contract): string[] => {
  const iface = contract.interface || new Interface(contract.abi)
  const signatures = Object.keys(iface.functions)
  return signatures.reduce((acc: string[], val) => {
    if (val !== 'supportsInterface(bytes4)') {
      acc.push(iface.getSighash(val))
    }
    return acc
  }, [])
}

const randomString = (): string => Math.random().toString().substring(2, 8)

interface CollectionProperties {
  name?: string
  symbol?: string
  metadataCID?: string
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
    metadataCID = aCID,
    creationSalt = randomBytes(32),
  } = collectionProperties

  return encodeSignExecute({
    requestTypeKey: MetaTxRequestType.CollectionFactoryCreateCollection,
    fromAddress: creatorLUAddress,
    requestData: { name, symbol, metadataCID, salt: creationSalt },
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
  royaltyPercentage?: BigNumber
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
    royaltyPercentage = BigNumber.from(100),
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
      royaltyPercentage,
    },
    signerWallets: [createSRRSigner],
  })
    .then((tx) => tx.wait())
    .then((txReceipt) => BigNumber.from(txReceipt.logs[0].topics[3]))

export { getSelectors, registerSelectors, createCollection, createSRR }
