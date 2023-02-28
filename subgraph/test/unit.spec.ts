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
      tokenId
      ownerAddress
      artistAddress
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
          metadataHistory {
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
    "artistAddress": "0x864d38b2989553080dbe893f7366b2dc675cac1f",
    "history": Array [],
    "id": "151267251424",
    "issuer": Object {
      "englishName": "New English Name",
      "id": "0x7bf6d2f6f832ad774fb7eec02a73ecea47ee90eb",
    },
    "lockExternalTransfer": true,
    "metadataDigest": "0x5b985b5b195a77df122842687feb3fa0136799d0e7a6e7394adf504526727252",
    "originChain": "eip155:31337",
    "ownerAddress": "0xfa08ed057457f857e9f1672cd979f5ef0628cd9a",
    "tokenId": "151267251424",
    "transferCommitment": null,
  },
  Object {
    "artist": null,
    "artistAddress": "0x864d38b2989553080dbe893f7366b2dc675cac1f",
    "history": Array [],
    "id": "245695180461",
    "issuer": Object {
      "englishName": "New English Name",
      "id": "0x7bf6d2f6f832ad774fb7eec02a73ecea47ee90eb",
    },
    "lockExternalTransfer": false,
    "metadataDigest": "0x5dfdd11afc70980aa3f2bc222563acfba856d0a9e4225b62c7948ded7495ca1a",
    "originChain": "eip155:31337",
    "ownerAddress": "0xbb1010f86fcfd7223f5e95dcb7899af069493b80",
    "tokenId": "245695180461",
    "transferCommitment": null,
  },
  Object {
    "artist": null,
    "artistAddress": "0x864d38b2989553080dbe893f7366b2dc675cac1f",
    "history": Array [],
    "id": "333561554987",
    "issuer": Object {
      "englishName": "New English Name",
      "id": "0x7bf6d2f6f832ad774fb7eec02a73ecea47ee90eb",
    },
    "lockExternalTransfer": false,
    "metadataDigest": "0x001c7d6fdb9885b02689d0d76b34fe73e7706b3e9e841c16a8f8264077d197cd",
    "originChain": "eip155:31337",
    "ownerAddress": "0x88f7c48e2a696276d13004c7bd32eae05e4f2be1",
    "tokenId": "333561554987",
    "transferCommitment": null,
  },
  Object {
    "artist": null,
    "artistAddress": "0x864d38b2989553080dbe893f7366b2dc675cac1f",
    "history": Array [],
    "id": "450616792060",
    "issuer": Object {
      "englishName": "New English Name",
      "id": "0x7bf6d2f6f832ad774fb7eec02a73ecea47ee90eb",
    },
    "lockExternalTransfer": false,
    "metadataDigest": "0x0c01cc79da2f4087d0c1cc9a01cff151b2656a3734d394e20f3e590da2cf2e8b",
    "originChain": "eip155:31337",
    "ownerAddress": "0xf1dbd215d72d99422693ca61f7bbecfcd0edb16f",
    "tokenId": "450616792060",
    "transferCommitment": null,
  },
  Object {
    "artist": null,
    "artistAddress": "0x864d38b2989553080dbe893f7366b2dc675cac1f",
    "history": Array [],
    "id": "566557470167",
    "issuer": Object {
      "englishName": "Artist English",
      "id": "0xf5e12cb6d5aeac2f6079b13417310db8b8800e6f",
    },
    "lockExternalTransfer": false,
    "metadataDigest": "0x4c8f18581c0167eb90a761b4a304e009b924f03b619a0c0e8ea3adfce20aee64",
    "originChain": "eip155:31337",
    "ownerAddress": "0xf5e12cb6d5aeac2f6079b13417310db8b8800e6f",
    "tokenId": "566557470167",
    "transferCommitment": null,
  },
  Object {
    "artist": null,
    "artistAddress": "0x864d38b2989553080dbe893f7366b2dc675cac1f",
    "history": Array [
      Object {
        "customHistory": Object {
          "metadataDigest": "0x001c7d6fdb9885b02689d0d76b34fe73e7706b3e9e841c16a8f8264077d197cd",
          "metadataHistory": Array [
            Object {
              "metadataDigest": "0xcc3b6344b207c582bd727005be2a5de5bbca7b46b590d9e9189f3a9a7ea8283e",
            },
          ],
        },
      },
    ],
    "id": "628560438356",
    "issuer": Object {
      "englishName": "New English Name",
      "id": "0x7bf6d2f6f832ad774fb7eec02a73ecea47ee90eb",
    },
    "lockExternalTransfer": false,
    "metadataDigest": "0x5b985b5b195a77df122842687feb3fa0136799d0e7a6e7394adf504526727251",
    "originChain": "eip155:31337",
    "ownerAddress": "0xb31f2241cb4d48dcf7825a75b46b4f6b13829a20",
    "tokenId": "628560438356",
    "transferCommitment": null,
  },
  Object {
    "artist": null,
    "artistAddress": "0x864d38b2989553080dbe893f7366b2dc675cac1f",
    "history": Array [],
    "id": "725195465807",
    "issuer": Object {
      "englishName": "New English Name",
      "id": "0x7bf6d2f6f832ad774fb7eec02a73ecea47ee90eb",
    },
    "lockExternalTransfer": false,
    "metadataDigest": "0x0002ca461ee4aaada3921c9322155af8ec3f884e345701cfa169ef214f5e6660",
    "originChain": "eip155:31337",
    "ownerAddress": "0x7bf6d2f6f832ad774fb7eec02a73ecea47ee90eb",
    "tokenId": "725195465807",
    "transferCommitment": "0x10ca3eff73ebec87d2394fc58560afeab86dac7a21f5e402ea0a55e5c8a6758f",
  },
  Object {
    "artist": null,
    "artistAddress": "0x212ffb315a6adb0b1f106aec74aade67a6f3799f",
    "history": Array [],
    "id": "986417474240",
    "issuer": Object {
      "englishName": "New English Name",
      "id": "0x7bf6d2f6f832ad774fb7eec02a73ecea47ee90eb",
    },
    "lockExternalTransfer": false,
    "metadataDigest": "0x0f34e2f4762d796ab3eb29a60a39104de18e3589a9af573fc38f56753a21022f",
    "originChain": "eip155:31337",
    "ownerAddress": "0x7bf6d2f6f832ad774fb7eec02a73ecea47ee90eb",
    "tokenId": "986417474240",
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
        "id": "566557470167",
        "metadataDigest": "0x4c8f18581c0167eb90a761b4a304e009b924f03b619a0c0e8ea3adfce20aee64",
        "tokenId": "566557470167",
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
    "walletAddress": "0xf5e12cb6d5aeac2f6079b13417310db8b8800e6f",
  },
  Object {
    "englishName": "New English Name",
    "issuedSRRs": Array [
      Object {
        "id": "151267251424",
        "metadataDigest": "0x5b985b5b195a77df122842687feb3fa0136799d0e7a6e7394adf504526727252",
        "tokenId": "151267251424",
        "transferCommitment": null,
      },
      Object {
        "id": "245695180461",
        "metadataDigest": "0x5dfdd11afc70980aa3f2bc222563acfba856d0a9e4225b62c7948ded7495ca1a",
        "tokenId": "245695180461",
        "transferCommitment": null,
      },
      Object {
        "id": "333561554987",
        "metadataDigest": "0x001c7d6fdb9885b02689d0d76b34fe73e7706b3e9e841c16a8f8264077d197cd",
        "tokenId": "333561554987",
        "transferCommitment": null,
      },
      Object {
        "id": "450616792060",
        "metadataDigest": "0x0c01cc79da2f4087d0c1cc9a01cff151b2656a3734d394e20f3e590da2cf2e8b",
        "tokenId": "450616792060",
        "transferCommitment": null,
      },
      Object {
        "id": "628560438356",
        "metadataDigest": "0x5b985b5b195a77df122842687feb3fa0136799d0e7a6e7394adf504526727251",
        "tokenId": "628560438356",
        "transferCommitment": null,
      },
      Object {
        "id": "725195465807",
        "metadataDigest": "0x0002ca461ee4aaada3921c9322155af8ec3f884e345701cfa169ef214f5e6660",
        "tokenId": "725195465807",
        "transferCommitment": "0x10ca3eff73ebec87d2394fc58560afeab86dac7a21f5e402ea0a55e5c8a6758f",
      },
      Object {
        "id": "986417474240",
        "metadataDigest": "0x0f34e2f4762d796ab3eb29a60a39104de18e3589a9af573fc38f56753a21022f",
        "tokenId": "986417474240",
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
    "walletAddress": "0x7bf6d2f6f832ad774fb7eec02a73ecea47ee90eb",
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
    "metadataDigest": "0x0f34e2f4762d796ab3eb29a60a39104de18e3589a9af573fc38f56753a21022f",
    "srr": Object {
      "metadataDigest": "0x0f34e2f4762d796ab3eb29a60a39104de18e3589a9af573fc38f56753a21022f",
      "metadataHistory": Array [
        Object {
          "metadataDigest": "0x0f34e2f4762d796ab3eb29a60a39104de18e3589a9af573fc38f56753a21022f",
          "srr": Object {
            "metadataDigest": "0x0f34e2f4762d796ab3eb29a60a39104de18e3589a9af573fc38f56753a21022f",
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
      "transferCommitment": "0x10ca3eff73ebec87d2394fc58560afeab86dac7a21f5e402ea0a55e5c8a6758f",
    },
  },
]
`)
})

// ignoring createdAt field since it's timestamp
test('metaTxRequestTypes', async () => {
  const query = `
  {
    metaTxRequestTypes(orderBy: createdAt, orderDirection: asc) {
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
    "id": "0x425002ddfe8a5210fcf678ff38ca336c9b3babbf2f10efa5fdeaace5951e2b48",
    "typeHash": "0x425002ddfe8a5210fcf678ff38ca336c9b3babbf2f10efa5fdeaace5951e2b48",
    "typeString": "WalletSetOriginalName(address from,uint256 nonce,bytes data,address wallet,string name)",
  },
  Object {
    "id": "0x72aa5b313beffb167251bd88ac4c617700ece940a29fc55df7dea54d0e47f5c6",
    "typeHash": "0x72aa5b313beffb167251bd88ac4c617700ece940a29fc55df7dea54d0e47f5c6",
    "typeString": "WalletSetEnglishName(address from,uint256 nonce,bytes data,address wallet,string name)",
  },
  Object {
    "id": "0x9eb400930ea9ba11485a1fbe22ec6b4f1f4b74ec9c1f867ed95185ef2f67092c",
    "typeHash": "0x9eb400930ea9ba11485a1fbe22ec6b4f1f4b74ec9c1f867ed95185ef2f67092c",
    "typeString": "WalletRemoveOwner(address from,uint256 nonce,address wallet,address prevOwner,address owner,uint256 threshold)",
  },
  Object {
    "id": "0xa2c5a6fe8768fd09231270ba9fee50bd8355a89a393cedf6d8171fe3a7fa075c",
    "typeHash": "0xa2c5a6fe8768fd09231270ba9fee50bd8355a89a393cedf6d8171fe3a7fa075c",
    "typeString": "BulkIssueSendBatch(address from,uint256 nonce,bytes32 merkleRoot)",
  },
  Object {
    "id": "0xa32f0c35f201b6260c799d8f4f0c66d8d05a3e60db8cdeb795ab26987366a155",
    "typeHash": "0xa32f0c35f201b6260c799d8f4f0c66d8d05a3e60db8cdeb795ab26987366a155",
    "typeString": "WalletSwapOwner(address from,uint256 nonce,address wallet,address prevOwner,address oldOwner,address newOwner)",
  },
  Object {
    "id": "0xa51d034042007707c0d3a28048543b905e0c5b8646875ced2aa5f128895ee1fb",
    "typeHash": "0xa51d034042007707c0d3a28048543b905e0c5b8646875ced2aa5f128895ee1fb",
    "typeString": "StartrailRegistryCreateSRR(address from,uint256 nonce,bool isPrimaryIssuer,address artistAddress,bytes32 metadataDigest)",
  },
  Object {
    "id": "0xb4d22bf06a762d0a27f1c25c8a258e0982dbc92abe4d6d72fdbec60d49464daa",
    "typeHash": "0xb4d22bf06a762d0a27f1c25c8a258e0982dbc92abe4d6d72fdbec60d49464daa",
    "typeString": "StartrailRegistryApproveSRRByCommitment(address from,uint256 nonce,bytes data,uint256 tokenId,bytes32 commitment,string historyMetadataDigest)",
  },
  Object {
    "id": "0xd111846f191cf3c32ce6aedccf704a641a50381f22729d5a6cd5f13a0554ef80",
    "typeHash": "0xd111846f191cf3c32ce6aedccf704a641a50381f22729d5a6cd5f13a0554ef80",
    "typeString": "StartrailRegistryUpdateSRRMetadata(address from,uint256 nonce,uint256 tokenId,bytes32 metadataDigest)",
  },
  Object {
    "id": "0xe40b02b26d5443f4479036538f991a995624f5cc199ecab72a0dde126115a16c",
    "typeHash": "0xe40b02b26d5443f4479036538f991a995624f5cc199ecab72a0dde126115a16c",
    "typeString": "WalletAddOwner(address from,uint256 nonce,address wallet,address owner,uint256 threshold)",
  },
  Object {
    "id": "0xebdf6224c1bb9fe61ea31b37d9b143c5b2c3b390aa1970cd68f6e4cdcb087e06",
    "typeHash": "0xebdf6224c1bb9fe61ea31b37d9b143c5b2c3b390aa1970cd68f6e4cdcb087e06",
    "typeString": "StartrailRegistryApproveSRRByCommitmentWithCustomHistoryId(address from,uint256 nonce,bytes data,uint256 tokenId,bytes32 commitment,string historyMetadataDigest,uint256 customHistoryId)",
  },
  Object {
    "id": "0xf6f490ad3237fb8a6611e8cb20e7dc248e4df8fb091d3ebebfb536dc98e54397",
    "typeHash": "0xf6f490ad3237fb8a6611e8cb20e7dc248e4df8fb091d3ebebfb536dc98e54397",
    "typeString": "StartrailRegistryUpdateSRR(address from,uint256 nonce,uint256 tokenId,bool isPrimaryIssuer,address artistAddress)",
  },
  Object {
    "id": "0xfc61e554d8da03571436be8820948b7c044eb5abfddb2394091c1fdebc71b5fd",
    "typeHash": "0xfc61e554d8da03571436be8820948b7c044eb5abfddb2394091c1fdebc71b5fd",
    "typeString": "StartrailRegistryCancelSRRCommitment(address from,uint256 nonce,uint256 tokenId)",
  },
  Object {
    "id": "0xff1b6ae7ba3b6fcaf8441b4b7ebbebb22444db035e8eb25feb17296a6c00b54b",
    "typeHash": "0xff1b6ae7ba3b6fcaf8441b4b7ebbebb22444db035e8eb25feb17296a6c00b54b",
    "typeString": "WalletChangeThreshold(address from,uint256 nonce,address wallet,uint256 threshold)",
  },
  Object {
    "id": "0x052d8d1acdbf73c1b466436c3bc062709a28af704363f8b326314d7ab01ce47b",
    "typeHash": "0x052d8d1acdbf73c1b466436c3bc062709a28af704363f8b326314d7ab01ce47b",
    "typeString": "BulkTransferSendBatch(address from,uint256 nonce,bytes32 merkleRoot)",
  },
  Object {
    "id": "0x1f6bcc34496ca1b52d584f9a76e6a39b27989a9c186f8bcac08b53d1b03bb293",
    "typeHash": "0x1f6bcc34496ca1b52d584f9a76e6a39b27989a9c186f8bcac08b53d1b03bb293",
    "typeString": "StartrailRegistryAddHistory(address from,uint256 nonce,bytes data,uint256[] tokenIds,uint256[] customHistoryIds)",
  },
  Object {
    "id": "0x43b411a61269fac54b60a3a5c04241addcc8c4e9e4844916999593fd135aa9f6",
    "typeHash": "0x43b411a61269fac54b60a3a5c04241addcc8c4e9e4844916999593fd135aa9f6",
    "typeString": "StartrailRegistrySetLockExternalTransfer(address from,uint256 nonce,uint256 tokenId,bool flag)",
  },
  Object {
    "id": "0x98ce74b76cbcc5f7fc9d14949a70627b5dc8b6d1ff04fc70f34c4839ccdabf11",
    "typeHash": "0x98ce74b76cbcc5f7fc9d14949a70627b5dc8b6d1ff04fc70f34c4839ccdabf11",
    "typeString": "StartrailRegistryCreateSRRWithLockExternalTransfer(address from,uint256 nonce,bool isPrimaryIssuer,address artistAddress,bytes32 metadataDigest,bool lockExternalTransfer)",
  },
  Object {
    "id": "0xbb7ee9c4ba6fdc75187418d24acba89107ee1d0afb3596dcdb11e70703c25803",
    "typeHash": "0xbb7ee9c4ba6fdc75187418d24acba89107ee1d0afb3596dcdb11e70703c25803",
    "typeString": "StartrailRegistryTransferFromWithProvenance(address from,uint256 nonce,bytes data,address to,uint256 tokenId,string historyMetadataDigest,uint256 customHistoryId,bool isIntermediary)",
  },
  Object {
    "id": "0x0172d8aef956076d95cd17382b234ebf2df603970f8b6389e750dc1473b7bf3a",
    "typeHash": "0x0172d8aef956076d95cd17382b234ebf2df603970f8b6389e750dc1473b7bf3a",
    "typeString": "BulkSendBatch(address from,uint256 nonce,bytes32 merkleRoot)",
  },
  Object {
    "id": "0xdaf029518ea1e0c4b5517bda19381f793f3b9ca93174a70d7c688b717f8f9890",
    "typeHash": "0xdaf029518ea1e0c4b5517bda19381f793f3b9ca93174a70d7c688b717f8f9890",
    "typeString": "StartrailRegistryCreateSRRFromLicensedUser(address from,uint256 nonce,bool isPrimaryIssuer,address artistAddress,bytes32 metadataDigest,bool lockExternalTransfer,address to)",
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
    "from": "0x7bf6d2f6f832ad774fb7eec02a73ecea47ee90eb",
    "isIntermediary": false,
    "metadataDigest": "0xba136728b9ccfc56aa07d354fb7b5b026fa8123ad74f2fdb7a938bdf08c77a70",
    "metadataURI": "https://api.startrail.io/api/v1/metadata/ba136728b9ccfc56aa07d354fb7b5b026fa8123ad74f2fdb7a938bdf08c77a70.json",
    "srr": Object {
      "id": "628560438356",
    },
    "to": "0xf1dbd215d72d99422693ca61f7bbecfcd0edb16f",
  },
  Object {
    "customHistory": null,
    "from": "0x7bf6d2f6f832ad774fb7eec02a73ecea47ee90eb",
    "isIntermediary": true,
    "metadataDigest": "0xba136728b9ccfc56aa07d354fb7b5b026fa8123ad74f2fdb7a938bdf08c77a70",
    "metadataURI": "https://api.startrail.io/api/v1/metadata/ba136728b9ccfc56aa07d354fb7b5b026fa8123ad74f2fdb7a938bdf08c77a70.json",
    "srr": Object {
      "id": "151267251424",
    },
    "to": "0xf1dbd215d72d99422693ca61f7bbecfcd0edb16f",
  },
  Object {
    "customHistory": null,
    "from": "0xf1dbd215d72d99422693ca61f7bbecfcd0edb16f",
    "isIntermediary": false,
    "metadataDigest": "0xba136728b9ccfc56aa07d354fb7b5b026fa8123ad74f2fdb7a938bdf08c77a70",
    "metadataURI": "https://api.startrail.io/api/v1/metadata/ba136728b9ccfc56aa07d354fb7b5b026fa8123ad74f2fdb7a938bdf08c77a70.json",
    "srr": Object {
      "id": "628560438356",
    },
    "to": "0xb31f2241cb4d48dcf7825a75b46b4f6b13829a20",
  },
  Object {
    "customHistory": null,
    "from": "0xf1dbd215d72d99422693ca61f7bbecfcd0edb16f",
    "isIntermediary": false,
    "metadataDigest": "0x",
    "metadataURI": "",
    "srr": Object {
      "id": "151267251424",
    },
    "to": "0xb31f2241cb4d48dcf7825a75b46b4f6b13829a20",
  },
  Object {
    "customHistory": null,
    "from": "0xb31f2241cb4d48dcf7825a75b46b4f6b13829a20",
    "isIntermediary": false,
    "metadataDigest": "0x",
    "metadataURI": "",
    "srr": Object {
      "id": "151267251424",
    },
    "to": "0xfa08ed057457f857e9f1672cd979f5ef0628cd9a",
  },
  Object {
    "customHistory": Object {
      "id": "1",
    },
    "from": "0x7bf6d2f6f832ad774fb7eec02a73ecea47ee90eb",
    "isIntermediary": false,
    "metadataDigest": "0xba136728b9ccfc56aa07d354fb7b5b026fa8123ad74f2fdb7a938bdf08c77a70",
    "metadataURI": "https://api.startrail.io/api/v1/metadata/ba136728b9ccfc56aa07d354fb7b5b026fa8123ad74f2fdb7a938bdf08c77a70.json",
    "srr": Object {
      "id": "450616792060",
    },
    "to": "0xf1dbd215d72d99422693ca61f7bbecfcd0edb16f",
  },
  Object {
    "customHistory": null,
    "from": "0x7bf6d2f6f832ad774fb7eec02a73ecea47ee90eb",
    "isIntermediary": false,
    "metadataDigest": "0xe515947139053d36f28e833667f77df096b1dd3ecdd0146bce6cc5fa38700615",
    "metadataURI": "https://api.startrail.io/api/v1/metadata/0xe515947139053d36f28e833667f77df096b1dd3ecdd0146bce6cc5fa38700615.json",
    "srr": Object {
      "id": "333561554987",
    },
    "to": "0x88f7c48e2a696276d13004c7bd32eae05e4f2be1",
  },
  Object {
    "customHistory": null,
    "from": "0x7bf6d2f6f832ad774fb7eec02a73ecea47ee90eb",
    "isIntermediary": false,
    "metadataDigest": "0x",
    "metadataURI": "",
    "srr": Object {
      "id": "245695180461",
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
      commitment: null,
      id: '151267251424',
      lastAction: 'transfer',
    },
    {
      commitment: null,
      id: '628560438356',
      lastAction: 'transfer',
    },
    {
      commitment:
        '0x10ca3eff73ebec87d2394fc58560afeab86dac7a21f5e402ea0a55e5c8a6758f',
      id: '725195465807',
      lastAction: 'approve',
    },
  ]

  expect(result.srrtransferCommits).toStrictEqual(data)
})

// ignoring createdAt and updatedAt field
test('bulkIssues', async () => {
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
      issuer: '0x7bf6d2f6f832ad774fb7eec02a73ecea47ee90eb',
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
      metadataHistory {
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
        '0x001c7d6fdb9885b02689d0d76b34fe73e7706b3e9e841c16a8f8264077d197cd',
      metadataHistory: [
        {
          metadataDigest:
            '0xcc3b6344b207c582bd727005be2a5de5bbca7b46b590d9e9189f3a9a7ea8283e',
        },
      ],
      name: 'GOMA Australia',
      originChain: 'eip155:31337',
      srrHistory: [
        {
          srr: {
            id: '628560438356',
          },
        },
      ],
    },
  ]

  expect(result.customHistories).toStrictEqual(data)
})

test('customHistoryMetadataHistories', async () => {
  const query = `
  {
    customHistoryMetadataHistories {
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
        '0xcc3b6344b207c582bd727005be2a5de5bbca7b46b590d9e9189f3a9a7ea8283e',
      customHistory: {
        id: '1',
        metadataDigest:
          '0x001c7d6fdb9885b02689d0d76b34fe73e7706b3e9e841c16a8f8264077d197cd',
        name: 'GOMA Australia',
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
        id: '628560438356',
      },
    },
  ]

  expect(result.srrhistories).toStrictEqual(data)
})
