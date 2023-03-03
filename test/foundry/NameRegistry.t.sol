pragma solidity 0.8.13;

import "forge-std/Test.sol";

import "../../contracts/name/NameRegistry.sol";
import "../../contracts/name/Contracts.sol";

contract NameRegistryTest is Test, Contracts {
    address administrator;
    
    address startrailRegistryMockAddress = vm.addr(0x1111);

    NameRegistry nameRegistry;

    function setUp() public {
        // get EOA for private key '0xa'
        administrator = vm.addr(0xa);
        nameRegistry = new NameRegistry();
        nameRegistry.initialize(administrator);
    }

    function testInitialized() public {
        assertEq(nameRegistry.administrator(), administrator);
    }

    function testRevert_AlreadyInitialized() public {
        vm.expectRevert(bytes("Initializable: contract is already initialized"));
        nameRegistry.initialize(administrator);
    }

    function testSetAddress() public {
        vm.prank(administrator);
        nameRegistry.set(Contracts.STARTRAIL_REGISTRY, startrailRegistryMockAddress);
        assertEq(nameRegistry.get(Contracts.STARTRAIL_REGISTRY), startrailRegistryMockAddress);
    }

    function testRevert_SetNotAdmiistrator() public {
        vm.expectRevert(bytes("The sender is not the Administrator"));
        nameRegistry.set(Contracts.STARTRAIL_REGISTRY, startrailRegistryMockAddress);
    }


}