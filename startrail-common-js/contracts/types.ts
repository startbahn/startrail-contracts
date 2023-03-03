// Startrail Contracts.sol
enum ContractKeys {
  Administrator = 1,
  StartrailProxyAdmin = 2,
  LicensedUserManager = 3,
  StartrailRegistry = 4,
  BulkIssue = 5, // backward compatibility for deployment
  MetaTxForwarder = 6,
  BulkTransfer = 7, // backward compatibility for deployment
  Bulk = 8,
}

// Array of the number/id values (used as NameRegistry keys)

const keysToIds = (keysType) =>
  Object.keys(keysType)
    .map((v) => Number(v))
    .filter((v) => !Number.isNaN(v))

const ContractKeyIds = keysToIds(ContractKeys)

// @gnosis.pm/safe-contracts/contracts/common/Enum.sol
enum Operation {
  CALL = 0,
  DELEGATECALL = 1,
}

// Startrail LicensedUserManager.sol
enum UserType {
  HANDLER = 0,
  ARTIST = 1,
}

export { ContractKeys, ContractKeyIds, Operation, UserType }
