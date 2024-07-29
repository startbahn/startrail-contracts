/* eslint-disable @typescript-eslint/no-var-requires */
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
  expect(result.srrs).toMatchInlineSnapshot(`
    [
      {
        "artist": null,
        "artistAddress": "0x35902f4f4c94dcba48a71202b795e3ad2f75c56f",
        "collection": null,
        "history": [],
        "id": "0xebfde1531d7cf25871521637c861bee0a991a9346c677331530354a371280036",
        "issuer": {
          "englishName": "Artist English",
          "id": "0x2a6fe6a7d388adef11545190e105b9266d3c4cd3",
        },
        "lockExternalTransfer": false,
        "metadataDigest": "bagaaieraqadwqzwbwlz2ewxdb6nvy4thckhy2vu6jsbhxll52sihrlgneo7q",
        "originChain": "eip155:31337",
        "ownerAddress": "0x2a6fe6a7d388adef11545190e105b9266d3c4cd3",
        "royaltyBasisPoints": null,
        "royaltyReceiver": null,
        "tokenId": "166670976800",
        "transferCommitment": null,
      },
      {
        "artist": null,
        "artistAddress": "0xeba6851db73174c0bb847c0172721836b3ba267c",
        "collection": {
          "id": "0x5979b6061f1cac61f70a06cd968a6f67fe0b8284",
          "ownerAddress": "0xad87f0b51a8788192edd0640ab5ed58e48145c82",
        },
        "history": [],
        "id": "0x7722fed27cd514bc7a1899d245da7d84975bccfb021a43273cabe7e19dfc0835",
        "issuer": {
          "englishName": "New English Name",
          "id": "0x127944fda36c6b54a7b9d06177a9ee6a6dc83e8a",
        },
        "lockExternalTransfer": false,
        "metadataDigest": "QmPMc4tcBsMqLRuCQtPmPe84bpSjrC3Ky7t3JWuHXYB4aS",
        "originChain": "eip155:31337",
        "ownerAddress": "0xf1dbd215d72d99422693ca61f7bbecfcd0edb16f",
        "royaltyBasisPoints": 500,
        "royaltyReceiver": "0xc18fd8c2ba912c8687b005056121e87731612cc9",
        "tokenId": "20398948250",
        "transferCommitment": null,
      },
      {
        "artist": null,
        "artistAddress": "0x35902f4f4c94dcba48a71202b795e3ad2f75c56f",
        "collection": null,
        "history": [],
        "id": "0x87803be46c34e76b5c8a30760063c553ceea3caa6189f403c01b28c096b455ed",
        "issuer": {
          "englishName": "New English Name",
          "id": "0x127944fda36c6b54a7b9d06177a9ee6a6dc83e8a",
        },
        "lockExternalTransfer": false,
        "metadataDigest": "bagaaieraop7u5tq2louh6wgonr2h3k3xottt2t76brqsffrgz4jsui3athva",
        "originChain": "eip155:31337",
        "ownerAddress": "0xbb1010f86fcfd7223f5e95dcb7899af069493b80",
        "royaltyBasisPoints": null,
        "royaltyReceiver": null,
        "tokenId": "227568336751",
        "transferCommitment": null,
      },
      {
        "artist": null,
        "artistAddress": "0x864d38b2989553080dbe893f7366b2dc675cac1f",
        "collection": null,
        "history": [],
        "id": "0xda5483b655cdcefbca259d1e937e1a194bcc11d8ac7f68c1ffebf9e3decfd49a",
        "issuer": {
          "englishName": "New English Name",
          "id": "0x127944fda36c6b54a7b9d06177a9ee6a6dc83e8a",
        },
        "lockExternalTransfer": false,
        "metadataDigest": "bafkreibue6ax5qbviaq6rdcac3s3tjt7ihcgforfyf4wnl25tilcyoftsr",
        "originChain": "eip155:31337",
        "ownerAddress": "0xbb1010f86fcfd7223f5e95dcb7899af069493b80",
        "royaltyBasisPoints": 500,
        "royaltyReceiver": "0x864d38b2989553080dbe893f7366b2dc675cac1f",
        "tokenId": "436104791396",
        "transferCommitment": null,
      },
      {
        "artist": null,
        "artistAddress": "0x35902f4f4c94dcba48a71202b795e3ad2f75c56f",
        "collection": null,
        "history": [],
        "id": "0xcf9fc5c69736f9b9a904d8be01fb55f088efaa5df8851fdc3c4796fdc6ea1dc9",
        "issuer": {
          "englishName": "New English Name",
          "id": "0x127944fda36c6b54a7b9d06177a9ee6a6dc83e8a",
        },
        "lockExternalTransfer": false,
        "metadataDigest": "bagaaieragc4yvxz4nmnpllpovwtnkpp5tqh3oxrf26lgxodnrb2v2bkkjmsq",
        "originChain": "eip155:31337",
        "ownerAddress": "0xf1dbd215d72d99422693ca61f7bbecfcd0edb16f",
        "royaltyBasisPoints": null,
        "royaltyReceiver": null,
        "tokenId": "481668863629",
        "transferCommitment": null,
      },
      {
        "artist": null,
        "artistAddress": "0x35902f4f4c94dcba48a71202b795e3ad2f75c56f",
        "collection": null,
        "history": [],
        "id": "0x48b977037c4f761ba0edec2b540ed6ee922900303ae4c57d237a16e0446f7d3f",
        "issuer": {
          "englishName": "New English Name",
          "id": "0x127944fda36c6b54a7b9d06177a9ee6a6dc83e8a",
        },
        "lockExternalTransfer": false,
        "metadataDigest": "bagaaierajzl3r2r5jf2zi22il7bjfphv6fzgcom77dhqu44nbkasol3lejda",
        "originChain": "eip155:31337",
        "ownerAddress": "0xdfb64492cdd303e86788af19123cf9f1bc65b084",
        "royaltyBasisPoints": null,
        "royaltyReceiver": null,
        "tokenId": "56100282337",
        "transferCommitment": null,
      },
      {
        "artist": null,
        "artistAddress": "0x35902f4f4c94dcba48a71202b795e3ad2f75c56f",
        "collection": null,
        "history": [],
        "id": "0x20102805b0adda42947801d0c0800d805d3707d932b059fa0844281712d4abf1",
        "issuer": {
          "englishName": "New English Name",
          "id": "0x127944fda36c6b54a7b9d06177a9ee6a6dc83e8a",
        },
        "lockExternalTransfer": false,
        "metadataDigest": "bagaaierayddp4dbtsmdi5wgblh3d2dshzy2ooubergsxhh775n53f5zug2cq",
        "originChain": "eip155:31337",
        "ownerAddress": "0xf1dbd215d72d99422693ca61f7bbecfcd0edb16f",
        "royaltyBasisPoints": null,
        "royaltyReceiver": null,
        "tokenId": "586127446272",
        "transferCommitment": null,
      },
      {
        "artist": null,
        "artistAddress": "0x35902f4f4c94dcba48a71202b795e3ad2f75c56f",
        "collection": null,
        "history": [],
        "id": "0x3650b257e1a0da21566dff4a74355736a1f0d22e59409d468933689a33edbe2c",
        "issuer": {
          "englishName": "New English Name",
          "id": "0x127944fda36c6b54a7b9d06177a9ee6a6dc83e8a",
        },
        "lockExternalTransfer": true,
        "metadataDigest": "bagaaieramdxa3kzthfvr4bhgbwx465g2ltbx4ya6gnwrk6hxlbbt4wviepra",
        "originChain": "eip155:31337",
        "ownerAddress": "0xfa08ed057457f857e9f1672cd979f5ef0628cd9a",
        "royaltyBasisPoints": null,
        "royaltyReceiver": null,
        "tokenId": "775264672222",
        "transferCommitment": null,
      },
      {
        "artist": null,
        "artistAddress": "0xeba6851db73174c0bb847c0172721836b3ba267c",
        "collection": {
          "id": "0x5979b6061f1cac61f70a06cd968a6f67fe0b8284",
          "ownerAddress": "0xad87f0b51a8788192edd0640ab5ed58e48145c82",
        },
        "history": [
          {
            "customHistory": {
              "metadataDigest": "bafkreibue6ax5qbviaq6rdcac3s3tjt7ihcgforfyf4wnl25tilcyoftsq",
              "metadataHistory": [
                {
                  "metadataDigest": "0x001c7d6fdb9885b02689d0d76b34fe73e7706b3e9e841c16a8f8264077d197cd",
                },
                {
                  "metadataDigest": "0xcc3b6344b207c582bd727005be2a5de5bbca7b46b590d9e9189f3a9a7ea8283e",
                },
              ],
            },
          },
        ],
        "id": "0xcd645bb3aec38991b92dc8221126bdb7e87b6bbc4d06b97f7f91fd37c71bbf2f",
        "issuer": {
          "englishName": "New English Name",
          "id": "0x127944fda36c6b54a7b9d06177a9ee6a6dc83e8a",
        },
        "lockExternalTransfer": true,
        "metadataDigest": "bafybeicqb5qoqtxcmjuib3jqi2boxw4g5rpifnn5ys7hbpdmsrvugdoehe",
        "originChain": "eip155:31337",
        "ownerAddress": "0x921aff57fc983b1461bf94c3b9dfafbb8423d6a0",
        "royaltyBasisPoints": 650,
        "royaltyReceiver": "0x3fd167a0db0cc5faf90a72d2b6839f723e1d99a5",
        "tokenId": "820869899430",
        "transferCommitment": null,
      },
      {
        "artist": null,
        "artistAddress": "0x864d38b2989553080dbe893f7366b2dc675cac1f",
        "collection": null,
        "history": [],
        "id": "0xc75c9db3f953c6e96ca08440333bf3ea54df1c0f3f971436e60930c020cca735",
        "issuer": {
          "englishName": "New English Name",
          "id": "0x127944fda36c6b54a7b9d06177a9ee6a6dc83e8a",
        },
        "lockExternalTransfer": false,
        "metadataDigest": "bafkreibue6ax5qbviaq6rdcac3s3tjt7ihcgforfyf4wnl25tilcyoftsq",
        "originChain": "eip155:31337",
        "ownerAddress": "0x127944fda36c6b54a7b9d06177a9ee6a6dc83e8a",
        "royaltyBasisPoints": null,
        "royaltyReceiver": null,
        "tokenId": "899260479738",
        "transferCommitment": null,
      },
      {
        "artist": null,
        "artistAddress": "0x35902f4f4c94dcba48a71202b795e3ad2f75c56f",
        "collection": null,
        "history": [
          {
            "customHistory": {
              "metadataDigest": "bafkreibue6ax5qbviaq6rdcac3s3tjt7ihcgforfyf4wnl25tilcyoftsq",
              "metadataHistory": [
                {
                  "metadataDigest": "0x001c7d6fdb9885b02689d0d76b34fe73e7706b3e9e841c16a8f8264077d197cd",
                },
                {
                  "metadataDigest": "0xcc3b6344b207c582bd727005be2a5de5bbca7b46b590d9e9189f3a9a7ea8283e",
                },
              ],
            },
          },
        ],
        "id": "0xef3c967a0cc4c801bcaae979a0a54c0c35e0b96bd1bdc49b6ce1b2a6ec5f6a1e",
        "issuer": {
          "englishName": "New English Name",
          "id": "0x127944fda36c6b54a7b9d06177a9ee6a6dc83e8a",
        },
        "lockExternalTransfer": false,
        "metadataDigest": "bagaaiera75ireuiyxhyk2crybnonuhjgbwl7chd3qrmkvomgjfkpnvd66doa",
        "originChain": "eip155:31337",
        "ownerAddress": "0xb31f2241cb4d48dcf7825a75b46b4f6b13829a20",
        "royaltyBasisPoints": null,
        "royaltyReceiver": null,
        "tokenId": "997721594932",
        "transferCommitment": null,
      },
    ]
  `)

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

  expect(result.licensedUserWallets).toMatchInlineSnapshot(`
    [
      {
        "englishName": "Artist English",
        "issuedSRRs": [
          {
            "id": "0xebfde1531d7cf25871521637c861bee0a991a9346c677331530354a371280036",
            "metadataDigest": "bagaaieraqadwqzwbwlz2ewxdb6nvy4thckhy2vu6jsbhxll52sihrlgneo7q",
            "tokenId": "166670976800",
            "transferCommitment": null,
          },
        ],
        "originChain": null,
        "originalName": "Artist Original",
        "owners": [
          "0x853f2251666f9d8c45cc760ae10ab0278533d28c",
          "0x171ea52e619b7fdde870b328ccfb70217a3e32ae",
          "0xad87f0b51a8788192edd0640ab5ed58e48145c82",
        ],
        "salt": "0x64e604787cbf194841e7b68d7cd28786f6c9a0a3ab9f8b0a0e87cb4387ab0001",
        "threshold": 1,
        "userType": "artist",
        "walletAddress": "0x2a6fe6a7d388adef11545190e105b9266d3c4cd3",
      },
      {
        "englishName": "New English Name",
        "issuedSRRs": [
          {
            "id": "0x7722fed27cd514bc7a1899d245da7d84975bccfb021a43273cabe7e19dfc0835",
            "metadataDigest": "QmPMc4tcBsMqLRuCQtPmPe84bpSjrC3Ky7t3JWuHXYB4aS",
            "tokenId": "20398948250",
            "transferCommitment": null,
          },
          {
            "id": "0x87803be46c34e76b5c8a30760063c553ceea3caa6189f403c01b28c096b455ed",
            "metadataDigest": "bagaaieraop7u5tq2louh6wgonr2h3k3xottt2t76brqsffrgz4jsui3athva",
            "tokenId": "227568336751",
            "transferCommitment": null,
          },
          {
            "id": "0xda5483b655cdcefbca259d1e937e1a194bcc11d8ac7f68c1ffebf9e3decfd49a",
            "metadataDigest": "bafkreibue6ax5qbviaq6rdcac3s3tjt7ihcgforfyf4wnl25tilcyoftsr",
            "tokenId": "436104791396",
            "transferCommitment": null,
          },
          {
            "id": "0xcf9fc5c69736f9b9a904d8be01fb55f088efaa5df8851fdc3c4796fdc6ea1dc9",
            "metadataDigest": "bagaaieragc4yvxz4nmnpllpovwtnkpp5tqh3oxrf26lgxodnrb2v2bkkjmsq",
            "tokenId": "481668863629",
            "transferCommitment": null,
          },
          {
            "id": "0x48b977037c4f761ba0edec2b540ed6ee922900303ae4c57d237a16e0446f7d3f",
            "metadataDigest": "bagaaierajzl3r2r5jf2zi22il7bjfphv6fzgcom77dhqu44nbkasol3lejda",
            "tokenId": "56100282337",
            "transferCommitment": null,
          },
          {
            "id": "0x20102805b0adda42947801d0c0800d805d3707d932b059fa0844281712d4abf1",
            "metadataDigest": "bagaaierayddp4dbtsmdi5wgblh3d2dshzy2ooubergsxhh775n53f5zug2cq",
            "tokenId": "586127446272",
            "transferCommitment": null,
          },
          {
            "id": "0x3650b257e1a0da21566dff4a74355736a1f0d22e59409d468933689a33edbe2c",
            "metadataDigest": "bagaaieramdxa3kzthfvr4bhgbwx465g2ltbx4ya6gnwrk6hxlbbt4wviepra",
            "tokenId": "775264672222",
            "transferCommitment": null,
          },
          {
            "id": "0xcd645bb3aec38991b92dc8221126bdb7e87b6bbc4d06b97f7f91fd37c71bbf2f",
            "metadataDigest": "bafybeicqb5qoqtxcmjuib3jqi2boxw4g5rpifnn5ys7hbpdmsrvugdoehe",
            "tokenId": "820869899430",
            "transferCommitment": null,
          },
          {
            "id": "0xc75c9db3f953c6e96ca08440333bf3ea54df1c0f3f971436e60930c020cca735",
            "metadataDigest": "bafkreibue6ax5qbviaq6rdcac3s3tjt7ihcgforfyf4wnl25tilcyoftsq",
            "tokenId": "899260479738",
            "transferCommitment": null,
          },
          {
            "id": "0xef3c967a0cc4c801bcaae979a0a54c0c35e0b96bd1bdc49b6ce1b2a6ec5f6a1e",
            "metadataDigest": "bagaaiera75ireuiyxhyk2crybnonuhjgbwl7chd3qrmkvomgjfkpnvd66doa",
            "tokenId": "997721594932",
            "transferCommitment": null,
          },
        ],
        "originChain": null,
        "originalName": "New Original Name",
        "owners": [
          "0x853f2251666f9d8c45cc760ae10ab0278533d28c",
          "0x171ea52e619b7fdde870b328ccfb70217a3e32ae",
          "0xad87f0b51a8788192edd0640ab5ed58e48145c82",
        ],
        "salt": "0x64e604787cbf194841e7b68d7cd28786f6c9a0a3ab9f8b0a0e87cb4387ab0002",
        "threshold": 1,
        "userType": "handler",
        "walletAddress": "0x127944fda36c6b54a7b9d06177a9ee6a6dc83e8a",
      },
    ]
  `)
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

  expect(result.srrmetadataHistories).toMatchInlineSnapshot(`
    [
      {
        "metadataDigest": "QmPMc4tcBsMqLRuCQtPmPe84bpSjrC3Ky7t3JWuHXYB4aS",
        "srr": {
          "id": "0x7722fed27cd514bc7a1899d245da7d84975bccfb021a43273cabe7e19dfc0835",
          "metadataDigest": "QmPMc4tcBsMqLRuCQtPmPe84bpSjrC3Ky7t3JWuHXYB4aS",
          "metadataHistory": [
            {
              "metadataDigest": "QmPMc4tcBsMqLRuCQtPmPe84bpSjrC3Ky7t3JWuHXYB4aS",
              "srr": {
                "metadataDigest": "QmPMc4tcBsMqLRuCQtPmPe84bpSjrC3Ky7t3JWuHXYB4aS",
              },
            },
          ],
          "originChain": "eip155:31337",
          "transferCommitment": null,
        },
      },
      {
        "metadataDigest": "bagaaierayddp4dbtsmdi5wgblh3d2dshzy2ooubergsxhh775n53f5zug2cq",
        "srr": {
          "id": "0x20102805b0adda42947801d0c0800d805d3707d932b059fa0844281712d4abf1",
          "metadataDigest": "bagaaierayddp4dbtsmdi5wgblh3d2dshzy2ooubergsxhh775n53f5zug2cq",
          "metadataHistory": [
            {
              "metadataDigest": "bagaaierayddp4dbtsmdi5wgblh3d2dshzy2ooubergsxhh775n53f5zug2cq",
              "srr": {
                "metadataDigest": "bagaaierayddp4dbtsmdi5wgblh3d2dshzy2ooubergsxhh775n53f5zug2cq",
              },
            },
          ],
          "originChain": "eip155:31337",
          "transferCommitment": null,
        },
      },
      {
        "metadataDigest": "bagaaieraqadwqzwbwlz2ewxdb6nvy4thckhy2vu6jsbhxll52sihrlgneo7q",
        "srr": {
          "id": "0xebfde1531d7cf25871521637c861bee0a991a9346c677331530354a371280036",
          "metadataDigest": "bagaaieraqadwqzwbwlz2ewxdb6nvy4thckhy2vu6jsbhxll52sihrlgneo7q",
          "metadataHistory": [
            {
              "metadataDigest": "bagaaieraqadwqzwbwlz2ewxdb6nvy4thckhy2vu6jsbhxll52sihrlgneo7q",
              "srr": {
                "metadataDigest": "bagaaieraqadwqzwbwlz2ewxdb6nvy4thckhy2vu6jsbhxll52sihrlgneo7q",
              },
            },
          ],
          "originChain": "eip155:31337",
          "transferCommitment": null,
        },
      },
      {
        "metadataDigest": "bagaaieraop7u5tq2louh6wgonr2h3k3xottt2t76brqsffrgz4jsui3athva",
        "srr": {
          "id": "0x87803be46c34e76b5c8a30760063c553ceea3caa6189f403c01b28c096b455ed",
          "metadataDigest": "bagaaieraop7u5tq2louh6wgonr2h3k3xottt2t76brqsffrgz4jsui3athva",
          "metadataHistory": [
            {
              "metadataDigest": "bagaaieraop7u5tq2louh6wgonr2h3k3xottt2t76brqsffrgz4jsui3athva",
              "srr": {
                "metadataDigest": "bagaaieraop7u5tq2louh6wgonr2h3k3xottt2t76brqsffrgz4jsui3athva",
              },
            },
          ],
          "originChain": "eip155:31337",
          "transferCommitment": null,
        },
      },
      {
        "metadataDigest": "bagaaieramdxa3kzthfvr4bhgbwx465g2ltbx4ya6gnwrk6hxlbbt4wviepra",
        "srr": {
          "id": "0x3650b257e1a0da21566dff4a74355736a1f0d22e59409d468933689a33edbe2c",
          "metadataDigest": "bagaaieramdxa3kzthfvr4bhgbwx465g2ltbx4ya6gnwrk6hxlbbt4wviepra",
          "metadataHistory": [
            {
              "metadataDigest": "bagaaieramdxa3kzthfvr4bhgbwx465g2ltbx4ya6gnwrk6hxlbbt4wviepra",
              "srr": {
                "metadataDigest": "bagaaieramdxa3kzthfvr4bhgbwx465g2ltbx4ya6gnwrk6hxlbbt4wviepra",
              },
            },
          ],
          "originChain": "eip155:31337",
          "transferCommitment": null,
        },
      },
      {
        "metadataDigest": "bagaaierajzl3r2r5jf2zi22il7bjfphv6fzgcom77dhqu44nbkasol3lejda",
        "srr": {
          "id": "0x48b977037c4f761ba0edec2b540ed6ee922900303ae4c57d237a16e0446f7d3f",
          "metadataDigest": "bagaaierajzl3r2r5jf2zi22il7bjfphv6fzgcom77dhqu44nbkasol3lejda",
          "metadataHistory": [
            {
              "metadataDigest": "bagaaierajzl3r2r5jf2zi22il7bjfphv6fzgcom77dhqu44nbkasol3lejda",
              "srr": {
                "metadataDigest": "bagaaierajzl3r2r5jf2zi22il7bjfphv6fzgcom77dhqu44nbkasol3lejda",
              },
            },
          ],
          "originChain": "eip155:31337",
          "transferCommitment": null,
        },
      },
      {
        "metadataDigest": "bagaaieragc4yvxz4nmnpllpovwtnkpp5tqh3oxrf26lgxodnrb2v2bkkjmsq",
        "srr": {
          "id": "0xcf9fc5c69736f9b9a904d8be01fb55f088efaa5df8851fdc3c4796fdc6ea1dc9",
          "metadataDigest": "bagaaieragc4yvxz4nmnpllpovwtnkpp5tqh3oxrf26lgxodnrb2v2bkkjmsq",
          "metadataHistory": [
            {
              "metadataDigest": "bagaaieragc4yvxz4nmnpllpovwtnkpp5tqh3oxrf26lgxodnrb2v2bkkjmsq",
              "srr": {
                "metadataDigest": "bagaaieragc4yvxz4nmnpllpovwtnkpp5tqh3oxrf26lgxodnrb2v2bkkjmsq",
              },
            },
          ],
          "originChain": "eip155:31337",
          "transferCommitment": null,
        },
      },
      {
        "metadataDigest": "bagaaiera75ireuiyxhyk2crybnonuhjgbwl7chd3qrmkvomgjfkpnvd66doa",
        "srr": {
          "id": "0xef3c967a0cc4c801bcaae979a0a54c0c35e0b96bd1bdc49b6ce1b2a6ec5f6a1e",
          "metadataDigest": "bagaaiera75ireuiyxhyk2crybnonuhjgbwl7chd3qrmkvomgjfkpnvd66doa",
          "metadataHistory": [
            {
              "metadataDigest": "bagaaiera75ireuiyxhyk2crybnonuhjgbwl7chd3qrmkvomgjfkpnvd66doa",
              "srr": {
                "metadataDigest": "bagaaiera75ireuiyxhyk2crybnonuhjgbwl7chd3qrmkvomgjfkpnvd66doa",
              },
            },
          ],
          "originChain": "eip155:31337",
          "transferCommitment": null,
        },
      },
      {
        "metadataDigest": "bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi",
        "srr": {
          "id": "0xcd645bb3aec38991b92dc8221126bdb7e87b6bbc4d06b97f7f91fd37c71bbf2f",
          "metadataDigest": "bafybeicqb5qoqtxcmjuib3jqi2boxw4g5rpifnn5ys7hbpdmsrvugdoehe",
          "metadataHistory": [
            {
              "metadataDigest": "bafybeicqb5qoqtxcmjuib3jqi2boxw4g5rpifnn5ys7hbpdmsrvugdoehe",
              "srr": {
                "metadataDigest": "bafybeicqb5qoqtxcmjuib3jqi2boxw4g5rpifnn5ys7hbpdmsrvugdoehe",
              },
            },
            {
              "metadataDigest": "bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi",
              "srr": {
                "metadataDigest": "bafybeicqb5qoqtxcmjuib3jqi2boxw4g5rpifnn5ys7hbpdmsrvugdoehe",
              },
            },
          ],
          "originChain": "eip155:31337",
          "transferCommitment": null,
        },
      },
      {
        "metadataDigest": "bafybeicqb5qoqtxcmjuib3jqi2boxw4g5rpifnn5ys7hbpdmsrvugdoehe",
        "srr": {
          "id": "0xcd645bb3aec38991b92dc8221126bdb7e87b6bbc4d06b97f7f91fd37c71bbf2f",
          "metadataDigest": "bafybeicqb5qoqtxcmjuib3jqi2boxw4g5rpifnn5ys7hbpdmsrvugdoehe",
          "metadataHistory": [
            {
              "metadataDigest": "bafybeicqb5qoqtxcmjuib3jqi2boxw4g5rpifnn5ys7hbpdmsrvugdoehe",
              "srr": {
                "metadataDigest": "bafybeicqb5qoqtxcmjuib3jqi2boxw4g5rpifnn5ys7hbpdmsrvugdoehe",
              },
            },
            {
              "metadataDigest": "bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi",
              "srr": {
                "metadataDigest": "bafybeicqb5qoqtxcmjuib3jqi2boxw4g5rpifnn5ys7hbpdmsrvugdoehe",
              },
            },
          ],
          "originChain": "eip155:31337",
          "transferCommitment": null,
        },
      },
      {
        "metadataDigest": "bafkreibue6ax5qbviaq6rdcac3s3tjt7ihcgforfyf4wnl25tilcyoftsr",
        "srr": {
          "id": "0xda5483b655cdcefbca259d1e937e1a194bcc11d8ac7f68c1ffebf9e3decfd49a",
          "metadataDigest": "bafkreibue6ax5qbviaq6rdcac3s3tjt7ihcgforfyf4wnl25tilcyoftsr",
          "metadataHistory": [
            {
              "metadataDigest": "bafkreibue6ax5qbviaq6rdcac3s3tjt7ihcgforfyf4wnl25tilcyoftsr",
              "srr": {
                "metadataDigest": "bafkreibue6ax5qbviaq6rdcac3s3tjt7ihcgforfyf4wnl25tilcyoftsr",
              },
            },
          ],
          "originChain": "eip155:31337",
          "transferCommitment": null,
        },
      },
      {
        "metadataDigest": "bafkreibue6ax5qbviaq6rdcac3s3tjt7ihcgforfyf4wnl25tilcyoftsq",
        "srr": {
          "id": "0xc75c9db3f953c6e96ca08440333bf3ea54df1c0f3f971436e60930c020cca735",
          "metadataDigest": "bafkreibue6ax5qbviaq6rdcac3s3tjt7ihcgforfyf4wnl25tilcyoftsq",
          "metadataHistory": [
            {
              "metadataDigest": "bafkreibue6ax5qbviaq6rdcac3s3tjt7ihcgforfyf4wnl25tilcyoftsq",
              "srr": {
                "metadataDigest": "bafkreibue6ax5qbviaq6rdcac3s3tjt7ihcgforfyf4wnl25tilcyoftsq",
              },
            },
          ],
          "originChain": "eip155:31337",
          "transferCommitment": null,
        },
      },
    ]
  `)
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

  expect(result.metaTxRequestTypes).toMatchInlineSnapshot(`
    [
      {
        "id": "0xa2c5a6fe8768fd09231270ba9fee50bd8355a89a393cedf6d8171fe3a7fa075c",
        "typeHash": "0xa2c5a6fe8768fd09231270ba9fee50bd8355a89a393cedf6d8171fe3a7fa075c",
        "typeString": "BulkIssueSendBatch(address from,uint256 nonce,bytes32 merkleRoot)",
      },
      {
        "id": "0x0172d8aef956076d95cd17382b234ebf2df603970f8b6389e750dc1473b7bf3a",
        "typeHash": "0x0172d8aef956076d95cd17382b234ebf2df603970f8b6389e750dc1473b7bf3a",
        "typeString": "BulkSendBatch(address from,uint256 nonce,bytes32 merkleRoot)",
      },
      {
        "id": "0x052d8d1acdbf73c1b466436c3bc062709a28af704363f8b326314d7ab01ce47b",
        "typeHash": "0x052d8d1acdbf73c1b466436c3bc062709a28af704363f8b326314d7ab01ce47b",
        "typeString": "BulkTransferSendBatch(address from,uint256 nonce,bytes32 merkleRoot)",
      },
      {
        "id": "0x9b8c9386754e3eaa398edc58c12b52366171172ff1593f9b3c204f735db04333",
        "typeHash": "0x9b8c9386754e3eaa398edc58c12b52366171172ff1593f9b3c204f735db04333",
        "typeString": "CollectionAddHistory(address from,uint256 nonce,bytes data,address destination,uint256[] tokenIds,uint256[] customHistoryIds)",
      },
      {
        "id": "0x706c1f7bd199d621f4b28f17019128660044cd3f15bb02749fee5af4d07ce971",
        "typeHash": "0x706c1f7bd199d621f4b28f17019128660044cd3f15bb02749fee5af4d07ce971",
        "typeString": "CollectionApproveSRRByCommitmentV2(address from,uint256 nonce,bytes data,address destination,uint256 tokenId,bytes32 commitment,string historyMetadataHash)",
      },
      {
        "id": "0xed2b2e4d2ccf36c92564638fa6e4b4a8269a22572966daf5ae6d51a64483853d",
        "typeHash": "0xed2b2e4d2ccf36c92564638fa6e4b4a8269a22572966daf5ae6d51a64483853d",
        "typeString": "CollectionApproveSRRByCommitmentWithCustomHistoryIdV2(address from,uint256 nonce,bytes data,address destination,uint256 tokenId,bytes32 commitment,string historyMetadataHash,uint256 customHistoryId)",
      },
      {
        "id": "0xcf263978afe08bf96b3970c98d52b9e859b13c48c9af9e81b96067d0f3ee52a4",
        "typeHash": "0xcf263978afe08bf96b3970c98d52b9e859b13c48c9af9e81b96067d0f3ee52a4",
        "typeString": "CollectionCancelSRRCommitment(address from,uint256 nonce,address destination,uint256 tokenId)",
      },
      {
        "id": "0xf9ecd4ef65c9b99f50e0c984f293286d31fce07d8cc05ba149887855c0d0352b",
        "typeHash": "0xf9ecd4ef65c9b99f50e0c984f293286d31fce07d8cc05ba149887855c0d0352b",
        "typeString": "CollectionCreateSRR(address from,uint256 nonce,bytes data,address destination,bool isPrimaryIssuer,address artistAddress,string metadataCID,bool lockExternalTransfer,address to,address royaltyReceiver,uint16 royaltyBasisPoints)",
      },
      {
        "id": "0x6cd612fe41a1ac5b7afb6cb0b942bcbaeb050b2528aaa34eccb7acc69f2ae0bf",
        "typeHash": "0x6cd612fe41a1ac5b7afb6cb0b942bcbaeb050b2528aaa34eccb7acc69f2ae0bf",
        "typeString": "CollectionFactoryCreateCollection(address from,uint256 nonce,bytes data,string name,string symbol,bytes32 salt)",
      },
      {
        "id": "0x8648ca5094960f0e19bdff764e6b9b70484c54375d7afc9efe496d8bc93335a1",
        "typeHash": "0x8648ca5094960f0e19bdff764e6b9b70484c54375d7afc9efe496d8bc93335a1",
        "typeString": "CollectionSetLockExternalTransfer(address from,uint256 nonce,address destination,uint256 tokenId,bool flag)",
      },
      {
        "id": "0x6e4a36acbcd7a4b37f49d842a89b415ccfd7e76dd90e9901c5f4ecbfc2c87b3a",
        "typeHash": "0x6e4a36acbcd7a4b37f49d842a89b415ccfd7e76dd90e9901c5f4ecbfc2c87b3a",
        "typeString": "CollectionTransferFromWithProvenanceV2(address from,uint256 nonce,bytes data,address destination,address to,uint256 tokenId,string historyMetadataHash,uint256 customHistoryId,bool isIntermediary)",
      },
      {
        "id": "0xa760cce759820221fe9ff186c207372e9f0a8c1ddbaa10b38bd4178cf0f26da6",
        "typeHash": "0xa760cce759820221fe9ff186c207372e9f0a8c1ddbaa10b38bd4178cf0f26da6",
        "typeString": "CollectionTransferOwnership(address from,uint256 nonce,address destination,address newOwner)",
      },
      {
        "id": "0x8cc39e4b9764b571078c76c303a1da6e54128ddaffe37718ae8bfeb44ea65606",
        "typeHash": "0x8cc39e4b9764b571078c76c303a1da6e54128ddaffe37718ae8bfeb44ea65606",
        "typeString": "CollectionUpdateSRR(address from,uint256 nonce,address destination,uint256 tokenId,bool isPrimaryIssuer,address artistAddress)",
      },
      {
        "id": "0x07d16a7371085e8f0f61d0d29741714c9f0e244c83d522adb54a15fd2f39e2ca",
        "typeHash": "0x07d16a7371085e8f0f61d0d29741714c9f0e244c83d522adb54a15fd2f39e2ca",
        "typeString": "CollectionUpdateSRRMetadataWithCid(address from,uint256 nonce,bytes data,address destination,uint256 tokenId,string metadataCID)",
      },
      {
        "id": "0x39e8d8ef714a9190229f8577e4b79fb4fdd8133a3a9acdda0286c2e210f3d3c0",
        "typeHash": "0x39e8d8ef714a9190229f8577e4b79fb4fdd8133a3a9acdda0286c2e210f3d3c0",
        "typeString": "CollectionUpdateSRRRoyalty(address from,uint256 nonce,address destination,uint256 tokenId,address royaltyReceiver,uint16 royaltyBasisPoints)",
      },
      {
        "id": "0x1f6bcc34496ca1b52d584f9a76e6a39b27989a9c186f8bcac08b53d1b03bb293",
        "typeHash": "0x1f6bcc34496ca1b52d584f9a76e6a39b27989a9c186f8bcac08b53d1b03bb293",
        "typeString": "StartrailRegistryAddHistory(address from,uint256 nonce,bytes data,uint256[] tokenIds,uint256[] customHistoryIds)",
      },
      {
        "id": "0xb4d22bf06a762d0a27f1c25c8a258e0982dbc92abe4d6d72fdbec60d49464daa",
        "typeHash": "0xb4d22bf06a762d0a27f1c25c8a258e0982dbc92abe4d6d72fdbec60d49464daa",
        "typeString": "StartrailRegistryApproveSRRByCommitment(address from,uint256 nonce,bytes data,uint256 tokenId,bytes32 commitment,string historyMetadataDigest)",
      },
      {
        "id": "0xa49c118caf6532f50dd29e1b916e320e939519f3a57200537ca2afe255fb5f9d",
        "typeHash": "0xa49c118caf6532f50dd29e1b916e320e939519f3a57200537ca2afe255fb5f9d",
        "typeString": "StartrailRegistryApproveSRRByCommitmentV2(address from,uint256 nonce,bytes data,uint256 tokenId,bytes32 commitment,string historyMetadataHash)",
      },
      {
        "id": "0xebdf6224c1bb9fe61ea31b37d9b143c5b2c3b390aa1970cd68f6e4cdcb087e06",
        "typeHash": "0xebdf6224c1bb9fe61ea31b37d9b143c5b2c3b390aa1970cd68f6e4cdcb087e06",
        "typeString": "StartrailRegistryApproveSRRByCommitmentWithCustomHistoryId(address from,uint256 nonce,bytes data,uint256 tokenId,bytes32 commitment,string historyMetadataDigest,uint256 customHistoryId)",
      },
      {
        "id": "0xc622d317caa3d983ec9a71e409381681f2b6e5b401a3a3f76a9a279e7e4f99d2",
        "typeHash": "0xc622d317caa3d983ec9a71e409381681f2b6e5b401a3a3f76a9a279e7e4f99d2",
        "typeString": "StartrailRegistryApproveSRRByCommitmentWithCustomHistoryIdV2(address from,uint256 nonce,bytes data,uint256 tokenId,bytes32 commitment,string historyMetadataHash,uint256 customHistoryId)",
      },
      {
        "id": "0xfc61e554d8da03571436be8820948b7c044eb5abfddb2394091c1fdebc71b5fd",
        "typeHash": "0xfc61e554d8da03571436be8820948b7c044eb5abfddb2394091c1fdebc71b5fd",
        "typeString": "StartrailRegistryCancelSRRCommitment(address from,uint256 nonce,uint256 tokenId)",
      },
      {
        "id": "0xe4330d44d67f8acb0ab9eade18d318a8ab777e0a51be17bc9d7fce86d3cb900f",
        "typeHash": "0xe4330d44d67f8acb0ab9eade18d318a8ab777e0a51be17bc9d7fce86d3cb900f",
        "typeString": "StartrailRegistryCreateSRRFromLicensedUserWithIPFSAndRoyalty(address from,uint256 nonce,bytes data,bool isPrimaryIssuer,address artistAddress,string metadataCID,bool lockExternalTransfer,address to,address royaltyReceiver,uint16 royaltyBasisPoints)",
      },
      {
        "id": "0xbef83078847679e2da773c6b3be6b96d45b196fe69acdd04f4a54671d57ff4aa",
        "typeHash": "0xbef83078847679e2da773c6b3be6b96d45b196fe69acdd04f4a54671d57ff4aa",
        "typeString": "StartrailRegistryCreateSRRFromLicensedUserWithRoyalty(address from,uint256 nonce,bytes data,bool isPrimaryIssuer,address artistAddress,bytes32 metadataDigest,string metadataCID,bool lockExternalTransfer,address to,address royaltyReceiver,uint16 royaltyBasisPoints)",
      },
      {
        "id": "0x43b411a61269fac54b60a3a5c04241addcc8c4e9e4844916999593fd135aa9f6",
        "typeHash": "0x43b411a61269fac54b60a3a5c04241addcc8c4e9e4844916999593fd135aa9f6",
        "typeString": "StartrailRegistrySetLockExternalTransfer(address from,uint256 nonce,uint256 tokenId,bool flag)",
      },
      {
        "id": "0xbb7ee9c4ba6fdc75187418d24acba89107ee1d0afb3596dcdb11e70703c25803",
        "typeHash": "0xbb7ee9c4ba6fdc75187418d24acba89107ee1d0afb3596dcdb11e70703c25803",
        "typeString": "StartrailRegistryTransferFromWithProvenance(address from,uint256 nonce,bytes data,address to,uint256 tokenId,string historyMetadataDigest,uint256 customHistoryId,bool isIntermediary)",
      },
      {
        "id": "0xdff54f0f79270c4bae7b490205026c9cf16c59d74e264f31da9b2b8e6bacad18",
        "typeHash": "0xdff54f0f79270c4bae7b490205026c9cf16c59d74e264f31da9b2b8e6bacad18",
        "typeString": "StartrailRegistryTransferFromWithProvenanceV2(address from,uint256 nonce,bytes data,address to,uint256 tokenId,string historyMetadataHash,uint256 customHistoryId,bool isIntermediary)",
      },
      {
        "id": "0xf6f490ad3237fb8a6611e8cb20e7dc248e4df8fb091d3ebebfb536dc98e54397",
        "typeHash": "0xf6f490ad3237fb8a6611e8cb20e7dc248e4df8fb091d3ebebfb536dc98e54397",
        "typeString": "StartrailRegistryUpdateSRR(address from,uint256 nonce,uint256 tokenId,bool isPrimaryIssuer,address artistAddress)",
      },
      {
        "id": "0x2569bec027dd03c3cf0369ae42a7b5bf330297ea9c33d1932890e79d28487111",
        "typeHash": "0x2569bec027dd03c3cf0369ae42a7b5bf330297ea9c33d1932890e79d28487111",
        "typeString": "StartrailRegistryUpdateSRRMetadataWithCid(address from,uint256 nonce,bytes data,uint256 tokenId,string metadataCID)",
      },
      {
        "id": "0x6242683d31e79def600a47158bc2d52201d339517d934b76bdb5a4b4812ada16",
        "typeHash": "0x6242683d31e79def600a47158bc2d52201d339517d934b76bdb5a4b4812ada16",
        "typeString": "StartrailRegistryUpdateSRRRoyalty(address from,uint256 nonce,uint256 tokenId,address royaltyReceiver,uint16 royaltyBasisPoints)",
      },
      {
        "id": "0xe40b02b26d5443f4479036538f991a995624f5cc199ecab72a0dde126115a16c",
        "typeHash": "0xe40b02b26d5443f4479036538f991a995624f5cc199ecab72a0dde126115a16c",
        "typeString": "WalletAddOwner(address from,uint256 nonce,address wallet,address owner,uint256 threshold)",
      },
      {
        "id": "0xff1b6ae7ba3b6fcaf8441b4b7ebbebb22444db035e8eb25feb17296a6c00b54b",
        "typeHash": "0xff1b6ae7ba3b6fcaf8441b4b7ebbebb22444db035e8eb25feb17296a6c00b54b",
        "typeString": "WalletChangeThreshold(address from,uint256 nonce,address wallet,uint256 threshold)",
      },
      {
        "id": "0x9eb400930ea9ba11485a1fbe22ec6b4f1f4b74ec9c1f867ed95185ef2f67092c",
        "typeHash": "0x9eb400930ea9ba11485a1fbe22ec6b4f1f4b74ec9c1f867ed95185ef2f67092c",
        "typeString": "WalletRemoveOwner(address from,uint256 nonce,address wallet,address prevOwner,address owner,uint256 threshold)",
      },
      {
        "id": "0x72aa5b313beffb167251bd88ac4c617700ece940a29fc55df7dea54d0e47f5c6",
        "typeHash": "0x72aa5b313beffb167251bd88ac4c617700ece940a29fc55df7dea54d0e47f5c6",
        "typeString": "WalletSetEnglishName(address from,uint256 nonce,bytes data,address wallet,string name)",
      },
      {
        "id": "0x425002ddfe8a5210fcf678ff38ca336c9b3babbf2f10efa5fdeaace5951e2b48",
        "typeHash": "0x425002ddfe8a5210fcf678ff38ca336c9b3babbf2f10efa5fdeaace5951e2b48",
        "typeString": "WalletSetOriginalName(address from,uint256 nonce,bytes data,address wallet,string name)",
      },
      {
        "id": "0xa32f0c35f201b6260c799d8f4f0c66d8d05a3e60db8cdeb795ab26987366a155",
        "typeHash": "0xa32f0c35f201b6260c799d8f4f0c66d8d05a3e60db8cdeb795ab26987366a155",
        "typeString": "WalletSwapOwner(address from,uint256 nonce,address wallet,address prevOwner,address oldOwner,address newOwner)",
      },
    ]
  `)
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
    }
  }
