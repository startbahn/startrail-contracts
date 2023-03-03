import { BigNumber } from 'ethers'
import { TypedDataField } from '@ethersproject/abstract-signer'

import { buildTypeList } from './helpers'

//
// LicensedUserManager Wallet message types (see OwnerManager.sol)
//

const WalletAddOwnerTypes: ReadonlyArray<TypedDataField> = buildTypeList({
  wallet: 'address',
  owner: 'address',
  threshold: 'uint256',
})

interface WalletAddOwnerRecord {
  wallet: string
  owner: string
  threshold: number | BigNumber | string
}

const WalletRemoveOwnerTypes: ReadonlyArray<TypedDataField> = buildTypeList({
  wallet: 'address',
  prevOwner: 'address',
  owner: 'address',
  threshold: 'uint256',
})

interface WalletRemoveOwnerRecord extends WalletAddOwnerRecord {
  prevOwner: string
}

const WalletSwapOwnerTypes: ReadonlyArray<TypedDataField> = buildTypeList({
  wallet: 'address',
  prevOwner: 'address',
  oldOwner: 'address',
  newOwner: 'address',
})

interface WalletSwapOwnerRecord {
  wallet: string
  prevOwner: string
  oldOwner: string
  newOwner: string
}

const WalletChangeThresholdTypes: ReadonlyArray<TypedDataField> = buildTypeList(
  {
    wallet: 'address',
    threshold: 'uint256',
  }
)

interface WalletChangeThresholdRecord {
  wallet: string
  threshold: number | BigNumber | string
}

const WalletSetEnglishNameTypes: ReadonlyArray<TypedDataField> = buildTypeList({
  wallet: 'address',
  name: 'string',
})

interface WalletSetEnglishNameRecord {
  wallet: string
  name: string
}

const WalletSetOriginalNameTypes: ReadonlyArray<TypedDataField> = buildTypeList(
  {
    wallet: 'address',
    name: 'string',
  }
)

interface WalletSetOriginalNameRecord {
  wallet: string
  name: string
}

export {
  WalletAddOwnerRecord,
  WalletAddOwnerTypes,
  WalletChangeThresholdRecord,
  WalletChangeThresholdTypes,
  WalletRemoveOwnerRecord,
  WalletRemoveOwnerTypes,
  WalletSetEnglishNameRecord,
  WalletSetEnglishNameTypes,
  WalletSetOriginalNameRecord,
  WalletSetOriginalNameTypes,
  WalletSwapOwnerRecord,
  WalletSwapOwnerTypes,
}
