const { assert } = require("chai");

const { getEvent } = require("../../startrail-common-js/ethereum/tx-helpers");

const EXECUTION_SUCCESS = "ExecutionSuccess";

const assertEvent = async (transactionResponse, eventName, checkEventFn) => {
  const txReceipt = await transactionResponse.wait();
  // console.log(JSON.stringify(txReceipt, null, 2));

  const event = getEvent(txReceipt, eventName);
  if (!event) {
    assert.fail(`event ${eventName} not found`);
  }

  if (checkEventFn) {
    checkEventFn(event);
  }
};

const assertExecutionSuccessEmitted = (transactionResponse) =>
  assertEvent(transactionResponse, EXECUTION_SUCCESS);

const assertExecutionFailure = async (
  txResponsePromise,
  expectedErrorMessage
) => assert.isRejected(txResponsePromise, expectedErrorMessage);

const assertRevert = (
  promise, // PromiseLike<any>
  expectedMessage // string
) =>
  assert.isRejected(promise,
    `VM Exception while processing transaction: reverted with reason string '${expectedMessage}'`)

const bnArrToStringArr = arr => arr.map(bn => bn.toString())
const assertEqualBigNumberArrays = (arr1, arr2) => assert.deepEqual(bnArrToStringArr(arr1), bnArrToStringArr(arr2))

module.exports = {
  assertEqualBigNumberArrays,
  assertEvent,
  assertExecutionFailure,
  assertExecutionSuccessEmitted,
  assertRevert,
};
