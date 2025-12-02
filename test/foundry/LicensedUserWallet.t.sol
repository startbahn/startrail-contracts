// SPDX-License-Identifier: GPL-3.0-only

pragma solidity 0.8.28;

import {PackedUserOperation} from "../../contracts/lib/PackedUserOperation.sol";
import {EntryPoint} from "../../contracts/test/EntryPoint.sol";
import {IEntryPoint} from "../../contracts/test/IEntryPoint.sol";
import {StartrailPaymasterV01} from "../../contracts/common/StartrailPaymasterV01.sol";
import "./StartrailTestBase.sol";
import {Call} from "../../contracts/lib/Call.sol";

contract LicensedUserWalletTest is StartrailTestBase {
    /**
     * Here we want to test that EntryPoint can
     * - call validateUserOp of LicensedUserWallet
     * - call execute of LicensedUserWallet
     */
    function testHandleOpsbyEntryPoint() public {
        // Test successful case with valid signature
        testHandleOpsWithSignature(0x1212, false, "", ""); // 0x1212 is licensedUser1Owner's private key
    }

    function testHandleOpsWithInvalidSignature() public {
        testHandleOpsWithSignature(
            0x1313,
            true,
            "AA23 reverted",
            abi.encodeWithSignature(
                "Error(string)",
                "Signer in signatures is not an owner of this wallet"
            )
        ); // 0x1313 is licensedUser2Owner's private key, should fail
    }

    function testHandleOpsToNonRegisteredContract() public {
        vm.prank(admin);
        nameRegistry.set(Contracts.STARTRAIL_REGISTRY, address(0x0));
        testHandleOpsWithSignature(
            0x1212,
            true,
            "AA33 reverted",
            abi.encodeWithSelector(
                StartrailPaymasterV01.DestinationNotWhitelisted.selector
            )
        );
    }

    function testHandleOpsWithSignature(
        uint256 signerPrivateKey,
        bool shouldRevert,
        string memory aaReason,
        bytes memory revertReason
    ) internal {
        vm.prank(admin);
        licensedUserManager.deploy("salt1", licensedUser1Address);

        vm.prank(admin);
        StartrailPaymasterV01 paymaster = new StartrailPaymasterV01();
        paymaster.initialize(
            address(nameRegistry),
            address(collectionFactory.collectionRegistry())
        );
        address paymasterAddress = address(paymaster);

        // Fund the paymaster with ETH
        vm.deal(paymasterAddress, 100 ether);
        vm.prank(paymasterAddress);
        entryPoint.depositTo{value: 100 ether}(paymasterAddress);

        Call[] memory calls = new Call[](1);
        Call memory call;
        call.to = address(mockStartrailRegistry);
        call.data = abi.encodeWithSelector(
            MockStartrailRegistry.setMaxCombinedHistoryRecords.selector,
            4
        );
        calls[0] = call;

        bytes memory callData = abi.encodeWithSelector(
            LicensedUserWallet.execute.selector,
            calls
        );

        // Create paymaster data: paymaster address (20 bytes) + validation gas limit (16 bytes) + postOp gas limit (16 bytes)
        bytes memory paymasterData = abi.encodePacked(
            paymasterAddress, // 20 bytes
            uint128(100000), // validation gas limit (16 bytes)
            uint128(50000) // postOp gas limit (16 bytes)
        );

        PackedUserOperation memory op;
        op.sender = licensedUser1Address;
        op.nonce = 0;
        op.callData = callData;
        op.accountGasLimits = bytes32((uint256(1_000_000) << 128) | 1_000_000); // verificationGasLimit | callGasLimit
        op.preVerificationGas = 21000;
        op.gasFees = bytes32((uint256(1_000_000_000) << 128) | 1_000_000_000); // maxPriorityFeePerGas | maxFeePerGas
        op.paymasterAndData = paymasterData;

        // Create the hash that needs to be signed using EntryPoint's getUserOpHash method
        bytes32 opHash = entryPoint.getUserOpHash(op);
        // Sign the hash with the provided private key
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(signerPrivateKey, opHash);
        bytes memory signature = abi.encodePacked(r, s, v);
        op.signature = signature;

        PackedUserOperation[] memory ops = new PackedUserOperation[](1);
        ops[0] = op;

        if (shouldRevert) {
            // For EntryPoint, we need to expect a revert with FailedOpWithRevert when validation fails (account: AA2x, paymaster: AA3x)
            vm.expectRevert(
                abi.encodeWithSelector(
                    IEntryPoint.FailedOpWithRevert.selector,
                    0, // opIndex
                    aaReason, // reason code string from caller
                    revertReason // inner revert data
                )
            );
            entryPoint.handleOps(ops, payable(admin));
        } else {
            // capture balances before
            uint256 paymasterDepositBefore = entryPoint.balanceOf(paymasterAddress);
            uint256 beneficiaryBalanceBefore = admin.balance;
            uint256 licensedUserEthBefore = licensedUser1Address.balance;
            uint256 paymasterEthBefore = paymasterAddress.balance;

            entryPoint.handleOps(ops, payable(admin));
            assertEq(mockStartrailRegistry.maxCombinedHistoryRecords(), 4);

            // capture balances after
            uint256 paymasterDepositAfter = entryPoint.balanceOf(paymasterAddress);
            uint256 beneficiaryBalanceAfter = admin.balance;
            uint256 licensedUserEthAfter = licensedUser1Address.balance;
            uint256 paymasterEthAfter = paymasterAddress.balance;

            // gas was paid from the paymaster's deposit inside EntryPoint
            uint256 paidFromPaymaster = paymasterDepositBefore - paymasterDepositAfter;
            assertGt(paidFromPaymaster, 0);

            // bundler/beneficiary received exactly what was paid from the deposit
            assertEq(beneficiaryBalanceAfter - beneficiaryBalanceBefore, paidFromPaymaster);

            // neither the smart account nor the paymaster contract ETH balances changed
            assertEq(licensedUserEthAfter, licensedUserEthBefore);
            assertEq(paymasterEthAfter, paymasterEthBefore);
        }
    }
}
