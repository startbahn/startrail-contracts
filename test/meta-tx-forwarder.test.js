const hre = require("hardhat");
const { ethers } = require("ethers");

const { expect, use } = require("chai");
const chaiAsPromised = require("chai-as-promised");

const { ContractKeys } = require("../startrail-common-js/contracts/types");
const { sha256 } = require("../startrail-common-js/digest/sha256");
const { Logger } = require("../startrail-common-js/logger");
const {
  MetaTxRequestType,
} = require("../startrail-common-js/meta-tx/meta-tx-request-registry");

const { assertExecutionSuccessEmitted, assertRevert } = require("./helpers/assertions");
const { fixtureDefault } = require("./helpers/fixtures");
const { logGasUsedFromTxRspPromise } = require("./helpers/log-gas");
const {
  createLicensedUserWalletDirect,
  createSRRRequest,
  encodeSignExecute,
} = require("./helpers/utils");
const { getWallets } = require("../utils/hardhat-helpers");
const { nameRegistrySet } = require("../utils/name-registry-set");
const { ZERO_ADDRESS, randomText } = require("./helpers/utils");

use(chaiAsPromised);

Logger.setSilent(true);

const wallets = getWallets(hre);
const adminEOAWallet = wallets[0];
const handlerEOAWallet = wallets[1];
const artistEOAWallet = wallets[2];
const outsiderEOAWallet = wallets[3];
const metadataDigest = sha256("some json");
const SCHEMA_URI_PREFIX =
  process.env.SCHEMA_URI_PREFIX || "https://api.startrail.io/api/v1/metadata/";

// Contract handles
let startrailRegistry;

const transferSRRByReveal = async (
  toAddress,
  reveal,
  tokenId,
  fromAddress,
  isIntermediary = false
) => {
  const txReceipt = await startrailRegistry[
    "transferSRRByReveal(address,bytes32,uint256,bool)"
  ](
    toAddress,
    reveal,
    tokenId,
    isIntermediary
  )
    .then((txRsp) => txRsp.wait(0));

  // console.log(txReceipt)
  const ParsedLogProvenance = startrailRegistry.interface.parseLog(
    txReceipt.logs[0]
  );
  // console.log(ParsedLogProvenance)

  expect(ParsedLogProvenance.args.tokenId.toNumber()).to.equal(tokenId);
  expect(ParsedLogProvenance.args.to).to.equal(toAddress);
  expect(ParsedLogProvenance.args.from).to.equal(fromAddress);
  expect(ParsedLogProvenance.args.historyMetadataDigest).to.equal(
    metadataDigest
  );
  expect(ParsedLogProvenance.args.historyMetadataURI).to.equal(
    SCHEMA_URI_PREFIX + metadataDigest + ".json"
  );

  const ParsedLogApproval = startrailRegistry.interface.parseLog(
    txReceipt.logs[1]
  );
  // console.log(ParsedLogApproval)
  expect(ParsedLogApproval.args.owner).to.equal(fromAddress);
  expect(ParsedLogApproval.args.approved).to.equal(ZERO_ADDRESS);
  expect(ParsedLogApproval.args.tokenId.toNumber()).to.equal(tokenId);

  const ParsedLogTransfer = startrailRegistry.interface.parseLog(
    txReceipt.logs[2]
  );
  // console.log(ParsedLogTransfer)

  expect(ParsedLogTransfer.args.from).to.equal(fromAddress);
  expect(ParsedLogTransfer.args.to).to.equal(toAddress);
  expect(ParsedLogTransfer.args.tokenId).to.equal(tokenId);

  const currentOwner = await startrailRegistry.ownerOf(tokenId);
  expect(currentOwner).to.equal(toAddress);
};

