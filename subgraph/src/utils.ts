import {
  Address,
  BigInt,
  dataSource,
  ethereum,
  log,
} from '@graphprotocol/graph-ts'

export let currentChainId = (): string => {
  let network: string = dataSource.network()

  let chainId: string

  if (network === 'matic') {
    chainId = 'eip155:137'
  } else if (network.indexOf('mumbai') !== -1) {
    chainId = 'eip155:80001'
  } else if (network === 'hardhat' || network.indexOf('local') !== -1) {
    chainId = 'eip155:31337'
  } else {
    chainId = 'eip155:unknown'
  }

  return chainId
}

export let ZERO_ADDRESS = Address.fromString(
  '0x0000000000000000000000000000000000000000'
)

export function secondsToMillis(timestampSeconds: BigInt): BigInt {
  return timestampSeconds.times(BigInt.fromI32(1000))
}

export function eventUTCMillis(event: ethereum.Event): BigInt {
  return secondsToMillis(event.block.timestamp)
}

export function ethereumValueToString(v: ethereum.Value): string {
  let valueStr: string
  switch (v.kind) {
    case ethereum.ValueKind.STRING:
      valueStr = v.toString()
      break
    case ethereum.ValueKind.ADDRESS:
      valueStr = v.toAddress().toHexString()
      break
    case ethereum.ValueKind.INT:
    case ethereum.ValueKind.UINT:
      valueStr = v.toBigInt().toString()
      break
    case ethereum.ValueKind.BYTES:
    case ethereum.ValueKind.FIXED_BYTES:
      valueStr = v.toBytes().toHexString()
      break
    case ethereum.ValueKind.ARRAY:
    case ethereum.ValueKind.FIXED_ARRAY:
      valueStr =
        '(' +
        v
          .toArray()
          .map<string>((iv: ethereum.Value) => ethereumValueToString(iv))
          .toString() +
        ')'
      break
    case ethereum.ValueKind.TUPLE:
      valueStr =
        '(' +
        v
          .toTuple()
          .map<string>((iv: ethereum.Value) => ethereumValueToString(iv))
          .toString() +
        ')'
      break
    default:
      // raw u64 type
      valueStr = v.data.toString()
  }
  return valueStr
}

export function logInvocation(
  handlerName: string,
  event: ethereum.Event
): void {
  let paramLog: string[] = event.parameters.map<string>(
    (p) => p.name + ':' + ethereumValueToString(p.value)
  )
  log.info('{} [params: {}] [tx: {}]', [
    handlerName,
    paramLog.toString(),
    event.transaction.hash.toHexString(),
  ])
}

export function toUTCString(timestamp: BigInt): string {
  return new Date(timestamp.toI64()).toUTCString()
}
