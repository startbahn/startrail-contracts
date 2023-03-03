import { BigNumberish, BytesLike } from 'ethers'

// The following should be in Typechain but for some reason is not so define it here
const FacetCutAction = { Add: 0, Replace: 1, Remove: 2 }

interface FacetCutDefinition {
  target: string
  action: BigNumberish
  selectors: BytesLike[]
}

export { FacetCutAction, FacetCutDefinition }
