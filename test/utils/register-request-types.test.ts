import hre from 'hardhat'
import { ZERO_ADDRESS } from '../helpers/utils'

const { assert } = require('chai')
const {
  metaTxRequests,
  MetaTxRequestType,
} = require('../../startrail-common-js/meta-tx/meta-tx-request-registry')

const {
  buildRegisterRequestTypeInputProps,
  getDestinationAddress,
} = require('../../utils/register-request-types')

describe('register-request-types', () => {
  const DESTINATION = `0x6635F83421Bf059cd8111f180f0727128685BaE4`

  it('buildRegisterRequestTypeInputProps', () => {
    const requestType = MetaTxRequestType.WalletAddOwner

    const inputProps = buildRegisterRequestTypeInputProps(
      requestType,
      DESTINATION
    )

    assert.equal(inputProps[0], requestType)
    assert.equal(inputProps[1], metaTxRequests[requestType].suffixTypeString)
    assert.equal(inputProps[2], DESTINATION)
    assert.equal(inputProps[3], '0x8f5aa132')
  })

  describe('getDestinationAddress', () => {
    it('returns the Zero address for Collection meta transactions', () => {
      assert.equal(
        getDestinationAddress(hre, MetaTxRequestType.CollectionUpdateSRR),
        ZERO_ADDRESS
      )
    })
  })
})
