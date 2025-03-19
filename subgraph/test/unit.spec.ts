/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-explicit-any */

// using require because there are no @types for these packages and without the
// types we get lint errors
const Lokka = require('lokka').Lokka
const Transport = require('lokka-transport-http').Transport

let client: any

beforeAll(() => {
  client = new Lokka({
    transport: new Transport(
      'http://127.0.0.1:8000/subgraphs/name/startbahn/startrail-local'
    ),
  })
})

// ignoring createdAt and updatedAt since it's timestamp, metadataHistory, provenance with id, originTxHash
test('srrs', async () => {
  const query = `
  {
    srrs(orderBy: tokenId) {
      id
      collection {
        id
        ownerAddress
        creatorAddress
      }
      tokenId
      ownerAddress
      artistAddress
      royaltyReceiver
      royaltyBasisPoints
      artist {
        id
        englishName
      }
      issuer {
        id
        englishName
      }
      metadataDigest
      transferCommitment
      history {
        customHistory {
          metadataDigest
          metadataHistory(orderBy: metadataDigest) {
            metadataDigest
          }
        }
      }
      originChain
      lockExternalTransfer
      royaltyReceiver
      royaltyBasisPoints
    }
  }
`
  const result = await client.query(query)
  expect(result.srrs).toMatchSnapshot()

  const query2 = `
{
  srrs {
    provenance {
      id
    }
  }
}
`

  const result2 = await client.query(query2)

  const ids = result2.srrs
    .flatMap((x: any) => x.provenance)
    .map((x: any) => x.id)

  for (const id of ids) {
    expect(id).toHaveLength(66)
  }
})

// ignoring walletAddress, createdAt, updatedAt, and  field since it's timestamp
test('licensedUserWallets ', async () => {
  const query = `
  {
    licensedUserWallets(orderBy: salt) {
      walletAddress
      threshold
      englishName
      originalName
      userType
      owners
      salt
      issuedSRRs(orderBy: tokenId) {
        id
        tokenId
        metadataDigest
        transferCommitment
      }
      originChain
    }
  }
  `
  const result = await client.query(query)

  expect(result.licensedUserWallets).toMatchSnapshot()
})

// ignoring createdAt field since it's timestamp
test('customHistoryType', async () => {
  const query = `
  {
    customHistoryTypes {
      id
      name
    }
  }
`
  const result = await client.query(query)

  const data = [
    {
      id: '1',
      name: 'auction',
    },
    {
      id: '2',
      name: 'exhibition',
    },
  ]
  expect(result.customHistoryTypes).toEqual(data)
})

// ignoring id, createdAt and updatedAt fields since it's timestamp, originTxHash
test('srrmetadataHistories', async () => {
  const query = `
  {
    srrmetadataHistories(orderBy: metadataDigest, orderDirection: desc) {
      srr {
        id
        metadataDigest
        transferCommitment
        metadataHistory(orderBy: metadataDigest) {
          srr {
            metadataDigest
          }
          metadataDigest
        }
        originChain
      }
      metadataDigest
    }
  }
`
  const result = await client.query(query)

  expect(result.srrmetadataHistories).toMatchSnapshot()
})

// ignoring createdAt field since it's timestamp
test('metaTxRequestTypes', async () => {
  const query = `
  {
    metaTxRequestTypes(orderBy: typeString, orderDirection: asc) {
      id
      typeHash
      typeString
    }
  }
`
  const result = await client.query(query)

  expect(result.metaTxRequestTypes).toMatchSnapshot()
})

// ignoring createdAt field since it's timestamp, and txHash since it's same as
test('metaTxExecutions', async () => {
  const query = `
  {
    metaTxExecutions(orderBy: id) {
      id
    }
  }
`
  const result = await client.query(query)

  const ids = result.metaTxExecutions.map((x: any) => x.id)
  for (const id of ids) {
    expect(id).toHaveLength(66)
  }
})

// ignoring createdAt, id, from, to, and timestamp field
test('srrprovenances', async () => {
  const query = `
  {
    srrprovenances(orderBy:createdAt, orderDirection:asc) {
      srr {
        id
      }
      from
      to
      metadataDigest
      metadataURI
      customHistory {
        id
      }
      isIntermediary
      sender
    }
  }
`
  const result = await client.query(query)

  expect(result.srrprovenances).toMatchSnapshot()
})

// ignoring createdAt field since it's timestamp
test('srrtransferCommits', async () => {
  const query = `
  {
    srrtransferCommits {
      id
      commitment
      lastAction
      sender
    }
  }
`
  const result = await client.query(query)

  expect(result.srrtransferCommits).toMatchSnapshot()
})

