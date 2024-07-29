pragma solidity 0.8.21;

import "forge-std/Vm.sol";
import {Test} from "forge-std/Test.sol";

import "../../contracts/collection/CollectionProxy.sol";

/*
 * Most testing of the Proxy happens in the CollectionFactory.t.sol
 * and the various *Feature.t.sol contracts.
 *
 * Here we just check the initializer can't be called twice.
 */
contract CollectionProxyTest is Test {
    function testRevert_AlreadyInitialized() public {
        CollectionProxy cp = new CollectionProxy();
        cp.__CollectionProxy_initialize(address(0x1));
        vm.expectRevert(CollectionProxyAlreadyInitialized.selector);
        cp.__CollectionProxy_initialize(address(0x1));
    }
}
