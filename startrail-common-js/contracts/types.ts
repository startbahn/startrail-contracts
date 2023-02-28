// Startrail Contracts.sol
enum ContractKeys {
  Administrator = 1,
  StartrailProxyAdmin = 2,
  LicensedUserManager = 3,
  StartrailRegistry = 4,
  BulkIssue = 5,
  MetaTxForwarder = 6,
  BulkTransfer = 7,
  Bulk = 8,
}

// Startrail Contracts.sol legacy
enum ContractKeysLegacy {
  RootLogic = 1,
  BulkIssue = 2,
  StartrailRegistry = 3,
  StartrailProxyAdmin = 4,
  LicensedUserLogic = 5,
  LicensedUserWalletFactory = 6,
  LicensedUserEvent = 7,
  LicensedUserManager = 8,
  Administrator = 9,
}

// Array of the number/id values (used as NameRegistry keys)

const keysToIds = (keysType) =>
  Object.keys(keysType)
    .map((v) => Number(v))
    .filter((v) => !Number.isNaN(v))

const ContractKeyIds = keysToIds(ContractKeys)
const ContractKeyIdsLegacy = keysToIds(ContractKeysLegacy)

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

export {
  ContractKeys,
  ContractKeysLegacy,
  ContractKeyIds,
  ContractKeyIdsLegacy,
  Operation,
  UserType,
}
