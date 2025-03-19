import { registerDecorator, ValidationArguments } from 'class-validator'
import { ethers } from 'ethers'

export function IsFlattenedSignature() {
  return function (object: object, propertyName: string): void {
    registerDecorator({
      name: 'IsFlattenedSignature',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [],
      options: {},
      validator: {
        validate(value: string): boolean {
          try {
            ethers.utils.splitSignature(value)
            return true
          } catch (err: any) {
            return false
          }
          return true
        },
        defaultMessage: (args: ValidationArguments): string =>
          `${args.property} must be a valid flattened signature (ethers.utils.splitSignature failed)`,
      },
    })
  }
}