import { id } from '@ethersproject/hash'
import { expect } from 'chai'
import { erc721MetadataFunctionSelectors } from '../../../utils/collection/feature-selectors'

const selectorFromFnSig = (fnSig) => id(fnSig).substring(0, 10)

describe('feature-selectors', () => {
  it('erc721MetadataFunctionSelectors', async () => {
    expect(await erc721MetadataFunctionSelectors()).to.have.ordered.members([
      selectorFromFnSig(`name()`),
      selectorFromFnSig(`symbol()`),
      selectorFromFnSig(`tokenURI(uint256)`),
    ])
  })
})
