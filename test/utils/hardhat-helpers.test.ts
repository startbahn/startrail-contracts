import { expect } from 'chai'

import {
  getContractNameLatest,
  getContractNamesUnversioned,
  sortByNumber,
} from '../../utils/hardhat-helpers'

describe('hardhat-helpers', () => {
  it('getContractNameLatest', () => {
    expect(getContractNameLatest('Bulk')).to.equal('BulkV4')
    expect(getContractNameLatest('StartrailRegistry')).to.equal(
      'StartrailRegistryV23'
    )
    expect(getContractNameLatest('SRRFeature')).to.equal('SRRFeatureV01')
  })

  it('getContractNamesUnversioned', () => {
    expect(
      getContractNamesUnversioned('contracts/collection/features').sort()
    ).to.deep.equal(
      [
        'ERC2981RoyaltyFeature',
        'ERC721Feature',
        'LockExternalTransferFeature',
        'OwnableFeature',
        'SRRApproveTransferFeature',
        'SRRFeature',
        'SRRHistoryFeature',
        'SRRMetadataFeature',
      ].sort()
    )
  })

  it('sortByNumber', () => {
    expect(sortByNumber(['BulkV4', 'BulkV3'])).to.deep.equal([
      'BulkV3',
      'BulkV4',
    ])
    // without 0 in single digit versions
    // and check leading '1' nums 10, 1, 11 sort correctly
    expect(
      sortByNumber([
        'StartrailRegistryV22',
        'StartrailRegistryV10',
        'StartrailRegistryV11',
        'StartrailRegistryV1',
      ])
    ).to.deep.equal([
      'StartrailRegistryV1',
      'StartrailRegistryV10',
      'StartrailRegistryV11',
      'StartrailRegistryV22',
    ])
    // with 0 in single digit version
    expect(sortByNumber(['SRRFeature02', 'SRRFeature01'])).to.deep.equal([
      'SRRFeature01',
      'SRRFeature02',
    ])
  })
})
