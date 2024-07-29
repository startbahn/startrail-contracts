import { ethers, BigNumber } from 'ethers'

export const startrailRegistryWriteCustomHistoryType = async (
  startrailRegistry: ethers.Contract,
  params: {
    historyTypeName: string
  }
): Promise<number> => {
  const { historyTypeName } = params
  return startrailRegistry
    .addCustomHistoryType(historyTypeName)
    .then((txRsp) => txRsp.wait(0))
    .then(
      (txReceipt) =>
        startrailRegistry.interface.parseLog(txReceipt.logs[0]).args.id
    )
}

export const startrailRegistryWriteCustomHistory = async (
  startrailRegistry: ethers.Contract,
  params: {
    historyName: string
    historyTypeId: string
    metadataDigestArg: string
  }
): Promise<number> => {
  const { historyName, historyTypeId, metadataDigestArg } = params
  return startrailRegistry[`writeCustomHistory(string,uint256,bytes32)`](
    historyName,
    historyTypeId,
    metadataDigestArg
  )
    .then((txRsp) => txRsp.wait(0))
    .then(
      (txReceipt) =>
        startrailRegistry.interface.parseLog(txReceipt.logs[0]).args.id
    )
}

export const toChecksumAddress = (address: string) =>
  ethers.utils.getAddress(address)
