import { BigNumber } from 'ethers'

/**
 * Put test data that is shared across 2 or more modules in here.
 */

// a well formed Ethereum address
const anEthAddress = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'
const anEthAddress2 = '0xffFFfFFffffFFFFfFfFEeFfFfffffFFFfffFffff'
const aContractAddress = '0x1111111111111111111111111111111111111111'
const aContractAddress2 = '0x2222222222222222222222222222222222222222'

// a well formed Transaction hash
const aTxHash =
  '0x25c11adab0dda0e6840793b666738d57547ee7a43890841a3c97f441df9da863'

const aKeccak256Hash =
  '0x68371d7e884c168ae2022c82bd837d51837718a7f7dfb7aa3f753074a35e1d87'

// see IDGenerator.sol - produces a 20 digit number
const aTokenId: BigNumber = BigNumber.from('22789005640710649713')
const aTokenIdStr = aTokenId.toString()

const aSha256Hash =
  '335929a4e59b0860ec04c620c1284dace74c00f7eadaadce7a18d6deba6c544e'

// This EOA is same as sig.sender.
const anArtistEOA = '0x17a4dc4af1faf9c3db0515a170491c37eb0373dc'

// An IPFS V1 CID
const aCID = 'bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi'

const orderedObject = {
  $schema:
    'https://cert.startbahn.io/api/v1/cert/metadata/cert-metadata.schema.json',
  contractTerms: { fileURL: 'some qualitative PDF URL', royaltyRate: 15.7 },
  digitalComponents: [
    {
      category: 'artwork',
      hash: 'sha256-335929a4e59b0860ec04c620c1284dace74c00f7eadaadce7a18d6deba6c544e',
    },
  ],
  edition: {
    note: { en: 'some extra notes in 1 or more languages' },
    number: 1,
    proofType: 'ED',
    totalNumber: 3,
    uniqueness: 'unique work',
  },
  medium: { en: 'Oil on canvas', ja: 'キャンバスに油彩', zh: '布面油画' },
  note: { en: 'note', zh: '注意' },
  size: {
    depth: 12.4,
    flexibleDescription: {
      en: 'flexibleDescription comes here',
      ja: '自由だーーー',
    },
    height: 400,
    unit: 'mm',
    width: 200,
  },
  startbahnCertICTagUIDs: ['1234567890abcdef', '0123456789abcdef'],
  thumbnailURL: 'some thumbnail url',
  title: { en: 'A title', ja: 'タイトル', zh: '一个标题' },
  yearOfCreation: { en: 'around 2010-2020', ja: '2010年から2020年頃' },
}

const unorderedObject = {
  startbahnCertICTagUIDs: ['1234567890abcdef', '0123456789abcdef'],
  $schema:
    'https://cert.startbahn.io/api/v1/cert/metadata/cert-metadata.schema.json',
  title: {
    ja: 'タイトル',
    en: 'A title',
    zh: '一个标题',
  },
  size: {
    width: 200.0,
    height: 400.0,
    depth: 12.4,
    unit: 'mm',
    flexibleDescription: {
      ja: '自由だーーー',
      en: 'flexibleDescription comes here',
    },
  },
  medium: {
    ja: 'キャンバスに油彩',
    en: 'Oil on canvas',
    zh: '布面油画',
  },
  edition: {
    uniqueness: 'unique work',
    proofType: 'ED',
    number: 1,
    totalNumber: 3,
    note: {
      en: 'some extra notes in 1 or more languages',
    },
  },
  contractTerms: {
    royaltyRate: 15.7,
    fileURL: 'some qualitative PDF URL',
  },
  note: {
    en: 'note',
    zh: '注意',
  },
  thumbnailURL: 'some thumbnail url',
  yearOfCreation: {
    en: 'around 2010-2020',
    ja: '2010年から2020年頃',
  },
  digitalComponents: [
    {
      hash: 'sha256-335929a4e59b0860ec04c620c1284dace74c00f7eadaadce7a18d6deba6c544e',
      category: 'artwork',
    },
  ],
}

export {
  anEthAddress,
  anEthAddress2,
  aCID,
  aContractAddress,
  aContractAddress2,
  anArtistEOA,
  aKeccak256Hash,
  aSha256Hash,
  aTxHash,
  aTokenId,
  aTokenIdStr,
  orderedObject,
  unorderedObject,
}
