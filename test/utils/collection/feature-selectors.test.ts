import { expect } from 'chai'

import { id } from '@ethersproject/hash'

import { CollectionFeatureSelectors } from '../../../utils/collection/feature-selectors'
import {
  CollectionFeatureEnum,
  CollectionFunctionSignatures,
} from '../../../utils/collection/feature-signatures'

const selectorFromFnSig = (fnSig) => id(fnSig).substring(0, 10)

describe('Collection Feature Selectors', () => {
  const featureNames = Object.values(CollectionFeatureEnum)

  for (const featureName of featureNames) {
    describe(`Feature: ${featureName}`, () => {
      const versions = Object.keys(CollectionFunctionSignatures[featureName])

      for (const version of versions) {
        it(`Version: ${version}`, async () => {
          const selectors = await CollectionFeatureSelectors[featureName](
            version
          )
          const featureFunctions =
            CollectionFunctionSignatures[featureName][version]
          const expectedSelectors = featureFunctions.map((func) =>
            selectorFromFnSig(func)
          )

          expect(selectors).to.have.ordered.members(expectedSelectors)
        })
      }
    })
  }
})
