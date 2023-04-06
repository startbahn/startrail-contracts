import { expect } from 'chai'

import { id } from '@ethersproject/hash'

import featureSelectors from '../../../utils/collection/feature-selectors'

const selectorFromFnSig = (fnSig) => id(fnSig).substring(0, 10)

describe('feature-selectors', () => {
  it('erc721MetadataFunctionSelectors', async () =>
    expect(
      await featureSelectors.lockExternalTransfer()
    ).to.have.ordered.members([
      selectorFromFnSig(`setLockExternalTransfer(uint256,bool)`),
      selectorFromFnSig(`getLockExternalTransfer(uint256)`),
    ]))
})
