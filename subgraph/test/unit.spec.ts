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
    srrs(orderBy: id) {
      id
      collection {
        id
      }
      tokenId
      ownerAddress
      artistAddress
      royaltyReceiver
      royaltyPercentage
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
    }
  }
`
  const result = await client.query(query)
  expect(result.srrs).toMatchInlineSnapshot(`
    Array [
      Object {
        "artist": null,
        "artistAddress": "0x35902f4f4c94dcba48a71202b795e3ad2f75c56f",
        "collection": null,
        "history": Array [],
        "id": "129020582412",
        "issuer": Object {
          "englishName": "New English Name",
          "id": "0x2c1eda2d80e82a9b2b26b64da21e341636e8bab4",
        },
        "lockExternalTransfer": false,
        "metadataDigest": "0x001c7d6fdb9885b02689d0d76b34fe73e7706b3e9e841c16a8f8264077d197cd",
        "originChain": "eip155:31337",
        "ownerAddress": "0xdfb64492cdd303e86788af19123cf9f1bc65b084",
        "royaltyPercentage": null,
        "royaltyReceiver": null,
        "tokenId": "129020582412",
        "transferCommitment": null,
      },
      Object {
        "artist": null,
        "artistAddress": "0x35902f4f4c94dcba48a71202b795e3ad2f75c56f",
        "collection": null,
        "history": Array [],
        "id": "245330455638",
        "issuer": Object {
          "englishName": "Artist English",
          "id": "0x84a11021459404dae94b2c5e6f215a51f05d2dab",
        },
        "lockExternalTransfer": false,
        "metadataDigest": "0x4c8f18581c0167eb90a761b4a304e009b924f03b619a0c0e8ea3adfce20aee64",
        "originChain": "eip155:31337",
        "ownerAddress": "0x84a11021459404dae94b2c5e6f215a51f05d2dab",
        "royaltyPercentage": null,
        "royaltyReceiver": null,
        "tokenId": "245330455638",
        "transferCommitment": null,
      },
      Object {
        "artist": null,
        "artistAddress": "0x864d38b2989553080dbe893f7366b2dc675cac1f",
        "collection": null,
        "history": Array [],
        "id": "436104791396",
        "issuer": Object {
          "englishName": "New English Name",
          "id": "0x2c1eda2d80e82a9b2b26b64da21e341636e8bab4",
        },
        "lockExternalTransfer": false,
        "metadataDigest": "bafkreibue6ax5qbviaq6rdcac3s3tjt7ihcgforfyf4wnl25tilcyoftsr",
        "originChain": "eip155:31337",
        "ownerAddress": "0xbb1010f86fcfd7223f5e95dcb7899af069493b80",
        "royaltyPercentage": 500,
        "royaltyReceiver": "0x864d38b2989553080dbe893f7366b2dc675cac1f",
        "tokenId": "436104791396",
        "transferCommitment": null,
      },
      Object {
        "artist": null,
        "artistAddress": "0x35902f4f4c94dcba48a71202b795e3ad2f75c56f",
        "collection": null,
        "history": Array [],
        "id": "482308692111",
        "issuer": Object {
          "englishName": "New English Name",
          "id": "0x2c1eda2d80e82a9b2b26b64da21e341636e8bab4",
        },
        "lockExternalTransfer": false,
        "metadataDigest": "0x0002ca461ee4aaada3921c9322155af8ec3f884e345701cfa169ef214f5e6660",
        "originChain": "eip155:31337",
        "ownerAddress": "0x2c1eda2d80e82a9b2b26b64da21e341636e8bab4",
        "royaltyPercentage": null,
        "royaltyReceiver": null,
        "tokenId": "482308692111",
        "transferCommitment": "0xc4f14afe6b607470ab21c7b60c09270a73c2ed19a520bee05ccc58f62df7b99e",
      },
      Object {
        "artist": null,
        "artistAddress": "0x35902f4f4c94dcba48a71202b795e3ad2f75c56f",
        "collection": null,
        "history": Array [],
        "id": "693334704620",
        "issuer": Object {
          "englishName": "New English Name",
          "id": "0x2c1eda2d80e82a9b2b26b64da21e341636e8bab4",
        },
        "lockExternalTransfer": false,
        "metadataDigest": "0x5dfdd11afc70980aa3f2bc222563acfba856d0a9e4225b62c7948ded7495ca1a",
        "originChain": "eip155:31337",
        "ownerAddress": "0xbb1010f86fcfd7223f5e95dcb7899af069493b80",
        "royaltyPercentage": null,
        "royaltyReceiver": null,
        "tokenId": "693334704620",
        "transferCommitment": null,
      },
      Object {
        "artist": null,
        "artistAddress": "0x35902f4f4c94dcba48a71202b795e3ad2f75c56f",
        "collection": null,
        "history": Array [
          Object {
            "customHistory": Object {
              "metadataDigest": "bafkreibue6ax5qbviaq6rdcac3s3tjt7ihcgforfyf4wnl25tilcyoftsq",
              "metadataHistory": Array [
                Object {
                  "metadataDigest": "0x001c7d6fdb9885b02689d0d76b34fe73e7706b3e9e841c16a8f8264077d197cd",
                },
                Object {
                  "metadataDigest": "0xcc3b6344b207c582bd727005be2a5de5bbca7b46b590d9e9189f3a9a7ea8283e",
                },
              ],
            },
          },
        ],
        "id": "761762342424",
        "issuer": Object {
          "englishName": "New English Name",
          "id": "0x2c1eda2d80e82a9b2b26b64da21e341636e8bab4",
        },
        "lockExternalTransfer": false,
        "metadataDigest": "0x5b985b5b195a77df122842687feb3fa0136799d0e7a6e7394adf504526727251",
        "originChain": "eip155:31337",
        "ownerAddress": "0xb31f2241cb4d48dcf7825a75b46b4f6b13829a20",
        "royaltyPercentage": null,
        "royaltyReceiver": null,
        "tokenId": "761762342424",
        "transferCommitment": null,
      },
      Object {
        "artist": null,
        "artistAddress": "0x35902f4f4c94dcba48a71202b795e3ad2f75c56f",
        "collection": null,
        "history": Array [],
        "id": "762614211005",
        "issuer": Object {
          "englishName": "New English Name",
          "id": "0x2c1eda2d80e82a9b2b26b64da21e341636e8bab4",
        },
        "lockExternalTransfer": true,
        "metadataDigest": "0x5b985b5b195a77df122842687feb3fa0136799d0e7a6e7394adf504526727252",
        "originChain": "eip155:31337",
        "ownerAddress": "0xfa08ed057457f857e9f1672cd979f5ef0628cd9a",
        "royaltyPercentage": null,
        "royaltyReceiver": null,
        "tokenId": "762614211005",
        "transferCommitment": null,
      },
      Object {
        "artist": null,
        "artistAddress": "0x35902f4f4c94dcba48a71202b795e3ad2f75c56f",
        "collection": null,
        "history": Array [],
        "id": "817842853989",
        "issuer": Object {
          "englishName": "New English Name",
          "id": "0x2c1eda2d80e82a9b2b26b64da21e341636e8bab4",
        },
        "lockExternalTransfer": false,
        "metadataDigest": "0x0c01cc79da2f4087d0c1cc9a01cff151b2656a3734d394e20f3e590da2cf2e8b",
        "originChain": "eip155:31337",
        "ownerAddress": "0xf1dbd215d72d99422693ca61f7bbecfcd0edb16f",
        "royaltyPercentage": null,
        "royaltyReceiver": null,
        "tokenId": "817842853989",
        "transferCommitment": null,
      },
      Object {
        "artist": null,
        "artistAddress": "0xeba6851db73174c0bb847c0172721836b3ba267c",
        "collection": Object {
          "id": "0xd5a7e49b3cbe731838fcffcee5ce947497061585",
        },
        "history": Array [],
        "id": "820869899430",
        "issuer": null,
        "lockExternalTransfer": false,
        "metadataDigest": "bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi",
        "originChain": null,
        "ownerAddress": null,
        "royaltyPercentage": null,
        "royaltyReceiver": null,
        "tokenId": "820869899430",
        "transferCommitment": null,
      },
      Object {
        "artist": null,
        "artistAddress": "0x864d38b2989553080dbe893f7366b2dc675cac1f",
        "collection": null,
        "history": Array [],
        "id": "899260479738",
        "issuer": Object {
          "englishName": "New English Name",
          "id": "0x2c1eda2d80e82a9b2b26b64da21e341636e8bab4",
        },
        "lockExternalTransfer": false,
        "metadataDigest": "bafkreibue6ax5qbviaq6rdcac3s3tjt7ihcgforfyf4wnl25tilcyoftsq",
        "originChain": "eip155:31337",
        "ownerAddress": "0xf1dbd215d72d99422693ca61f7bbecfcd0edb16f",
        "royaltyPercentage": null,
        "royaltyReceiver": null,
        "tokenId": "899260479738",
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
    Array [
      Object {
        "englishName": "Artist English",
        "issuedSRRs": Array [
          Object {
            "id": "245330455638",
            "metadataDigest": "0x4c8f18581c0167eb90a761b4a304e009b924f03b619a0c0e8ea3adfce20aee64",
            "tokenId": "245330455638",
            "transferCommitment": null,
          },
        ],
        "originChain": null,
        "originalName": "Artist Original",
        "owners": Array [
          "0x853f2251666f9d8c45cc760ae10ab0278533d28c",
          "0x171ea52e619b7fdde870b328ccfb70217a3e32ae",
          "0xad87f0b51a8788192edd0640ab5ed58e48145c82",
        ],
        "salt": "0x64e604787cbf194841e7b68d7cd28786f6c9a0a3ab9f8b0a0e87cb4387ab0001",
        "threshold": 1,
        "userType": "artist",
        "walletAddress": "0x84a11021459404dae94b2c5e6f215a51f05d2dab",
      },
      Object {
        "englishName": "New English Name",
        "issuedSRRs": Array [
          Object {
            "id": "129020582412",
            "metadataDigest": "0x001c7d6fdb9885b02689d0d76b34fe73e7706b3e9e841c16a8f8264077d197cd",
            "tokenId": "129020582412",
            "transferCommitment": null,
          },
          Object {
            "id": "436104791396",
            "metadataDigest": "bafkreibue6ax5qbviaq6rdcac3s3tjt7ihcgforfyf4wnl25tilcyoftsr",
            "tokenId": "436104791396",
            "transferCommitment": null,
          },
          Object {
            "id": "482308692111",
            "metadataDigest": "0x0002ca461ee4aaada3921c9322155af8ec3f884e345701cfa169ef214f5e6660",
            "tokenId": "482308692111",
            "transferCommitment": "0xc4f14afe6b607470ab21c7b60c09270a73c2ed19a520bee05ccc58f62df7b99e",
          },
          Object {
            "id": "693334704620",
            "metadataDigest": "0x5dfdd11afc70980aa3f2bc222563acfba856d0a9e4225b62c7948ded7495ca1a",
            "tokenId": "693334704620",
            "transferCommitment": null,
          },
          Object {
            "id": "761762342424",
            "metadataDigest": "0x5b985b5b195a77df122842687feb3fa0136799d0e7a6e7394adf504526727251",
            "tokenId": "761762342424",
            "transferCommitment": null,
          },
          Object {
            "id": "762614211005",
            "metadataDigest": "0x5b985b5b195a77df122842687feb3fa0136799d0e7a6e7394adf504526727252",
            "tokenId": "762614211005",
            "transferCommitment": null,
          },
          Object {
            "id": "817842853989",
            "metadataDigest": "0x0c01cc79da2f4087d0c1cc9a01cff151b2656a3734d394e20f3e590da2cf2e8b",
            "tokenId": "817842853989",
            "transferCommitment": null,
          },
          Object {
            "id": "899260479738",
            "metadataDigest": "bafkreibue6ax5qbviaq6rdcac3s3tjt7ihcgforfyf4wnl25tilcyoftsq",
            "tokenId": "899260479738",
            "transferCommitment": null,
          },
        ],
        "originChain": null,
        "originalName": "New Original Name",
        "owners": Array [
          "0x853f2251666f9d8c45cc760ae10ab0278533d28c",
          "0x171ea52e619b7fdde870b328ccfb70217a3e32ae",
          "0xad87f0b51a8788192edd0640ab5ed58e48145c82",
        ],
        "salt": "0x64e604787cbf194841e7b68d7cd28786f6c9a0a3ab9f8b0a0e87cb4387ab0002",
        "threshold": 1,
        "userType": "handler",
        "walletAddress": "0x2c1eda2d80e82a9b2b26b64da21e341636e8bab4",
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
  expect(result.customHistoryTypes).toStrictEqual(data)
})

// ignoring id, createdAt and updatedAt fields since it's timestamp, originTxHash
test('srrmetadataHistories', async () => {
  const query = `
  {
    srrmetadataHistories(orderBy: metadataDigest, orderDirection: desc) {
      srr {
        metadataDigest
        transferCommitment
        metadataHistory {
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
    Array [
      Object {
        "metadataDigest": "bafkreibue6ax5qbviaq6rdcac3s3tjt7ihcgforfyf4wnl25tilcyoftsr",
        "srr": Object {
          "metadataDigest": "bafkreibue6ax5qbviaq6rdcac3s3tjt7ihcgforfyf4wnl25tilcyoftsr",
          "metadataHistory": Array [
            Object {
              "metadataDigest": "bafkreibue6ax5qbviaq6rdcac3s3tjt7ihcgforfyf4wnl25tilcyoftsr",
              "srr": Object {
                "metadataDigest": "bafkreibue6ax5qbviaq6rdcac3s3tjt7ihcgforfyf4wnl25tilcyoftsr",
              },
            },
          ],
          "originChain": "eip155:31337",
          "transferCommitment": null,
        },
      },
      Object {
        "metadataDigest": "bafkreibue6ax5qbviaq6rdcac3s3tjt7ihcgforfyf4wnl25tilcyoftsq",
        "srr": Object {
          "metadataDigest": "bafkreibue6ax5qbviaq6rdcac3s3tjt7ihcgforfyf4wnl25tilcyoftsq",
          "metadataHistory": Array [
            Object {
              "metadataDigest": "bafkreibue6ax5qbviaq6rdcac3s3tjt7ihcgforfyf4wnl25tilcyoftsq",
              "srr": Object {
                "metadataDigest": "bafkreibue6ax5qbviaq6rdcac3s3tjt7ihcgforfyf4wnl25tilcyoftsq",
              },
            },
          ],
          "originChain": "eip155:31337",
          "transferCommitment": null,
        },
      },
      Object {
        "metadataDigest": "0x5dfdd11afc70980aa3f2bc222563acfba856d0a9e4225b62c7948ded7495ca1a",
        "srr": Object {
          "metadataDigest": "0x5dfdd11afc70980aa3f2bc222563acfba856d0a9e4225b62c7948ded7495ca1a",
          "metadataHistory": Array [
            Object {
              "metadataDigest": "0x5dfdd11afc70980aa3f2bc222563acfba856d0a9e4225b62c7948ded7495ca1a",
              "srr": Object {
                "metadataDigest": "0x5dfdd11afc70980aa3f2bc222563acfba856d0a9e4225b62c7948ded7495ca1a",
              },
            },
          ],
          "originChain": "eip155:31337",
          "transferCommitment": null,
        },
      },
      Object {
        "metadataDigest": "0x5b985b5b195a77df122842687feb3fa0136799d0e7a6e7394adf504526727252",
        "srr": Object {
          "metadataDigest": "0x5b985b5b195a77df122842687feb3fa0136799d0e7a6e7394adf504526727252",
          "metadataHistory": Array [
            Object {
              "metadataDigest": "0x5b985b5b195a77df122842687feb3fa0136799d0e7a6e7394adf504526727252",
              "srr": Object {
                "metadataDigest": "0x5b985b5b195a77df122842687feb3fa0136799d0e7a6e7394adf504526727252",
              },
            },
          ],
          "originChain": "eip155:31337",
          "transferCommitment": null,
        },
      },
      Object {
        "metadataDigest": "0x5b985b5b195a77df122842687feb3fa0136799d0e7a6e7394adf504526727251",
        "srr": Object {
          "metadataDigest": "0x5b985b5b195a77df122842687feb3fa0136799d0e7a6e7394adf504526727251",
          "metadataHistory": Array [
            Object {
              "metadataDigest": "0x5b985b5b195a77df122842687feb3fa0136799d0e7a6e7394adf504526727251",
              "srr": Object {
                "metadataDigest": "0x5b985b5b195a77df122842687feb3fa0136799d0e7a6e7394adf504526727251",
              },
            },
          ],
          "originChain": "eip155:31337",
          "transferCommitment": null,
        },
      },
      Object {
        "metadataDigest": "0x4c8f18581c0167eb90a761b4a304e009b924f03b619a0c0e8ea3adfce20aee64",
        "srr": Object {
          "metadataDigest": "0x4c8f18581c0167eb90a761b4a304e009b924f03b619a0c0e8ea3adfce20aee64",
          "metadataHistory": Array [
            Object {
              "metadataDigest": "0x4c8f18581c0167eb90a761b4a304e009b924f03b619a0c0e8ea3adfce20aee64",
              "srr": Object {
                "metadataDigest": "0x4c8f18581c0167eb90a761b4a304e009b924f03b619a0c0e8ea3adfce20aee64",
              },
            },
          ],
          "originChain": "eip155:31337",
          "transferCommitment": null,
        },
      },
      Object {
        "metadataDigest": "0x0c01cc79da2f4087d0c1cc9a01cff151b2656a3734d394e20f3e590da2cf2e8b",
        "srr": Object {
          "metadataDigest": "0x0c01cc79da2f4087d0c1cc9a01cff151b2656a3734d394e20f3e590da2cf2e8b",
          "metadataHistory": Array [
            Object {
              "metadataDigest": "0x0c01cc79da2f4087d0c1cc9a01cff151b2656a3734d394e20f3e590da2cf2e8b",
              "srr": Object {
                "metadataDigest": "0x0c01cc79da2f4087d0c1cc9a01cff151b2656a3734d394e20f3e590da2cf2e8b",
              },
            },
          ],
          "originChain": "eip155:31337",
          "transferCommitment": null,
        },
      },
      Object {
        "metadataDigest": "0x001c7d6fdb9885b02689d0d76b34fe73e7706b3e9e841c16a8f8264077d197cd",
        "srr": Object {
          "metadataDigest": "0x001c7d6fdb9885b02689d0d76b34fe73e7706b3e9e841c16a8f8264077d197cd",
          "metadataHistory": Array [
            Object {
              "metadataDigest": "0x001c7d6fdb9885b02689d0d76b34fe73e7706b3e9e841c16a8f8264077d197cd",
              "srr": Object {
                "metadataDigest": "0x001c7d6fdb9885b02689d0d76b34fe73e7706b3e9e841c16a8f8264077d197cd",
              },
            },
          ],
          "originChain": "eip155:31337",
          "transferCommitment": null,
        },
      },
      Object {
        "metadataDigest": "0x0002ca461ee4aaada3921c9322155af8ec3f884e345701cfa169ef214f5e6660",
        "srr": Object {
          "metadataDigest": "0x0002ca461ee4aaada3921c9322155af8ec3f884e345701cfa169ef214f5e6660",
          "metadataHistory": Array [
            Object {
              "metadataDigest": "0x0002ca461ee4aaada3921c9322155af8ec3f884e345701cfa169ef214f5e6660",
              "srr": Object {
                "metadataDigest": "0x0002ca461ee4aaada3921c9322155af8ec3f884e345701cfa169ef214f5e6660",
              },
            },
          ],
          "originChain": "eip155:31337",
          "transferCommitment": "0xc4f14afe6b607470ab21c7b60c09270a73c2ed19a520bee05ccc58f62df7b99e",
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
    Array [
      Object {
        "id": "0xa2c5a6fe8768fd09231270ba9fee50bd8355a89a393cedf6d8171fe3a7fa075c",
        "typeHash": "0xa2c5a6fe8768fd09231270ba9fee50bd8355a89a393cedf6d8171fe3a7fa075c",
        "typeString": "BulkIssueSendBatch(address from,uint256 nonce,bytes32 merkleRoot)",
      },
      Object {
        "id": "0x0172d8aef956076d95cd17382b234ebf2df603970f8b6389e750dc1473b7bf3a",
        "typeHash": "0x0172d8aef956076d95cd17382b234ebf2df603970f8b6389e750dc1473b7bf3a",
        "typeString": "BulkSendBatch(address from,uint256 nonce,bytes32 merkleRoot)",
      },
      Object {
        "id": "0x052d8d1acdbf73c1b466436c3bc062709a28af704363f8b326314d7ab01ce47b",
        "typeHash": "0x052d8d1acdbf73c1b466436c3bc062709a28af704363f8b326314d7ab01ce47b",
        "typeString": "BulkTransferSendBatch(address from,uint256 nonce,bytes32 merkleRoot)",
      },
      Object {
        "id": "0x9b8c9386754e3eaa398edc58c12b52366171172ff1593f9b3c204f735db04333",
        "typeHash": "0x9b8c9386754e3eaa398edc58c12b52366171172ff1593f9b3c204f735db04333",
        "typeString": "CollectionAddHistory(address from,uint256 nonce,bytes data,address destination,uint256[] tokenIds,uint256[] customHistoryIds)",
      },
      Object {
        "id": "0x05bf23bc05f237b03ae14a55ea54ee5b256e5519e6e11dde7cd325463a872d24",
        "typeHash": "0x05bf23bc05f237b03ae14a55ea54ee5b256e5519e6e11dde7cd325463a872d24",
        "typeString": "CollectionApproveSRRByCommitment(address from,uint256 nonce,bytes data,address destination,uint256 tokenId,bytes32 commitment,string historyMetadataDigest)",
      },
      Object {
        "id": "0x706c1f7bd199d621f4b28f17019128660044cd3f15bb02749fee5af4d07ce971",
        "typeHash": "0x706c1f7bd199d621f4b28f17019128660044cd3f15bb02749fee5af4d07ce971",
        "typeString": "CollectionApproveSRRByCommitmentV2(address from,uint256 nonce,bytes data,address destination,uint256 tokenId,bytes32 commitment,string historyMetadataHash)",
      },
      Object {
        "id": "0xd7c0a389ad471c51354f4762563f5c631f841a6a66bea230a9219144b8e54175",
        "typeHash": "0xd7c0a389ad471c51354f4762563f5c631f841a6a66bea230a9219144b8e54175",
        "typeString": "CollectionApproveSRRByCommitmentWithCustomHistoryId(address from,uint256 nonce,bytes data,address destination,uint256 tokenId,bytes32 commitment,string historyMetadataDigest,uint256 customHistoryId)",
      },
      Object {
        "id": "0xed2b2e4d2ccf36c92564638fa6e4b4a8269a22572966daf5ae6d51a64483853d",
        "typeHash": "0xed2b2e4d2ccf36c92564638fa6e4b4a8269a22572966daf5ae6d51a64483853d",
        "typeString": "CollectionApproveSRRByCommitmentWithCustomHistoryIdV2(address from,uint256 nonce,bytes data,address destination,uint256 tokenId,bytes32 commitment,string historyMetadataHash,uint256 customHistoryId)",
      },
      Object {
        "id": "0xcf263978afe08bf96b3970c98d52b9e859b13c48c9af9e81b96067d0f3ee52a4",
        "typeHash": "0xcf263978afe08bf96b3970c98d52b9e859b13c48c9af9e81b96067d0f3ee52a4",
        "typeString": "CollectionCancelSRRCommitment(address from,uint256 nonce,address destination,uint256 tokenId)",
      },
      Object {
        "id": "0xff500d0a3ba303173e03b4dfc421d2559386ff0330e6472897716ef5a6a6d215",
        "typeHash": "0xff500d0a3ba303173e03b4dfc421d2559386ff0330e6472897716ef5a6a6d215",
        "typeString": "CollectionCreateSRR(address from,uint256 nonce,bytes data,address destination,bool isPrimaryIssuer,address artistAddress,string metadataCID,bool lockExternalTransfer,address to,address royaltyReceiver,uint16 royaltyPercentage)",
      },
      Object {
        "id": "0xf9c3cc6a7e81c67d00591e481b030b955925f92cf3eb611b2bc1ef2927627028",
        "typeHash": "0xf9c3cc6a7e81c67d00591e481b030b955925f92cf3eb611b2bc1ef2927627028",
        "typeString": "CollectionFactoryCreateCollection(address from,uint256 nonce,bytes data,string name,string symbol,string metadataCID,bytes32 salt)",
      },
      Object {
        "id": "0x8648ca5094960f0e19bdff764e6b9b70484c54375d7afc9efe496d8bc93335a1",
        "typeHash": "0x8648ca5094960f0e19bdff764e6b9b70484c54375d7afc9efe496d8bc93335a1",
        "typeString": "CollectionSetLockExternalTransfer(address from,uint256 nonce,address destination,uint256 tokenId,bool flag)",
      },
      Object {
        "id": "0x5e4cd81c273015962a434caa2aa9ec18c8af726d2215e4f1d8d73271ef7d4e1d",
        "typeHash": "0x5e4cd81c273015962a434caa2aa9ec18c8af726d2215e4f1d8d73271ef7d4e1d",
        "typeString": "CollectionTransferFromWithProvenance(address from,uint256 nonce,bytes data,address destination,address to,uint256 tokenId,string historyMetadataDigest,uint256 customHistoryId,bool isIntermediary)",
      },
      Object {
        "id": "0x6e4a36acbcd7a4b37f49d842a89b415ccfd7e76dd90e9901c5f4ecbfc2c87b3a",
        "typeHash": "0x6e4a36acbcd7a4b37f49d842a89b415ccfd7e76dd90e9901c5f4ecbfc2c87b3a",
        "typeString": "CollectionTransferFromWithProvenanceV2(address from,uint256 nonce,bytes data,address destination,address to,uint256 tokenId,string historyMetadataHash,uint256 customHistoryId,bool isIntermediary)",
      },
      Object {
        "id": "0x8cc39e4b9764b571078c76c303a1da6e54128ddaffe37718ae8bfeb44ea65606",
        "typeHash": "0x8cc39e4b9764b571078c76c303a1da6e54128ddaffe37718ae8bfeb44ea65606",
        "typeString": "CollectionUpdateSRR(address from,uint256 nonce,address destination,uint256 tokenId,bool isPrimaryIssuer,address artistAddress)",
      },
      Object {
        "id": "0x547944ec29bf28f7926de9b4a4c0c11cd6512cd83d10c7c6dc048258c11c143e",
        "typeHash": "0x547944ec29bf28f7926de9b4a4c0c11cd6512cd83d10c7c6dc048258c11c143e",
        "typeString": "CollectionUpdateSRRMetadata(address from,uint256 nonce,address destination,uint256 tokenId,bytes32 metadataDigest)",
      },
      Object {
        "id": "0x07d16a7371085e8f0f61d0d29741714c9f0e244c83d522adb54a15fd2f39e2ca",
        "typeHash": "0x07d16a7371085e8f0f61d0d29741714c9f0e244c83d522adb54a15fd2f39e2ca",
        "typeString": "CollectionUpdateSRRMetadataWithCid(address from,uint256 nonce,bytes data,address destination,uint256 tokenId,string metadataCID)",
      },
      Object {
        "id": "0x796de3fb74c239fa827ee07f17274a255550cc0b2441d53b527d792f2c50a4ff",
        "typeHash": "0x796de3fb74c239fa827ee07f17274a255550cc0b2441d53b527d792f2c50a4ff",
        "typeString": "CollectionUpdateSRRRoyalty(address from,uint256 nonce,address destination,uint256 tokenId,address royaltyReceiver,uint16 royaltyPercentage)",
      },
      Object {
        "id": "0x1f6bcc34496ca1b52d584f9a76e6a39b27989a9c186f8bcac08b53d1b03bb293",
        "typeHash": "0x1f6bcc34496ca1b52d584f9a76e6a39b27989a9c186f8bcac08b53d1b03bb293",
        "typeString": "StartrailRegistryAddHistory(address from,uint256 nonce,bytes data,uint256[] tokenIds,uint256[] customHistoryIds)",
      },
      Object {
        "id": "0xb4d22bf06a762d0a27f1c25c8a258e0982dbc92abe4d6d72fdbec60d49464daa",
        "typeHash": "0xb4d22bf06a762d0a27f1c25c8a258e0982dbc92abe4d6d72fdbec60d49464daa",
        "typeString": "StartrailRegistryApproveSRRByCommitment(address from,uint256 nonce,bytes data,uint256 tokenId,bytes32 commitment,string historyMetadataDigest)",
      },
      Object {
        "id": "0xa49c118caf6532f50dd29e1b916e320e939519f3a57200537ca2afe255fb5f9d",
        "typeHash": "0xa49c118caf6532f50dd29e1b916e320e939519f3a57200537ca2afe255fb5f9d",
        "typeString": "StartrailRegistryApproveSRRByCommitmentV2(address from,uint256 nonce,bytes data,uint256 tokenId,bytes32 commitment,string historyMetadataHash)",
      },
      Object {
        "id": "0xebdf6224c1bb9fe61ea31b37d9b143c5b2c3b390aa1970cd68f6e4cdcb087e06",
        "typeHash": "0xebdf6224c1bb9fe61ea31b37d9b143c5b2c3b390aa1970cd68f6e4cdcb087e06",
        "typeString": "StartrailRegistryApproveSRRByCommitmentWithCustomHistoryId(address from,uint256 nonce,bytes data,uint256 tokenId,bytes32 commitment,string historyMetadataDigest,uint256 customHistoryId)",
      },
      Object {
        "id": "0xc622d317caa3d983ec9a71e409381681f2b6e5b401a3a3f76a9a279e7e4f99d2",
        "typeHash": "0xc622d317caa3d983ec9a71e409381681f2b6e5b401a3a3f76a9a279e7e4f99d2",
        "typeString": "StartrailRegistryApproveSRRByCommitmentWithCustomHistoryIdV2(address from,uint256 nonce,bytes data,uint256 tokenId,bytes32 commitment,string historyMetadataHash,uint256 customHistoryId)",
      },
      Object {
        "id": "0xfc61e554d8da03571436be8820948b7c044eb5abfddb2394091c1fdebc71b5fd",
        "typeHash": "0xfc61e554d8da03571436be8820948b7c044eb5abfddb2394091c1fdebc71b5fd",
        "typeString": "StartrailRegistryCancelSRRCommitment(address from,uint256 nonce,uint256 tokenId)",
      },
      Object {
        "id": "0xdaf029518ea1e0c4b5517bda19381f793f3b9ca93174a70d7c688b717f8f9890",
        "typeHash": "0xdaf029518ea1e0c4b5517bda19381f793f3b9ca93174a70d7c688b717f8f9890",
        "typeString": "StartrailRegistryCreateSRRFromLicensedUser(address from,uint256 nonce,bool isPrimaryIssuer,address artistAddress,bytes32 metadataDigest,bool lockExternalTransfer,address to)",
      },
      Object {
        "id": "0x80338e3adfe718efb7b49d26e987f9a1319d89701afc8cd1b35d6c4343db633d",
        "typeHash": "0x80338e3adfe718efb7b49d26e987f9a1319d89701afc8cd1b35d6c4343db633d",
        "typeString": "StartrailRegistryCreateSRRFromLicensedUserWithCid(address from,uint256 nonce,bytes data,bool isPrimaryIssuer,address artistAddress,bytes32 metadataDigest,string metadataCID,bool lockExternalTransfer,address to)",
      },
      Object {
        "id": "0x89ddd5e5b12935384bffffa1d2fcaa0767f6aaf42823f725c16e2c3dc36d04e1",
        "typeHash": "0x89ddd5e5b12935384bffffa1d2fcaa0767f6aaf42823f725c16e2c3dc36d04e1",
        "typeString": "StartrailRegistryCreateSRRFromLicensedUserWithRoyalty(address from,uint256 nonce,bytes data,bool isPrimaryIssuer,address artistAddress,bytes32 metadataDigest,string metadataCID,bool lockExternalTransfer,address to,address royaltyReceiver,uint16 royaltyPercentage)",
      },
      Object {
        "id": "0x98ce74b76cbcc5f7fc9d14949a70627b5dc8b6d1ff04fc70f34c4839ccdabf11",
        "typeHash": "0x98ce74b76cbcc5f7fc9d14949a70627b5dc8b6d1ff04fc70f34c4839ccdabf11",
        "typeString": "StartrailRegistryCreateSRRWithLockExternalTransfer(address from,uint256 nonce,bool isPrimaryIssuer,address artistAddress,bytes32 metadataDigest,bool lockExternalTransfer)",
      },
      Object {
        "id": "0x43b411a61269fac54b60a3a5c04241addcc8c4e9e4844916999593fd135aa9f6",
        "typeHash": "0x43b411a61269fac54b60a3a5c04241addcc8c4e9e4844916999593fd135aa9f6",
        "typeString": "StartrailRegistrySetLockExternalTransfer(address from,uint256 nonce,uint256 tokenId,bool flag)",
      },
      Object {
        "id": "0xbb7ee9c4ba6fdc75187418d24acba89107ee1d0afb3596dcdb11e70703c25803",
        "typeHash": "0xbb7ee9c4ba6fdc75187418d24acba89107ee1d0afb3596dcdb11e70703c25803",
        "typeString": "StartrailRegistryTransferFromWithProvenance(address from,uint256 nonce,bytes data,address to,uint256 tokenId,string historyMetadataDigest,uint256 customHistoryId,bool isIntermediary)",
      },
      Object {
        "id": "0xdff54f0f79270c4bae7b490205026c9cf16c59d74e264f31da9b2b8e6bacad18",
        "typeHash": "0xdff54f0f79270c4bae7b490205026c9cf16c59d74e264f31da9b2b8e6bacad18",
        "typeString": "StartrailRegistryTransferFromWithProvenanceV2(address from,uint256 nonce,bytes data,address to,uint256 tokenId,string historyMetadataHash,uint256 customHistoryId,bool isIntermediary)",
      },
      Object {
        "id": "0xf6f490ad3237fb8a6611e8cb20e7dc248e4df8fb091d3ebebfb536dc98e54397",
        "typeHash": "0xf6f490ad3237fb8a6611e8cb20e7dc248e4df8fb091d3ebebfb536dc98e54397",
        "typeString": "StartrailRegistryUpdateSRR(address from,uint256 nonce,uint256 tokenId,bool isPrimaryIssuer,address artistAddress)",
      },
      Object {
        "id": "0xd111846f191cf3c32ce6aedccf704a641a50381f22729d5a6cd5f13a0554ef80",
        "typeHash": "0xd111846f191cf3c32ce6aedccf704a641a50381f22729d5a6cd5f13a0554ef80",
        "typeString": "StartrailRegistryUpdateSRRMetadata(address from,uint256 nonce,uint256 tokenId,bytes32 metadataDigest)",
      },
      Object {
        "id": "0x2569bec027dd03c3cf0369ae42a7b5bf330297ea9c33d1932890e79d28487111",
        "typeHash": "0x2569bec027dd03c3cf0369ae42a7b5bf330297ea9c33d1932890e79d28487111",
        "typeString": "StartrailRegistryUpdateSRRMetadataWithCid(address from,uint256 nonce,bytes data,uint256 tokenId,string metadataCID)",
      },
      Object {
        "id": "0x5be9b1e84327c6055e25bdec5e1eebee8ed9298b86b19994e011ccb8d95f0535",
        "typeHash": "0x5be9b1e84327c6055e25bdec5e1eebee8ed9298b86b19994e011ccb8d95f0535",
        "typeString": "StartrailRegistryUpdateSRRRoyalty(address from,uint256 nonce,uint256 tokenId,address royaltyReceiver,uint16 royaltyPercentage)",
      },
      Object {
        "id": "0xe40b02b26d5443f4479036538f991a995624f5cc199ecab72a0dde126115a16c",
        "typeHash": "0xe40b02b26d5443f4479036538f991a995624f5cc199ecab72a0dde126115a16c",
        "typeString": "WalletAddOwner(address from,uint256 nonce,address wallet,address owner,uint256 threshold)",
      },
      Object {
        "id": "0xff1b6ae7ba3b6fcaf8441b4b7ebbebb22444db035e8eb25feb17296a6c00b54b",
        "typeHash": "0xff1b6ae7ba3b6fcaf8441b4b7ebbebb22444db035e8eb25feb17296a6c00b54b",
        "typeString": "WalletChangeThreshold(address from,uint256 nonce,address wallet,uint256 threshold)",
      },
      Object {
        "id": "0x9eb400930ea9ba11485a1fbe22ec6b4f1f4b74ec9c1f867ed95185ef2f67092c",
        "typeHash": "0x9eb400930ea9ba11485a1fbe22ec6b4f1f4b74ec9c1f867ed95185ef2f67092c",
        "typeString": "WalletRemoveOwner(address from,uint256 nonce,address wallet,address prevOwner,address owner,uint256 threshold)",
      },
      Object {
        "id": "0x72aa5b313beffb167251bd88ac4c617700ece940a29fc55df7dea54d0e47f5c6",
        "typeHash": "0x72aa5b313beffb167251bd88ac4c617700ece940a29fc55df7dea54d0e47f5c6",
        "typeString": "WalletSetEnglishName(address from,uint256 nonce,bytes data,address wallet,string name)",
      },
      Object {
        "id": "0x425002ddfe8a5210fcf678ff38ca336c9b3babbf2f10efa5fdeaace5951e2b48",
        "typeHash": "0x425002ddfe8a5210fcf678ff38ca336c9b3babbf2f10efa5fdeaace5951e2b48",
        "typeString": "WalletSetOriginalName(address from,uint256 nonce,bytes data,address wallet,string name)",
      },
      Object {
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
    Array [
      Object {
        "customHistory": null,
        "from": "0x2c1eda2d80e82a9b2b26b64da21e341636e8bab4",
        "isIntermediary": false,
        "metadataDigest": "0xba136728b9ccfc56aa07d354fb7b5b026fa8123ad74f2fdb7a938bdf08c77a70",
        "metadataURI": "https://api.startrail.io/api/v1/metadata/0xba136728b9ccfc56aa07d354fb7b5b026fa8123ad74f2fdb7a938bdf08c77a70.json",
        "srr": Object {
          "id": "761762342424",
        },
        "to": "0xf1dbd215d72d99422693ca61f7bbecfcd0edb16f",
      },
      Object {
        "customHistory": null,
        "from": "0x2c1eda2d80e82a9b2b26b64da21e341636e8bab4",
        "isIntermediary": true,
        "metadataDigest": "0xba136728b9ccfc56aa07d354fb7b5b026fa8123ad74f2fdb7a938bdf08c77a70",
        "metadataURI": "https://api.startrail.io/api/v1/metadata/0xba136728b9ccfc56aa07d354fb7b5b026fa8123ad74f2fdb7a938bdf08c77a70.json",
        "srr": Object {
          "id": "762614211005",
        },
        "to": "0xf1dbd215d72d99422693ca61f7bbecfcd0edb16f",
      },
      Object {
        "customHistory": null,
        "from": "0xf1dbd215d72d99422693ca61f7bbecfcd0edb16f",
        "isIntermediary": false,
        "metadataDigest": "0xba136728b9ccfc56aa07d354fb7b5b026fa8123ad74f2fdb7a938bdf08c77a70",
        "metadataURI": "https://api.startrail.io/api/v1/metadata/0xba136728b9ccfc56aa07d354fb7b5b026fa8123ad74f2fdb7a938bdf08c77a70.json",
        "srr": Object {
          "id": "761762342424",
        },
        "to": "0xb31f2241cb4d48dcf7825a75b46b4f6b13829a20",
      },
      Object {
        "customHistory": null,
        "from": "0xf1dbd215d72d99422693ca61f7bbecfcd0edb16f",
        "isIntermediary": false,
        "metadataDigest": "",
        "metadataURI": "",
        "srr": Object {
          "id": "762614211005",
        },
        "to": "0xb31f2241cb4d48dcf7825a75b46b4f6b13829a20",
      },
      Object {
        "customHistory": null,
        "from": "0xb31f2241cb4d48dcf7825a75b46b4f6b13829a20",
        "isIntermediary": false,
        "metadataDigest": "",
        "metadataURI": "",
        "srr": Object {
          "id": "762614211005",
        },
        "to": "0xfa08ed057457f857e9f1672cd979f5ef0628cd9a",
      },
      Object {
        "customHistory": Object {
          "id": "1",
        },
        "from": "0x2c1eda2d80e82a9b2b26b64da21e341636e8bab4",
        "isIntermediary": false,
        "metadataDigest": "0xba136728b9ccfc56aa07d354fb7b5b026fa8123ad74f2fdb7a938bdf08c77a70",
        "metadataURI": "https://api.startrail.io/api/v1/metadata/0xba136728b9ccfc56aa07d354fb7b5b026fa8123ad74f2fdb7a938bdf08c77a70.json",
        "srr": Object {
          "id": "817842853989",
        },
        "to": "0xf1dbd215d72d99422693ca61f7bbecfcd0edb16f",
      },
      Object {
        "customHistory": Object {
          "id": "1",
        },
        "from": "0x2c1eda2d80e82a9b2b26b64da21e341636e8bab4",
        "isIntermediary": false,
        "metadataDigest": "0x565aa707ce293c9e815871d6d0913f449283bf55f72c28a4222ef62698d246e1",
        "metadataURI": "https://api.startrail.io/api/v1/metadata/0x565aa707ce293c9e815871d6d0913f449283bf55f72c28a4222ef62698d246e1.json",
        "srr": Object {
          "id": "129020582412",
        },
        "to": "0xdfb64492cdd303e86788af19123cf9f1bc65b084",
      },
      Object {
        "customHistory": null,
        "from": "0x2c1eda2d80e82a9b2b26b64da21e341636e8bab4",
        "isIntermediary": false,
        "metadataDigest": "",
        "metadataURI": "",
        "srr": Object {
          "id": "693334704620",
        },
        "to": "0xbb1010f86fcfd7223f5e95dcb7899af069493b80",
      },
      Object {
        "customHistory": Object {
          "id": "1",
        },
        "from": "0x2c1eda2d80e82a9b2b26b64da21e341636e8bab4",
        "isIntermediary": false,
        "metadataDigest": "bafkreibue6ax5qbviaq6rdcac3s3tjt7ihcgforfyf4wnl25tilcyoftsq",
        "metadataURI": "ipfs://bafkreibue6ax5qbviaq6rdcac3s3tjt7ihcgforfyf4wnl25tilcyoftsq",
        "srr": Object {
          "id": "899260479738",
        },
        "to": "0xf1dbd215d72d99422693ca61f7bbecfcd0edb16f",
      },
      Object {
        "customHistory": null,
        "from": "0x2c1eda2d80e82a9b2b26b64da21e341636e8bab4",
        "isIntermediary": false,
        "metadataDigest": "",
        "metadataURI": "",
        "srr": Object {
          "id": "436104791396",
        },
        "to": "0xbb1010f86fcfd7223f5e95dcb7899af069493b80",
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

  const data = [
    {
      commitment:
        '0xc4f14afe6b607470ab21c7b60c09270a73c2ed19a520bee05ccc58f62df7b99e',
      id: '482308692111',
      lastAction: 'approve',
    },
    {
      commitment: null,
      id: '761762342424',
      lastAction: 'transfer',
    },
    {
      commitment: null,
      id: '762614211005',
      lastAction: 'transfer',
    },
  ]

  expect(result.srrtransferCommits).toStrictEqual(data)
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

  expect(result.bulkIssues).toStrictEqual(data)
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
          id
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
            id: '761762342424',
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

  expect(result.customHistories).toStrictEqual(data)
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

  expect(result.customHistoryMetadataHistories).toStrictEqual(data)
})

// ignoring createdAt field since it's timestamp
test('srrHistories', async () => {
  const query = `
  {
    srrhistories {
      srr {
        id
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
        id: '761762342424',
      },
    },
  ]

  expect(result.srrhistories).toStrictEqual(data)
})
