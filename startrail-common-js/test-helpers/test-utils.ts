import { BigNumber, ethers } from 'ethers'
import { IsFlattenedSignature } from '../validation/flattened-signature.decorator'

export const randomWallet = (): ethers.Wallet => ethers.Wallet.createRandom()
export const randomTokenId = (): BigNumber =>
  BigNumber.from(Math.round(Math.random() * 10e12))
export const randomBoolean = (): boolean => Math.random() < 0.5

// This method of generating an address is much faster than
// ethers.Wallet.createRandom() which is important when generating 1000s for a
// large bulk test.
// We don't care about weak randomness here so this method is fine for
// generating test data purposes.
export const randomAddress = (): string =>
  new ethers.Wallet(ethers.utils.id(String(Math.random()))).address

export const regExpSha256 = new RegExp(/[a-z0-9]{64}/)
export const regExpAnyValue = new RegExp(/.+?/)

export class TestFlattenedSignatureDto {
  @IsFlattenedSignature()
  signature!: string
}