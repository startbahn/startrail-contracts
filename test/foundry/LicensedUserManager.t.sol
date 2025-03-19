pragma solidity 0.8.28;

import {UpgradeableBeacon} from "@openzeppelin/contracts/proxy/beacon/UpgradeableBeacon.sol";
import { BeaconProxy } from "@openzeppelin/contracts/proxy/beacon/BeaconProxy.sol";
import "@openzeppelin/contracts/utils/Create2.sol";

import {TestSimpleAccount} from "./mock/TestSimpleAccount.sol";
import "./StartrailTestBase.sol";

contract LicensedUserManagerTest is StartrailTestBase {

    function testPostDeploymentAndUpgrade() public {
        // Actually deploying the wallets after upgrading the implementation at beacon and make sure the deployed addresses are same as the previously computed addresses
        vm.prank(admin);
        address newImplementation = address(new TestSimpleAccount()); // After we implement the wallet, we should replace this TestSimpleAccount with the real one
        vm.prank(admin);
        licensedUserBeacon.upgradeTo(newImplementation);
        address accountAddressWithSalt1 = deployAccount(licensedUser1Owner,"salt1");
        assertEq(accountAddressWithSalt1, licensedUser1Address);
        assertEq(TestSimpleAccount(accountAddressWithSalt1).owner(), licensedUser1Owner);
        address accountAddressWithSalt2 = deployAccount(licensedUser2Owner,"salt2");
        assertNotEq(
            accountAddressWithSalt1, accountAddressWithSalt2
        );
    }

    function testInvalidCreateWallet() public {
        vm.expectRevert("Invalid owner address");
        address[] memory invalidOwners = new address[](1);
        invalidOwners[0] = address(0);
        createLicensedUser(
            invalidOwners,
            1,
            LicensedUserManagerV02.UserType.HANDLER,
            "Invalid Owner LU",
            "Invalid Owner LU",
            "invalidOwner"
        );

        vm.expectRevert("englishName must not be empty");
        address[] memory owners = new address[](1);
        owners[0] = address(1);
        createLicensedUser(
            owners,
            1,
            LicensedUserManagerV02.UserType.HANDLER,
            "",
            "Original Name",
            "englishNameIsEmpty"
        );

        vm.expectRevert("originalName must not be empty");
        createLicensedUser(
            owners,
            1,
            LicensedUserManagerV02.UserType.HANDLER,
            "English Name",
            "",
            "originalNameIsEmpty"
        );
    }

    function deployAccount(
        address owner,
        bytes32 salt
    ) public returns (address accountAddress) {
        bytes memory bytecode = abi.encodePacked(
            type(BeaconProxy).creationCode,
            abi.encode(
                licensedUserBeacon,
                abi.encodeWithSignature("initialize(address)", owner)
            )
        );
        vm.prank(address(licensedUserManager));
        accountAddress = Create2.deploy(0, salt, bytecode);
    }
}
