// SPDX-License-Identifier: AGPL-3.0-only

pragma solidity 0.8.28;

import {Test} from "forge-std/Test.sol";

import "../../contracts/collection/features/erc721/test/MockERC721Upgradeable.sol";
import "../../contracts/collection/features/erc721/ERC721TokenReceiver.sol";

contract ERC721Recipient is ERC721TokenReceiver {
    address public operator;
    address public from;
    uint256 public id;
    bytes public data;

    function onERC721Received(
        address _operator,
        address _from,
        uint256 _id,
        bytes calldata _data
    ) public virtual override returns (bytes4) {
        operator = _operator;
        from = _from;
        id = _id;
        data = _data;

        return ERC721TokenReceiver.onERC721Received.selector;
    }
}

contract RevertingERC721Recipient is ERC721TokenReceiver {
    function onERC721Received(
        address,
        address,
        uint256,
        bytes calldata
    ) public virtual override returns (bytes4) {
        revert(
            string(
                abi.encodePacked(ERC721TokenReceiver.onERC721Received.selector)
            )
        );
    }
}

contract WrongReturnDataERC721Recipient is ERC721TokenReceiver {
    function onERC721Received(
        address,
        address,
        uint256,
        bytes calldata
    ) public virtual override returns (bytes4) {
        return 0xCAFEBEEF;
    }
}

contract NonERC721Recipient {}