// ignoring createdAt and updatedAt field
// currently, we don't use createSRRWithProof
test.skip('bulkIssues', async () => {
  const query = `
  {
    bulkIssues {
      id
      merkleRoot
      issuer
      srrs {
        tokenId
        hash
      }
    }
  }
`
  const result = await client.query(query)

  const data = [
    {
      id: '0x04d4f6f30251d9af5f7a888dc57abbb28dd3ef6e337d93d05ac766b4d6c56a02',
      issuer: '0x2c1eda2d80e82a9b2b26b64da21e341636e8bab4',
      merkleRoot:
        '0x04d4f6f30251d9af5f7a888dc57abbb28dd3ef6e337d93d05ac766b4d6c56a02',
      srrs: [
        {
          hash: '0xf453e08dfbaf7d3d602726d6e88436f96e7f959ad49bdd108a20d03535c815b9',
          tokenId: '986417474240',
        },
      ],
    },
  ]

  expect(result.bulkIssues).toEqual(data)
})

//ignore originTxHash
test('customHistories', async () => {
  const query = `
  {
    customHistories {
      id
      historyType {
        id
        name
      }
      name
      metadataDigest
      metadataHistory(orderBy: metadataDigest) {
        metadataDigest
      }
      srrHistory {
        srr {
          tokenId
        }
      }
      originChain
    }
  }
`
  const result = await client.query(query)

  const data = [
    {
      historyType: {
        id: '2',
        name: 'exhibition',
      },
      id: '1',
      metadataDigest:
        'bafkreibue6ax5qbviaq6rdcac3s3tjt7ihcgforfyf4wnl25tilcyoftsq',
      metadataHistory: [
        {
          metadataDigest:
            '0x001c7d6fdb9885b02689d0d76b34fe73e7706b3e9e841c16a8f8264077d197cd',
        },
        {
          metadataDigest:
            '0xcc3b6344b207c582bd727005be2a5de5bbca7b46b590d9e9189f3a9a7ea8283e',
        },
      ],
      name: 'GOMA Japan',
      originChain: 'eip155:31337',
      srrHistory: [
        {
          srr: {
            tokenId: '820869899430',
          },
        },
        {
          srr: {
            tokenId: '997721594932',
          },
        },
      ],
    },
    {
      historyType: {
        id: '2',
        name: 'exhibition',
      },
      id: '2',
      metadataDigest:
        'bafkreibue6ax5qbviaq6rdcac3s3tjt7ihcgforfyf4wnl25tilcyoftsq',
      metadataHistory: [],
      name: 'GOMA China',
      originChain: 'eip155:31337',
      srrHistory: [],
    },
  ]

  expect(result.customHistories).toEqual(data)
})

test('customHistoryMetadataHistories', async () => {
  const query = `
  {
    customHistoryMetadataHistories(orderBy: metadataDigest) {
      metadataDigest,
      customHistory {
        id,
        metadataDigest,
        name
      }
    }
  }
`
  const result = await client.query(query)

  const data = [
    {
      metadataDigest:
        '0x001c7d6fdb9885b02689d0d76b34fe73e7706b3e9e841c16a8f8264077d197cd',
      customHistory: {
        id: '1',
        metadataDigest:
          'bafkreibue6ax5qbviaq6rdcac3s3tjt7ihcgforfyf4wnl25tilcyoftsq',
        name: 'GOMA Japan',
      },
    },
    {
      metadataDigest:
        '0xcc3b6344b207c582bd727005be2a5de5bbca7b46b590d9e9189f3a9a7ea8283e',
      customHistory: {
        id: '1',
        metadataDigest:
          'bafkreibue6ax5qbviaq6rdcac3s3tjt7ihcgforfyf4wnl25tilcyoftsq',
        name: 'GOMA Japan',
      },
    },
  ]

  expect(result.customHistoryMetadataHistories).toEqual(data)
})

// ignoring createdAt field since it's timestamp
test('srrHistories', async () => {
  const query = `
  {
    srrhistories {
      srr {
        tokenId
      }
      customHistory {
        id
      }
    }
  }
`
  const result = await client.query(query)

  const data = [
    {
      customHistory: {
        id: '1',
      },
      srr: {
        tokenId: '820869899430',
      },
    },
    {
      customHistory: {
        id: '1',
      },
      srr: {
        tokenId: '997721594932',
      },
    },
  ]

  expect(result.srrhistories).toEqual(data)
})
