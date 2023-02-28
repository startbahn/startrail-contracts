const logGasUsedOn = true;

const logGasUsed = (transactionReceipt) =>
  console.log(`\ngasUsed: ${transactionReceipt.gasUsed.toString()}`);

const logGasUsedFromTxRspPromise = (transactionResponsePromise) =>
  logGasUsedOn && transactionResponsePromise.wait().then(logGasUsed);

module.exports = {
  logGasUsed,
  logGasUsedFromTxRspPromise,
};
