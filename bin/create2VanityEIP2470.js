const ethers = require("ethers");
const fs = require("fs");
const {
  SINGLETON_FACTORY_ADDRESS,
} = require("../utils/deployment/deploy-eip2470-singleton-factory");

const getBytecodeHash = (subpath, contractName) =>
  ethers.utils.keccak256(
    JSON.parse(
      fs
        .readFileSync(
          `artifacts/contracts/${subpath}/${contractName}.sol/${contractName}.json`
        )
        .toString()
    ).bytecode
  );

const generateAddress = (bytecodeHash, salt) =>
  ethers.utils.getCreate2Address(SINGLETON_FACTORY_ADDRESS, salt, bytecodeHash);

const generateVanityAddress = (vanityPrefix, bytecodeHash) => {
  let attempts = 0;
  let seed = Math.random();
  do {
    seed += 0.000000001;
    const salt = ethers.utils.id(String(seed));
    const addr = generateAddress(bytecodeHash, salt);
    // console.log(`${addr} [salt:${salt}]`);
    if (addr.startsWith(vanityPrefix)) {
      console.log(`${addr} [salt:${salt}]`);
    }

    if (++attempts % 10000 === 0) {
      console.log(`attempts ${attempts}`);
    }
  } while (true);
};

let bytecodeHash;

// Option 1: Generate for a contract in artifacts/ with no-args constructor

// bytecodeHash = getBytecodeHash("licensedUser", "LicensedUserManager");
// generateVanityAddress("0xCAFE", bytecodeHash);

// Option 2: Generate for with a precomputed initCode hash
//
//   For the LicensedUserManager proxy use the 'lumProxyInitcode hash ='
//     value in deploy-licensed-user-manager.js on logged at line 130:
//
//   For the LicensedUserManager implementation use the 'lum bytecodehash ='
//     value in deploy-licensed-user-manager.js on logged at line 72:
//
// lumProxyInitcode hash =
bytecodeHash =
  "0xe21fac7dcdb703305e12f661db94d599bd2a5cf06338399d2fd949d3cf3ed963";

generateVanityAddress("0xA127", bytecodeHash);