`
  const result = await client.query(query)

  expect(result.srrprovenances).toMatchInlineSnapshot(`
    [
      {
        "customHistory": null,
        "from": "0x127944fda36c6b54a7b9d06177a9ee6a6dc83e8a",
        "isIntermediary": false,
        "metadataDigest": "0xba136728b9ccfc56aa07d354fb7b5b026fa8123ad74f2fdb7a938bdf08c77a70",
        "metadataURI": "https://api.startrail.io/api/v1/metadata/0xba136728b9ccfc56aa07d354fb7b5b026fa8123ad74f2fdb7a938bdf08c77a70.json",
        "srr": {
          "id": "0xef3c967a0cc4c801bcaae979a0a54c0c35e0b96bd1bdc49b6ce1b2a6ec5f6a1e",
        },
        "to": "0xf1dbd215d72d99422693ca61f7bbecfcd0edb16f",
      },
      {
        "customHistory": null,
        "from": "0x127944fda36c6b54a7b9d06177a9ee6a6dc83e8a",
        "isIntermediary": true,
        "metadataDigest": "0xba136728b9ccfc56aa07d354fb7b5b026fa8123ad74f2fdb7a938bdf08c77a70",
        "metadataURI": "https://api.startrail.io/api/v1/metadata/0xba136728b9ccfc56aa07d354fb7b5b026fa8123ad74f2fdb7a938bdf08c77a70.json",
        "srr": {
          "id": "0x3650b257e1a0da21566dff4a74355736a1f0d22e59409d468933689a33edbe2c",
        },
        "to": "0xf1dbd215d72d99422693ca61f7bbecfcd0edb16f",
      },
      {
        "customHistory": null,
        "from": "0xf1dbd215d72d99422693ca61f7bbecfcd0edb16f",
        "isIntermediary": false,
        "metadataDigest": "0xba136728b9ccfc56aa07d354fb7b5b026fa8123ad74f2fdb7a938bdf08c77a70",
        "metadataURI": "https://api.startrail.io/api/v1/metadata/0xba136728b9ccfc56aa07d354fb7b5b026fa8123ad74f2fdb7a938bdf08c77a70.json",
        "srr": {
          "id": "0xef3c967a0cc4c801bcaae979a0a54c0c35e0b96bd1bdc49b6ce1b2a6ec5f6a1e",
        },
        "to": "0xb31f2241cb4d48dcf7825a75b46b4f6b13829a20",
      },
      {
        "customHistory": null,
        "from": "0xf1dbd215d72d99422693ca61f7bbecfcd0edb16f",
        "isIntermediary": false,
        "metadataDigest": "",
        "metadataURI": "",
        "srr": {
          "id": "0x3650b257e1a0da21566dff4a74355736a1f0d22e59409d468933689a33edbe2c",
        },
        "to": "0xb31f2241cb4d48dcf7825a75b46b4f6b13829a20",
      },
      {
        "customHistory": null,
        "from": "0xb31f2241cb4d48dcf7825a75b46b4f6b13829a20",
        "isIntermediary": false,
        "metadataDigest": "",
        "metadataURI": "",
        "srr": {
          "id": "0x3650b257e1a0da21566dff4a74355736a1f0d22e59409d468933689a33edbe2c",
        },
        "to": "0xfa08ed057457f857e9f1672cd979f5ef0628cd9a",
      },
      {
        "customHistory": {
          "id": "1",
        },
        "from": "0x127944fda36c6b54a7b9d06177a9ee6a6dc83e8a",
        "isIntermediary": false,
        "metadataDigest": "bagaaieraukyyymxrksn6eustctujohjmzo6i5abpnngfmbh2pmtqdmls4kna",
        "metadataURI": "ipfs://bagaaieraukyyymxrksn6eustctujohjmzo6i5abpnngfmbh2pmtqdmls4kna",
        "srr": {
          "id": "0x20102805b0adda42947801d0c0800d805d3707d932b059fa0844281712d4abf1",
        },
        "to": "0xf1dbd215d72d99422693ca61f7bbecfcd0edb16f",
      },
      {
        "customHistory": {
          "id": "1",
        },
        "from": "0x127944fda36c6b54a7b9d06177a9ee6a6dc83e8a",
        "isIntermediary": false,
        "metadataDigest": "bafkreidd2cdz7telrdi554utn5xhezacqpvdrrrin6r6rmsmictdarlsu4",
        "metadataURI": "ipfs://bafkreidd2cdz7telrdi554utn5xhezacqpvdrrrin6r6rmsmictdarlsu4",
        "srr": {
          "id": "0x48b977037c4f761ba0edec2b540ed6ee922900303ae4c57d237a16e0446f7d3f",
        },
        "to": "0xdfb64492cdd303e86788af19123cf9f1bc65b084",
      },
      {
        "customHistory": null,
        "from": "0x127944fda36c6b54a7b9d06177a9ee6a6dc83e8a",
        "isIntermediary": false,
        "metadataDigest": "",
        "metadataURI": "",
        "srr": {
          "id": "0x87803be46c34e76b5c8a30760063c553ceea3caa6189f403c01b28c096b455ed",
        },
        "to": "0xbb1010f86fcfd7223f5e95dcb7899af069493b80",
      },
      {
        "customHistory": {
          "id": "1",
        },
        "from": "0x127944fda36c6b54a7b9d06177a9ee6a6dc83e8a",
        "isIntermediary": false,
        "metadataDigest": "bafkreibue6ax5qbviaq6rdcac3s3tjt7ihcgforfyf4wnl25tilcyoftsq",
        "metadataURI": "ipfs://bafkreibue6ax5qbviaq6rdcac3s3tjt7ihcgforfyf4wnl25tilcyoftsq",
        "srr": {
          "id": "0xcf9fc5c69736f9b9a904d8be01fb55f088efaa5df8851fdc3c4796fdc6ea1dc9",
        },
        "to": "0xf1dbd215d72d99422693ca61f7bbecfcd0edb16f",
      },
      {
        "customHistory": null,
        "from": "0x127944fda36c6b54a7b9d06177a9ee6a6dc83e8a",
        "isIntermediary": false,
        "metadataDigest": "",
        "metadataURI": "",
        "srr": {
          "id": "0xda5483b655cdcefbca259d1e937e1a194bcc11d8ac7f68c1ffebf9e3decfd49a",
        },
        "to": "0xbb1010f86fcfd7223f5e95dcb7899af069493b80",
      },
      {
        "customHistory": {
          "id": "2",
        },
        "from": "0x127944fda36c6b54a7b9d06177a9ee6a6dc83e8a",
        "isIntermediary": true,
        "metadataDigest": "bafybeibro7fxpk7sk2nfvslumxraol437ug35qz4xx2p7ygjctunb2wi3i",
        "metadataURI": "ipfs://bafybeibro7fxpk7sk2nfvslumxraol437ug35qz4xx2p7ygjctunb2wi3i",
        "srr": {
          "id": "0xcd645bb3aec38991b92dc8221126bdb7e87b6bbc4d06b97f7f91fd37c71bbf2f",
        },
        "to": "0x921aff57fc983b1461bf94c3b9dfafbb8423d6a0",
      },
      {
        "customHistory": {
          "id": "1",
        },
        "from": "0x127944fda36c6b54a7b9d06177a9ee6a6dc83e8a",
        "isIntermediary": true,
        "metadataDigest": "bafkreibue6ax5qbviaq6rdcac3s3tjt7ihcgforfyf4wnl25tilcyoftsq",
        "metadataURI": "ipfs://bafkreibue6ax5qbviaq6rdcac3s3tjt7ihcgforfyf4wnl25tilcyoftsq",
        "srr": {
          "id": "0x7722fed27cd514bc7a1899d245da7d84975bccfb021a43273cabe7e19dfc0835",
        },
        "to": "0xf1dbd215d72d99422693ca61f7bbecfcd0edb16f",
      },
    ]
  `)
})

// ignoring createdAt field since it's timestamp
test('srrtransferCommits', async () => {
  const query = `
  {
    srrtransferCommits {
      id
      commitment
      lastAction
    }
  }
`
  const result = await client.query(query)

  expect(result.srrtransferCommits).toMatchInlineSnapshot(`
    [
      {
        "commitment": null,
        "id": "0x3650b257e1a0da21566dff4a74355736a1f0d22e59409d468933689a33edbe2c",
        "lastAction": "transfer",
      },
      {
        "commitment": null,
        "id": "0xcd645bb3aec38991b92dc8221126bdb7e87b6bbc4d06b97f7f91fd37c71bbf2f",
        "lastAction": "transfer",
      },
      {
        "commitment": null,
        "id": "0xcf9fc5c69736f9b9a904d8be01fb55f088efaa5df8851fdc3c4796fdc6ea1dc9",
        "lastAction": "transfer",
      },
      {
        "commitment": null,
        "id": "0xef3c967a0cc4c801bcaae979a0a54c0c35e0b96bd1bdc49b6ce1b2a6ec5f6a1e",
        "lastAction": "transfer",
      },
    ]
  `)
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