contract ERC721UpgradeableBaseTest is Test {
    MockERC721Upgradeable token;

    function setUp() public {
        token = new MockERC721Upgradeable("Token", "TKN");
    }

    function invariantMetadata() public {
        assertEq(token.name(), "Token");
        assertEq(token.symbol(), "TKN");
    }

    function testMint() public {
        token.mint(address(0xBEEF), 1337);

        assertEq(token.balanceOf(address(0xBEEF)), 1);
        assertEq(token.ownerOf(1337), address(0xBEEF));
    }

    function testBurn() public {
        token.mint(address(0xBEEF), 1337);
        token.burn(1337);

        assertEq(token.balanceOf(address(0xBEEF)), 0);

        vm.expectRevert("NOT_MINTED");
        token.ownerOf(1337);
    }

    function testApprove() public {
        token.mint(address(this), 1337);

        token.approve(address(0xBEEF), 1337);

        assertEq(token.getApproved(1337), address(0xBEEF));
    }

    function testApproveBurn() public {
        token.mint(address(this), 1337);

        token.approve(address(0xBEEF), 1337);

        token.burn(1337);

        assertEq(token.balanceOf(address(this)), 0);
        assertEq(token.getApproved(1337), address(0));

        vm.expectRevert("NOT_MINTED");
        token.ownerOf(1337);
    }

    function testApproveAll() public {
        token.setApprovalForAll(address(0xBEEF), true);

        assertTrue(token.isApprovedForAll(address(this), address(0xBEEF)));
    }

    function testTransferFrom() public {
        address from = address(0xABCD);

        token.mint(from, 1337);

        vm.prank(from);
        token.approve(address(this), 1337);

        token.transferFrom(from, address(0xBEEF), 1337);

        assertEq(token.getApproved(1337), address(0));
        assertEq(token.ownerOf(1337), address(0xBEEF));
        assertEq(token.balanceOf(address(0xBEEF)), 1);
        assertEq(token.balanceOf(from), 0);
    }

    function testTransferFromSelf() public {
        token.mint(address(this), 1337);

        token.transferFrom(address(this), address(0xBEEF), 1337);

        assertEq(token.getApproved(1337), address(0));
        assertEq(token.ownerOf(1337), address(0xBEEF));
        assertEq(token.balanceOf(address(0xBEEF)), 1);
        assertEq(token.balanceOf(address(this)), 0);
    }

    function testTransferFromApproveAll() public {
        address from = address(0xABCD);

        token.mint(from, 1337);

        vm.prank(from);
        token.setApprovalForAll(address(this), true);

        token.transferFrom(from, address(0xBEEF), 1337);

        assertEq(token.getApproved(1337), address(0));
        assertEq(token.ownerOf(1337), address(0xBEEF));
        assertEq(token.balanceOf(address(0xBEEF)), 1);
        assertEq(token.balanceOf(from), 0);
    }

    function testSafeTransferFromToEOA() public {
        address from = address(0xABCD);

        token.mint(from, 1337);

        vm.prank(from);
        token.setApprovalForAll(address(this), true);

        token.safeTransferFrom(from, address(0xBEEF), 1337);

        assertEq(token.getApproved(1337), address(0));
        assertEq(token.ownerOf(1337), address(0xBEEF));
        assertEq(token.balanceOf(address(0xBEEF)), 1);
        assertEq(token.balanceOf(from), 0);
    }

    function testSafeTransferFromToERC721Recipient() public {
        address from = address(0xABCD);
        ERC721Recipient recipient = new ERC721Recipient();

        token.mint(from, 1337);

        vm.prank(from);
        token.setApprovalForAll(address(this), true);

        token.safeTransferFrom(from, address(recipient), 1337);

        assertEq(token.getApproved(1337), address(0));
        assertEq(token.ownerOf(1337), address(recipient));
        assertEq(token.balanceOf(address(recipient)), 1);
        assertEq(token.balanceOf(from), 0);

        assertEq(recipient.operator(), address(this));
        assertEq(recipient.from(), from);
        assertEq(recipient.id(), 1337);
        assertEq(recipient.data(), "");
    }

    function testSafeTransferFromToERC721RecipientWithData() public {
        address from = address(0xABCD);
        ERC721Recipient recipient = new ERC721Recipient();

        token.mint(from, 1337);

        vm.prank(from);
        token.setApprovalForAll(address(this), true);

        token.safeTransferFrom(from, address(recipient), 1337, "testing 123");

        assertEq(token.getApproved(1337), address(0));
        assertEq(token.ownerOf(1337), address(recipient));
        assertEq(token.balanceOf(address(recipient)), 1);
        assertEq(token.balanceOf(from), 0);

        assertEq(recipient.operator(), address(this));
        assertEq(recipient.from(), from);
        assertEq(recipient.id(), 1337);
        assertEq(recipient.data(), "testing 123");
    }

    function testSafeMintToEOA() public {
        token.safeMint(address(0xBEEF), 1337);

        assertEq(token.ownerOf(1337), address(address(0xBEEF)));
        assertEq(token.balanceOf(address(address(0xBEEF))), 1);
    }

    function testSafeMintToERC721Recipient() public {
        ERC721Recipient to = new ERC721Recipient();

        token.safeMint(address(to), 1337);

        assertEq(token.ownerOf(1337), address(to));
        assertEq(token.balanceOf(address(to)), 1);

        assertEq(to.operator(), address(this));
        assertEq(to.from(), address(0));
        assertEq(to.id(), 1337);
        assertEq(to.data(), "");
    }

    function testSafeMintToERC721RecipientWithData() public {
        ERC721Recipient to = new ERC721Recipient();

        token.safeMint(address(to), 1337, "testing 123");

        assertEq(token.ownerOf(1337), address(to));
        assertEq(token.balanceOf(address(to)), 1);

        assertEq(to.operator(), address(this));
        assertEq(to.from(), address(0));
        assertEq(to.id(), 1337);
        assertEq(to.data(), "testing 123");
    }

    function test_RevertWhen_MintToZero() public {
        vm.expectRevert("INVALID_RECIPIENT");
        token.mint(address(0), 1337);
    }

    function test_RevertWhen_DoubleMint() public {
        token.mint(address(0xBEEF), 1337);
        vm.expectRevert("ALREADY_MINTED");
        token.mint(address(0xBEEF), 1337);
    }

    function test_RevertWhen_BurnUnMinted() public {
        vm.expectRevert("NOT_MINTED");
        token.burn(1337);
    }

    function test_RevertWhen_DoubleBurn() public {
        token.mint(address(0xBEEF), 1337);

        token.burn(1337);
        vm.expectRevert("NOT_MINTED");
        token.burn(1337);
    }

    function test_RevertWhen_ApproveUnMinted() public {
        vm.expectRevert("NOT_AUTHORIZED");
        token.approve(address(0xBEEF), 1337);
    }

    function test_RevertWhen_ApproveUnAuthorized() public {
        token.mint(address(0xCAFE), 1337);

        vm.expectRevert("NOT_AUTHORIZED");
        token.approve(address(0xBEEF), 1337);
    }

    function test_RevertWhen_TransferFromUnOwned() public {
        vm.expectRevert("WRONG_FROM");
        token.transferFrom(address(0xFEED), address(0xBEEF), 1337);
    }

    function test_RevertWhen_TransferFromWrongFrom() public {
        token.mint(address(0xCAFE), 1337);

        vm.expectRevert("WRONG_FROM");
        token.transferFrom(address(0xFEED), address(0xBEEF), 1337);
    }

    function test_RevertWhen_TransferFromToZero() public {
        token.mint(address(this), 1337);

        vm.expectRevert("INVALID_RECIPIENT");
        token.transferFrom(address(this), address(0), 1337);
    }

    function test_RevertWhen_TransferFromNotOwner() public {
        token.mint(address(0xFEED), 1337);

        vm.expectRevert("NOT_AUTHORIZED");
        token.transferFrom(address(0xFEED), address(0xBEEF), 1337);
    }

    function test_RevertWhen_SafeTransferFromToNonERC721Recipient() public {
        token.mint(address(this), 1337);

        NonERC721Recipient recipient = new NonERC721Recipient();
        vm.expectRevert();
        token.safeTransferFrom(address(this), address(recipient), 1337);
    }

    function test_RevertWhen_SafeTransferFromToNonERC721RecipientWithData()
        public
    {
        token.mint(address(this), 1337);

        NonERC721Recipient recipient = new NonERC721Recipient();
        vm.expectRevert();
        token.safeTransferFrom(
            address(this),
            address(recipient),
            1337,
            "testing 123"
        );
    }

    function test_RevertWhen_SafeTransferFromToRevertingERC721Recipient()
        public
    {
        token.mint(address(this), 1337);

        RevertingERC721Recipient recipient = new RevertingERC721Recipient();
        vm.expectRevert();
        token.safeTransferFrom(address(this), address(recipient), 1337);
    }

    function test_RevertWhen_SafeTransferFromToRevertingERC721RecipientWithData()
        public
    {
        token.mint(address(this), 1337);

        RevertingERC721Recipient recipient = new RevertingERC721Recipient();
        vm.expectRevert();
        token.safeTransferFrom(
            address(this),
            address(recipient),
            1337,
            "testing 123"
        );
    }

    function test_RevertWhen_SafeTransferFromToERC721RecipientWithWrongReturnData()
        public
    {
        token.mint(address(this), 1337);

        WrongReturnDataERC721Recipient recipient = new WrongReturnDataERC721Recipient();
        vm.expectRevert("UNSAFE_RECIPIENT");
        token.safeTransferFrom(address(this), address(recipient), 1337);
    }

    function test_RevertWhen_SafeTransferFromToERC721RecipientWithWrongReturnDataWithData()
        public
    {
        token.mint(address(this), 1337);

        WrongReturnDataERC721Recipient recipient = new WrongReturnDataERC721Recipient();
        vm.expectRevert("UNSAFE_RECIPIENT");
        token.safeTransferFrom(
            address(this),
            address(recipient),
            1337,
            "testing 123"
        );
    }

    function test_RevertWhen_SafeMintToNonERC721Recipient() public {
        NonERC721Recipient recipient = new NonERC721Recipient();
        vm.expectRevert();
        token.safeMint(address(recipient), 1337);
    }

    function test_RevertWhen_SafeMintToNonERC721RecipientWithData() public {
        NonERC721Recipient recipient = new NonERC721Recipient();
        vm.expectRevert();
        token.safeMint(address(recipient), 1337, "testing 123");
    }

    function test_RevertWhen_SafeMintToRevertingERC721Recipient() public {
        RevertingERC721Recipient recipient = new RevertingERC721Recipient();
        vm.expectRevert();
        token.safeMint(address(recipient), 1337);
    }

    function test_RevertWhen_SafeMintToRevertingERC721RecipientWithData()
        public
    {
        RevertingERC721Recipient recipient = new RevertingERC721Recipient();
        vm.expectRevert();
        token.safeMint(address(recipient), 1337, "testing 123");
    }

    function test_RevertWhen_SafeMintToERC721RecipientWithWrongReturnData()
        public
    {
        WrongReturnDataERC721Recipient recipient = new WrongReturnDataERC721Recipient();
        vm.expectRevert("UNSAFE_RECIPIENT");
        token.safeMint(address(recipient), 1337);
    }

    function test_RevertWhen_SafeMintToERC721RecipientWithWrongReturnDataWithData()
        public
    {
        WrongReturnDataERC721Recipient recipient = new WrongReturnDataERC721Recipient();
        vm.expectRevert("UNSAFE_RECIPIENT");
        token.safeMint(address(recipient), 1337, "testing 123");
    }

    function test_RevertWhen_BalanceOfZeroAddress() public {
        vm.expectRevert("ZERO_ADDRESS");
        token.balanceOf(address(0));
    }

    function test_RevertWhen_OwnerOfUnminted() public {
        vm.expectRevert("NOT_MINTED");
        token.ownerOf(1337);
    }

    function testMetadata(string memory name, string memory symbol) public {
        MockERC721Upgradeable tkn = new MockERC721Upgradeable(name, symbol);

        assertEq(tkn.name(), name);
        assertEq(tkn.symbol(), symbol);
    }

    function testMint(address to, uint256 id) public {
        if (to == address(0)) to = address(0xBEEF);

        token.mint(to, id);

        assertEq(token.balanceOf(to), 1);
        assertEq(token.ownerOf(id), to);
    }

    function testBurn(address to, uint256 id) public {
        if (to == address(0)) to = address(0xBEEF);

        token.mint(to, id);
        token.burn(id);

        assertEq(token.balanceOf(to), 0);

        vm.expectRevert("NOT_MINTED");
        token.ownerOf(id);
    }

    function testApprove(address to, uint256 id) public {
        if (to == address(0)) to = address(0xBEEF);

        token.mint(address(this), id);

        token.approve(to, id);

        assertEq(token.getApproved(id), to);
    }

    function testApproveBurn(address to, uint256 id) public {
        token.mint(address(this), id);

        token.approve(address(to), id);

        token.burn(id);

        assertEq(token.balanceOf(address(this)), 0);
        assertEq(token.getApproved(id), address(0));

        vm.expectRevert("NOT_MINTED");
        token.ownerOf(id);
    }

    function testApproveAll(address to, bool approved) public {
        token.setApprovalForAll(to, approved);

        assertEq(token.isApprovedForAll(address(this), to), approved);
    }

    function testTransferFrom(uint256 id, address to) public {
        address from = address(0xABCD);

        if (to == address(0) || to == from) to = address(0xBEEF);

        token.mint(from, id);

        vm.prank(from);
        token.approve(address(this), id);

        token.transferFrom(from, to, id);

        assertEq(token.getApproved(id), address(0));
        assertEq(token.ownerOf(id), to);
        assertEq(token.balanceOf(to), 1);
        assertEq(token.balanceOf(from), 0);
    }

    function testTransferFromSelf(uint256 id, address to) public {
        if (to == address(0) || to == address(this)) to = address(0xBEEF);

        token.mint(address(this), id);

        token.transferFrom(address(this), to, id);

        assertEq(token.getApproved(id), address(0));
        assertEq(token.ownerOf(id), to);
        assertEq(token.balanceOf(to), 1);
        assertEq(token.balanceOf(address(this)), 0);
    }

    function testTransferFromApproveAll(uint256 id, address to) public {
        address from = address(0xABCD);

        if (to == address(0) || to == from) to = address(0xBEEF);

        token.mint(from, id);

        vm.prank(from);
        token.setApprovalForAll(address(this), true);

        token.transferFrom(from, to, id);

        assertEq(token.getApproved(id), address(0));
        assertEq(token.ownerOf(id), to);
        assertEq(token.balanceOf(to), 1);
        assertEq(token.balanceOf(from), 0);
    }

    function testSafeTransferFromToEOA(uint256 id, address to) public {
        address from = address(0xABCD);

        if (to == address(0) || to == from) to = address(0xBEEF);

        if (uint256(uint160(to)) <= 18 || to.code.length > 0) return;

        token.mint(from, id);

        vm.prank(from);
        token.setApprovalForAll(address(this), true);

        token.safeTransferFrom(from, to, id);

        assertEq(token.getApproved(id), address(0));
        assertEq(token.ownerOf(id), to);
        assertEq(token.balanceOf(to), 1);
        assertEq(token.balanceOf(from), 0);
    }

    function testSafeTransferFromToERC721Recipient(uint256 id) public {
        address from = address(0xABCD);

        ERC721Recipient recipient = new ERC721Recipient();

        token.mint(from, id);

        vm.prank(from);
        token.setApprovalForAll(address(this), true);

        token.safeTransferFrom(from, address(recipient), id);

        assertEq(token.getApproved(id), address(0));
        assertEq(token.ownerOf(id), address(recipient));
        assertEq(token.balanceOf(address(recipient)), 1);
        assertEq(token.balanceOf(from), 0);

        assertEq(recipient.operator(), address(this));
        assertEq(recipient.from(), from);
        assertEq(recipient.id(), id);
        assertEq(recipient.data(), "");
    }

    function testSafeTransferFromToERC721RecipientWithData(
        uint256 id,
        bytes calldata data
    ) public {
        address from = address(0xABCD);
        ERC721Recipient recipient = new ERC721Recipient();

        token.mint(from, id);

        vm.prank(from);
        token.setApprovalForAll(address(this), true);

        token.safeTransferFrom(from, address(recipient), id, data);

        assertEq(token.getApproved(id), address(0));
        assertEq(token.ownerOf(id), address(recipient));
        assertEq(token.balanceOf(address(recipient)), 1);
        assertEq(token.balanceOf(from), 0);

        assertEq(recipient.operator(), address(this));
        assertEq(recipient.from(), from);
        assertEq(recipient.id(), id);
        assertEq(recipient.data(), data);
    }

    function testSafeMintToEOA(uint256 id, address to) public {
        if (to == address(0)) to = address(0xBEEF);

        if (uint256(uint160(to)) <= 18 || to.code.length > 0) return;

        token.safeMint(to, id);

        assertEq(token.ownerOf(id), address(to));
        assertEq(token.balanceOf(address(to)), 1);
    }

    function testSafeMintToERC721Recipient(uint256 id) public {
        ERC721Recipient to = new ERC721Recipient();

        token.safeMint(address(to), id);

        assertEq(token.ownerOf(id), address(to));
        assertEq(token.balanceOf(address(to)), 1);

        assertEq(to.operator(), address(this));
        assertEq(to.from(), address(0));
        assertEq(to.id(), id);
        assertEq(to.data(), "");
    }

    function testSafeMintToERC721RecipientWithData(
        uint256 id,
        bytes calldata data
    ) public {
        ERC721Recipient to = new ERC721Recipient();

        token.safeMint(address(to), id, data);

        assertEq(token.ownerOf(id), address(to));
        assertEq(token.balanceOf(address(to)), 1);

        assertEq(to.operator(), address(this));
        assertEq(to.from(), address(0));
        assertEq(to.id(), id);
        assertEq(to.data(), data);
    }

    function test_RevertWhen_MintToZero(uint256 id) public {
        vm.expectRevert("INVALID_RECIPIENT");
        token.mint(address(0), id);
    }

    function test_RevertWhen_DoubleMint(uint256 id, address to) public {
        if (to == address(0)) to = address(0xBEEF);

        token.mint(to, id);
        vm.expectRevert("ALREADY_MINTED");
        token.mint(to, id);
    }

    function test_RevertWhen_BurnUnMinted(uint256 id) public {
        vm.expectRevert("NOT_MINTED");
        token.burn(id);
    }

    function test_RevertWhen_DoubleBurn(uint256 id, address to) public {
        if (to == address(0)) to = address(0xBEEF);

        token.mint(to, id);

        token.burn(id);
        vm.expectRevert("NOT_MINTED");
        token.burn(id);
    }

    function test_RevertWhen_ApproveUnMinted(uint256 id, address to) public {
        vm.expectRevert("NOT_AUTHORIZED");
        token.approve(to, id);
    }

    function test_RevertWhen_ApproveUnAuthorized(
        address owner,
        uint256 id,
        address to
    ) public {
        if (owner == address(0) || owner == address(this))
            owner = address(0xBEEF);

        token.mint(owner, id);

        vm.expectRevert("NOT_AUTHORIZED");
        token.approve(to, id);
    }

    function test_RevertWhen_TransferFromUnOwned(
        address from,
        address to,
        uint256 id
    ) public {
        if (from == address(0)) from = address(0xBEEF);

        vm.expectRevert("WRONG_FROM");
        token.transferFrom(from, to, id);
    }

    function test_RevertWhen_TransferFromWrongFrom(
        address owner,
        address from,
        address to,
        uint256 id
    ) public {
        if (owner == address(0)) owner = address(0xBEEF);
        if (from == owner) from = address(uint160(owner) + 1); // ensure from is different from owner

        token.mint(owner, id);

        vm.expectRevert("WRONG_FROM");
        token.transferFrom(from, to, id);
    }

    function test_RevertWhen_TransferFromToZero(uint256 id) public {
        token.mint(address(this), id);

        vm.expectRevert("INVALID_RECIPIENT");
        token.transferFrom(address(this), address(0), id);
    }

    function test_RevertWhen_TransferFromNotOwner(
        address from,
        address to,
        uint256 id
    ) public {
        if (from == address(this) || from == address(0)) from = address(0xBEEF);
        if (to == address(0)) to = address(0xCAFE);

        token.mint(from, id);

        vm.expectRevert("NOT_AUTHORIZED");
        token.transferFrom(from, to, id);
    }

    function test_RevertWhen_SafeTransferFromToNonERC721Recipient(
        uint256 id
    ) public {
        token.mint(address(this), id);

        NonERC721Recipient recipient = new NonERC721Recipient();
        vm.expectRevert();
        token.safeTransferFrom(address(this), address(recipient), id);
    }

    function test_RevertWhen_SafeTransferFromToNonERC721RecipientWithData(
        uint256 id,
        bytes calldata data
    ) public {
        token.mint(address(this), id);

        NonERC721Recipient recipient = new NonERC721Recipient();
        vm.expectRevert();
        token.safeTransferFrom(address(this), address(recipient), id, data);
    }

    function test_RevertWhen_SafeTransferFromToRevertingERC721Recipient(
        uint256 id
    ) public {
        token.mint(address(this), id);

        RevertingERC721Recipient recipient = new RevertingERC721Recipient();
        vm.expectRevert();
        token.safeTransferFrom(address(this), address(recipient), id);
    }

    function test_RevertWhen_SafeTransferFromToRevertingERC721RecipientWithData(
        uint256 id,
        bytes calldata data
    ) public {
        token.mint(address(this), id);

        RevertingERC721Recipient recipient = new RevertingERC721Recipient();
        vm.expectRevert();
        token.safeTransferFrom(address(this), address(recipient), id, data);
    }

    function test_RevertWhen_SafeTransferFromToERC721RecipientWithWrongReturnData(
        uint256 id
    ) public {
        token.mint(address(this), id);

        WrongReturnDataERC721Recipient recipient = new WrongReturnDataERC721Recipient();
        vm.expectRevert("UNSAFE_RECIPIENT");
        token.safeTransferFrom(address(this), address(recipient), id);
    }

    function test_RevertWhen_SafeTransferFromToERC721RecipientWithWrongReturnDataWithData(
        uint256 id,
        bytes calldata data
    ) public {
        token.mint(address(this), id);

        WrongReturnDataERC721Recipient recipient = new WrongReturnDataERC721Recipient();
        vm.expectRevert("UNSAFE_RECIPIENT");
        token.safeTransferFrom(address(this), address(recipient), id, data);
    }

    function test_RevertWhen_SafeMintToNonERC721Recipient(uint256 id) public {
        NonERC721Recipient recipient = new NonERC721Recipient();
        vm.expectRevert();
        token.safeMint(address(recipient), id);
    }

    function test_RevertWhen_SafeMintToNonERC721RecipientWithData(
        uint256 id,
        bytes calldata data
    ) public {
        NonERC721Recipient recipient = new NonERC721Recipient();
        vm.expectRevert();
        token.safeMint(address(recipient), id, data);
    }

    function test_RevertWhen_SafeMintToRevertingERC721Recipient(
        uint256 id
    ) public {
        RevertingERC721Recipient recipient = new RevertingERC721Recipient();
        vm.expectRevert();
        token.safeMint(address(recipient), id);
    }

    function test_RevertWhen_SafeMintToRevertingERC721RecipientWithData(
        uint256 id,
        bytes calldata data
    ) public {
        RevertingERC721Recipient recipient = new RevertingERC721Recipient();
        vm.expectRevert();
        token.safeMint(address(recipient), id, data);
    }

    function test_RevertWhen_SafeMintToERC721RecipientWithWrongReturnData(
        uint256 id
    ) public {
        WrongReturnDataERC721Recipient recipient = new WrongReturnDataERC721Recipient();
        vm.expectRevert("UNSAFE_RECIPIENT");
        token.safeMint(address(recipient), id);
    }

    function test_RevertWhen_SafeMintToERC721RecipientWithWrongReturnDataWithData(
        uint256 id,
        bytes calldata data
    ) public {
        WrongReturnDataERC721Recipient recipient = new WrongReturnDataERC721Recipient();
        vm.expectRevert("UNSAFE_RECIPIENT");
        token.safeMint(address(recipient), id, data);
    }

    function test_RevertWhen_OwnerOfUnminted(uint256 id) public {
        vm.expectRevert("NOT_MINTED");
        token.ownerOf(id);
    }
}
