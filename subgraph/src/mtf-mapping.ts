import { log, store } from '@graphprotocol/graph-ts'

import {
  ExecutionSuccess as ExecutionSuccessEvent,
  RequestTypeRegistered as RequestTypeRegisteredEvent,
  RequestTypeUnregistered as RequestTypeUnregisteredEvent,
} from '../generated/MetaTxForwarder/MetaTxForwarder'
import { MetaTxExecution, MetaTxRequestType } from '../generated/schema'
import { eventUTCMillis, logInvocation, toUTCString } from './utils'

export function handleRequestTypeRegistered(
  event: RequestTypeRegisteredEvent
): void {
  logInvocation('handleRequestTypeRegistered', event)

  let typeHash = event.params.typeHash
  let requestType = new MetaTxRequestType(typeHash.toHex())
  requestType.typeHash = typeHash
  requestType.typeString = event.params.typeStr

  log.info('creating MetaTxRequestType hash [{}] typeString [{}]', [
    requestType.typeHash.toHex(),
    requestType.typeString,
  ])
  requestType.createdAt = eventUTCMillis(event)
  requestType.createdAtStr = toUTCString(requestType.createdAt)
  requestType.save()
}

export function handleRequestTypeUnregistered(
  event: RequestTypeUnregisteredEvent
): void {
  logInvocation('handleRequestTypeUnregistered', event)

  let requestTypeId = event.params.typeHash.toHex()
  let requestType = MetaTxRequestType.load(requestTypeId)
  if (!requestType) {
    log.error(
      'received ReqestTypeUnregistered for unknown MetaTxRequestType: {}',
      [requestTypeId]
    )
    return
  }

  log.info('removing MetaTxRequestType hash [{}] typeString [{}]', [
    requestType.typeHash.toHex(),
    requestType.typeString,
  ])
  store.remove('MetaTxRequestType', requestTypeId)
}

export function handleExecutionSuccess(event: ExecutionSuccessEvent): void {
  logInvocation('handleExecutionSuccess', event)

  let txHash = event.params.txHash
  let execution = new MetaTxExecution(txHash.toHex())
  execution.txHash = txHash
  log.info('creating MetaTxExecution hash [{}]', [txHash.toHex()])
  execution.createdAt = eventUTCMillis(event)
  execution.createdAtStr = toUTCString(execution.createdAt)
  execution.save()
}