describe("MetaTxForwarder", () => {

  before(async function () {
    ({ startrailRegistry, lum } = await hre.waffle.loadFixture(fixtureDefault));

    // For unit testing set the administrator to an EOA wallet.
    // This will allow transactions to be sent directly.
    await nameRegistrySet(
      hre,
      ContractKeys.Administrator,
      adminEOAWallet.address,
      false // don't logMsg (to console)
    );
  });

  describe("executeTransactionLUW", () => {
    //
    // Dynamically generate test case functions from these sets of
    // test input data
    //

    const EXEC_TEST_CASES = [
      {
        name: "1 of 1",
        threshold: 1,
        ownerAddresses: [handlerEOAWallet.address],
        passSigners: [handlerEOAWallet],
        wrongSigners: [artistEOAWallet],
      },
      {
        name: "1 of 2",
        threshold: 1,
        ownerAddresses: [handlerEOAWallet.address, artistEOAWallet.address],
        passSigners: [handlerEOAWallet],
        wrongSigners: [adminEOAWallet],
        notEnoughSigners: [],
      },
      {
        name: "2 of 2",
        threshold: 2,
        ownerAddresses: [handlerEOAWallet.address, artistEOAWallet.address],
        passSigners: [handlerEOAWallet, artistEOAWallet],
        wrongSigners: [adminEOAWallet, artistEOAWallet],
        notEnoughSigners: [artistEOAWallet],
      },
      {
        name: "2 of 3",
        threshold: 2,
        ownerAddresses: [
          handlerEOAWallet.address,
          artistEOAWallet.address,
          adminEOAWallet.address,
        ],
        passSigners: [artistEOAWallet, handlerEOAWallet],
        wrongSigners: [outsiderEOAWallet, artistEOAWallet],
        notEnoughSigners: [handlerEOAWallet],
      },
      {
        name: "3 of 3",
        threshold: 3,
        ownerAddresses: [
          handlerEOAWallet.address,
          artistEOAWallet.address,
          adminEOAWallet.address,
        ],
        // shuffle the order to test they get sorted properly:
        passSigners: [adminEOAWallet, artistEOAWallet, handlerEOAWallet],
        wrongSigners: [handlerEOAWallet, outsiderEOAWallet, artistEOAWallet],
        notEnoughSigners: [handlerEOAWallet, adminEOAWallet],
      },
    ];

    before(async () => {
      for (const testCase of EXEC_TEST_CASES) {
        const { walletAddress } = await createLicensedUserWalletDirect(
          hre,
          {
            owners: testCase.ownerAddresses,
            threshold: testCase.threshold,
          },
          adminEOAWallet
        );
        testCase.luAddress = walletAddress;
      }
    });

    EXEC_TEST_CASES.forEach(async (testCase) => {
      describe(`${testCase.name} wallet`, () => {
        const requestType = MetaTxRequestType.StartrailRegistryCreateSRRWithLockExternalTransfer;

        beforeEach(async () => {
          // Execution request props
          testCase.txRequestData = createSRRRequest();
        });

        it(`should execute transaction`, async () => {
          const txRsp2 = await encodeSignExecute(
            requestType,
            testCase.luAddress,
            testCase.txRequestData,
            testCase.passSigners
          );
          await assertExecutionSuccessEmitted(txRsp2);
          await logGasUsedFromTxRspPromise(txRsp2);
        });

        it(`should reject execution when signature not signed by owner`, () =>
          // Sign with at least one Wallet who is NOT the owner of luAddress
          assertRevert(
            encodeSignExecute(
              requestType,
              testCase.luAddress,
              testCase.txRequestData,
              testCase.wrongSigners // wrong signers
            ),
            `Signer in signatures is not an owner of this wallet`
          ));

        if (testCase.notEnoughSigners) {
          it(`should reject execution when signature count below threshold`, () =>
            // Signing with a wallet count that is below the threshold
            assertRevert(
              encodeSignExecute(
                requestType,
                testCase.luAddress,
                testCase.txRequestData,
                testCase.notEnoughSigners // UNDER THRESHOLD
              ),
              `Signatures data too short`
            ));
        }
      });
    });

    it(`should execute transaction with calldata (data field) [STARTRAIL-737]`, async () => {
      // Setup an LUW and issue a token
      const { walletAddress: fromAddress } = await createLicensedUserWalletDirect(
        hre,
        {
          owners: [handlerEOAWallet.address],
        },
        adminEOAWallet
      );
      const issueRequest = createSRRRequest();
      const tokenId = await encodeSignExecute(
        MetaTxRequestType.StartrailRegistryCreateSRRWithLockExternalTransfer,
        fromAddress,
        issueRequest,
        [handlerEOAWallet]
      )
        .then((txRsp) => txRsp.wait())
        .then((txReceipt) =>
          ethers.BigNumber.from(txReceipt.logs[0].topics[3])
        );

      const requestType =
        MetaTxRequestType.StartrailRegistryApproveSRRByCommitment;
      const approveRequestData = {
        tokenId: tokenId.toString(),
        commitment: ethers.utils.id("a-secret"), // bytes32
        historyMetadataDigest: sha256("some json"), // string
      };

      const txRsp = await encodeSignExecute(
        requestType,
        fromAddress,
        approveRequestData,
        [handlerEOAWallet]
      );
      await assertExecutionSuccessEmitted(txRsp);
      // await logGasUsedFromTxRspPromise(txRsp);
    });
  });

  describe("executeTransactionEOA", () => {
    let eoaAddress;
    let fromAddress;
    let tokenId;
    let approveRequestData;
    let reveal;

    beforeEach(async () => {
      // createSRR from handerWallet
      const { walletAddress } = await createLicensedUserWalletDirect(
        hre,
        {
          owners: [handlerEOAWallet.address],
        },
        adminEOAWallet
      );
      fromAddress = walletAddress;
      const issueRequest = createSRRRequest();
      tokenId = await encodeSignExecute(
        MetaTxRequestType.StartrailRegistryCreateSRRWithLockExternalTransfer,
        fromAddress,
        issueRequest,
        [handlerEOAWallet]
      )
        .then((txRsp) => txRsp.wait())
        .then((txReceipt) =>
          ethers.BigNumber.from(txReceipt.logs[0].topics[3])
        );

      // approveSRRByCommitment from hanlerWallet
      requestType = MetaTxRequestType.StartrailRegistryApproveSRRByCommitment;
      target = randomText() + "@gmail.com";
      targetBytes = ethers.utils.toUtf8Bytes(target);
      reveal = ethers.utils.keccak256(targetBytes);
      const commitment = ethers.utils.keccak256(reveal);
      approveRequestData = {
        tokenId: tokenId.toString(),
        commitment: commitment, // bytes32
        historyMetadataDigest: sha256("some json"), // string
      };

      const txRsp = await encodeSignExecute(
        requestType,
        fromAddress,
        approveRequestData,
        [handlerEOAWallet]
      );
      await assertExecutionSuccessEmitted(txRsp);
      // await logGasUsedFromTxRspPromise(txRsp);

      // transferSRRByReveal from LU(handlerWallet) to EOA
      eoaAddress = artistEOAWallet.address
      await transferSRRByReveal(eoaAddress, reveal, tokenId, fromAddress);

    });

    it(`transfer from EOA to EOA`, async () => {

      // approveSRRByCommitment from EOA
      const txRsp = await encodeSignExecute(
        requestType,
        eoaAddress,
        approveRequestData,
        [artistEOAWallet],
        true
      );
      await assertExecutionSuccessEmitted(txRsp);
      // await logGasUsedFromTxRspPromise(txRsp2);

      // transferSRRByReveal from EOA to EOA
      fromAddress = eoaAddress;
      eoaAddress = outsiderEOAWallet.address;
      // await startrailRegistry["transferSRRByReveal(address,bytes32,uint256)"](eoaAddress, reveal, tokenId);
      await transferSRRByReveal(eoaAddress, reveal, tokenId, fromAddress);

    });

    it(`approveByCommitment and then cancelApproval (test for tx without callData)`, async () => {
      // approveSRRByCommitment from EOA
      const txRsp = await encodeSignExecute(
        requestType,
        eoaAddress,
        approveRequestData,
        [artistEOAWallet],
        true
      );
      await assertExecutionSuccessEmitted(txRsp);
      // await logGasUsedFromTxRspPromise(txRsp);

      // CancelSRRCommitment
      requestType = MetaTxRequestType.StartrailRegistryCancelSRRCommitment;
      const cancelRequestData = {
        tokenId: tokenId.toString(),
      };

      const txRsp2 = await encodeSignExecute(
        requestType,
        eoaAddress,
        cancelRequestData,
        [artistEOAWallet],
        true // fromEOA
      );
      await assertExecutionSuccessEmitted(txRsp2);
      // await logGasUsedFromTxRspPromise(txRsp2);
    });

    it(`should reject execution when signature not signed by owner`, () =>
      assertRevert(
        encodeSignExecute(
          requestType,
          fromAddress,
          approveRequestData,
          [outsiderEOAWallet], // not an owner
          true
        ),
        `Signer verification failed`
      )
    );

    it(`should reject execution if signer uses invalid nonce`, () =>
      assertRevert(
        encodeSignExecute(
          requestType,
          fromAddress,
          approveRequestData,
          [artistEOAWallet],
          true, // fromEOA
          0, // batchId
          true // invalidNonce
        ),
        'Invalid nonce'
      )
    );

  });
});
