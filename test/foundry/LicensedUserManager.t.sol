// SPDX-License-Identifier: GPL-3.0-only

pragma solidity 0.8.28;

import {UpgradeableBeacon} from "@openzeppelin/contracts/proxy/beacon/UpgradeableBeacon.sol";
import {BeaconProxy} from "@openzeppelin/contracts/proxy/beacon/BeaconProxy.sol";
import "./StartrailTestBase.sol";

contract LicensedUserManagerTest is StartrailTestBase {
    event DeployLicensedUserWallet(address indexed walletAddress, bytes32 salt);
    event DeployLicensedUserWallet(
        address indexed walletAddress,
        bytes32 salt,
        address aliasAddressFrom
    );

    function testDeploy() public {
        vm.startPrank(admin);
        vm.expectEmit(false, false, false, true);
        emit DeployLicensedUserWallet(address(0), "salt1"); // computing the address before the execution is possible but not worth the effort for now
        address accountAddressWithSalt1 = licensedUserManager.deploy(
            "salt1",
            licensedUser1Address
        );
        assertEq(accountAddressWithSalt1, licensedUser1Address);
        assertEq(
            LicensedUserManagerV03(
                LicensedUserWallet(accountAddressWithSalt1)
                    .licensedUserManagerAddress()
            ).getOwners(licensedUser1Address)[0],
            licensedUser1Owner
        );
        assertEq(
            LicensedUserWallet(accountAddressWithSalt1)
                .licensedUserManagerAddress(),
            address(licensedUserManager)
        );
        vm.stopPrank();
    }

    function testDeployWithMigration() public {
        vm.startPrank(admin);
        vm.expectEmit(false, false, false, true);
        emit DeployLicensedUserWallet(
            address(0),
            "new_salt1",
            licensedUser1Address
        ); // computing the address before the execution is possible but not worth the effort for now
        /**
         * using the same salt as the one used in the `createLicensedUser` is usually recommeneded,
         * however, as it's hard to simulate the situation that
         * LUM pre-V3 creates the wallet in another address
         * and then we need to migrate the wallet to the new address with LUM V3 onwards,
         * we use a new salt here for easier testing.
         */
        address accountAddressWithNewSalt = licensedUserManager.deploy(
            "new_salt1",
            licensedUser1Address
        );
        address manager = LicensedUserWallet(accountAddressWithNewSalt)
            .licensedUserManagerAddress();
        assertEq(
            LicensedUserManagerV03(manager).getOwners(licensedUser1Address)[0],
            licensedUser1Owner
        );
        assertEq(
            LicensedUserManagerV03(manager).getOwners(
                accountAddressWithNewSalt
            )[0],
            licensedUser1Owner
        );
        assertEq(manager, address(licensedUserManager));
        vm.stopPrank();
    }

    function testCreateAndDeploy() public {
        address owner = vm.addr(0x1414);
        address[] memory owners = new address[](1);
        owners[0] = owner;
        LicensedUserManagerV03.LicensedUserDto
            memory licensedUserDto = LicensedUserManagerV03.LicensedUserDto({
                owners: owners,
                threshold: 1,
                userType: LicensedUserManagerV03.UserType.HANDLER,
                englishName: "English Name",
                originalName: "Original Name"
            });
        vm.expectEmit(false, false, false, true);
        emit DeployLicensedUserWallet(address(0), "very_random_salt"); // computing the address before the execution is possible but not worth the effort for now
        vm.prank(admin);
        address luwAddress = licensedUserManager.createAndDeploy(
            licensedUserDto,
            "very_random_salt"
        );
        assertEq(
            LicensedUserManagerV03(
                LicensedUserWallet(luwAddress).licensedUserManagerAddress()
            ).getOwners(luwAddress)[0],
            owner
        );
        assertEq(
            LicensedUserWallet(luwAddress).licensedUserManagerAddress(),
            address(licensedUserManager)
        );
    }

    function testWalletAddressGivenAlias() public {
        address walletAddress = licensedUserManager.walletAddressGivenAlias(
            licensedUser1Address
        );
        assertEq(walletAddress, licensedUser1Address); // no alias

        vm.prank(admin);
        address newWalletAddress = licensedUserManager.deploy(
            "very_random_salt",
            licensedUser1Address
        );
        assertEq(
            licensedUserManager.walletAddressGivenAlias(licensedUser1Address),
            newWalletAddress
        );
        assertEq(
            licensedUserManager.walletAddressAliasBackward(newWalletAddress),
            licensedUser1Address
        );
    }

    function testInvalidCreateWallet() public {
        vm.expectRevert("Invalid owner address");
        address[] memory invalidOwners = new address[](1);
        invalidOwners[0] = address(0);
        createLicensedUser(
            invalidOwners,
            1,
            LicensedUserManagerV03.UserType.HANDLER,
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
            LicensedUserManagerV03.UserType.HANDLER,
            "",
            "Original Name",
            "englishNameIsEmpty"
        );

        vm.expectRevert("originalName must not be empty");
        createLicensedUser(
            owners,
            1,
            LicensedUserManagerV03.UserType.HANDLER,
            "English Name",
            "",
            "originalNameIsEmpty"
        );
    }

    /**
     * @dev onlyWalletOrAdministrator is updated in OwnerManagerV02 and it allows to update LUM from deployed LUW.
     */
    function testUpdateLicensedUserfromDeployedWallet() public {
        vm.prank(admin);
        address accountAddressWithSalt1 = licensedUserManager.deploy(
            "salt1",
            licensedUser1Address
        );

        // Call setOriginalName in LicensedUserManagerV03 from licensedUser1Address
        vm.prank(licensedUser1Address);
        licensedUserManager.setOriginalName(
            accountAddressWithSalt1,
            "New Original Name"
        );

        // assert it's updated
        vm.prank(licensedUser1Address);
        (, , , , , string memory originalName) = licensedUserManager
            .getLicensedUser(accountAddressWithSalt1);
        assertEq(originalName, "New Original Name");
    }
}
