// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity 0.8.13;

import "./ERC721TokenReceiver.sol";
import "./LibERC721Events.sol";
import "./LibERC721Storage.sol";

/// @notice A forked version of Solmate ERC721 that uses a storage struct for use in a Diamond or similar proxy pattern.
/// @author Modified from Solmate (https://github.com/transmissions11/solmate/blob/main/src/tokens/ERC721.sol)
abstract contract ERC721UpgradeableBase {
    /*//////////////////////////////////////////////////////////////
                         METADATA STORAGE/LOGIC
    //////////////////////////////////////////////////////////////*/

    function name() external view returns (string memory) {
        return LibERC721Storage.layout().name;
    }

    function symbol() external view returns (string memory) {
        return LibERC721Storage.layout().symbol;
    }

    /*//////////////////////////////////////////////////////////////
                      ERC721 BALANCE/OWNER STORAGE
    //////////////////////////////////////////////////////////////*/

    function ownerOf(uint256 id) public view virtual returns (address owner) {
        require(
            (owner = LibERC721Storage.layout().ownerOf[id]) != address(0),
            "NOT_MINTED"
        );
    }

    function balanceOf(address owner) public view virtual returns (uint256) {
        require(owner != address(0), "ZERO_ADDRESS");

        return LibERC721Storage.layout().balanceOf[owner];
    }

    /*//////////////////////////////////////////////////////////////
                         ERC721 APPROVAL GETTERS
    //////////////////////////////////////////////////////////////*/

    function getApproved(uint256 tokenId) public view returns (address) {
        return LibERC721Storage.layout().getApproved[tokenId];
    }

    function isApprovedForAll(
        address owner,
        address operator
    ) public view returns (bool) {
        return LibERC721Storage.layout().isApprovedForAll[owner][operator];
    }

    /*//////////////////////////////////////////////////////////////
                               INITIALIZER
    //////////////////////////////////////////////////////////////*/

    function __ERC721_init(
        string memory _name,
        string memory _symbol
    ) internal {
        LibERC721Storage.Layout storage layout = LibERC721Storage.layout();
        layout.name = _name;
        layout.symbol = _symbol;
    }

    /*//////////////////////////////////////////////////////////////
                              ERC721 LOGIC
    //////////////////////////////////////////////////////////////*/

    function approve(address spender, uint256 id) public virtual {
        LibERC721Storage.Layout storage layout = LibERC721Storage.layout();

        address owner = layout.ownerOf[id];

        require(
            msg.sender == owner || layout.isApprovedForAll[owner][msg.sender],
            "NOT_AUTHORIZED"
        );

        layout.getApproved[id] = spender;

        emit LibERC721Events.Approval(owner, spender, id);
    }

    function setApprovalForAll(address operator, bool approved) public virtual {
        LibERC721Storage.layout().isApprovedForAll[msg.sender][
            operator
        ] = approved;

        emit LibERC721Events.ApprovalForAll(msg.sender, operator, approved);
    }

    function transferFrom(address from, address to, uint256 id) public virtual {
        LibERC721Storage.Layout storage layout = LibERC721Storage.layout();

        require(from == layout.ownerOf[id], "WRONG_FROM");

        require(to != address(0), "INVALID_RECIPIENT");

        require(
            msg.sender == from ||
                layout.isApprovedForAll[from][msg.sender] ||
                msg.sender == layout.getApproved[id],
            "NOT_AUTHORIZED"
        );

        LibERC721Storage._transferFrom(from, to, id);
    }

    function safeTransferFrom(
        address from,
        address to,
        uint256 id
    ) public virtual {
        transferFrom(from, to, id);
        safeTransferFromReceivedCheck(msg.sender, from, to, id, "");
    }

    function safeTransferFrom(
        address from,
        address to,
        uint256 id,
        bytes calldata data
    ) public virtual {
        transferFrom(from, to, id);
        safeTransferFromReceivedCheck(msg.sender, from, to, id, data);
    }

    function safeTransferFromReceivedCheck(
        address operator,
        address from,
        address to,
        uint256 id,
        bytes memory data
    ) internal {
        require(
            to.code.length == 0 ||
                ERC721TokenReceiver(to).onERC721Received(
                    operator,
                    from,
                    id,
                    data
                ) ==
                ERC721TokenReceiver.onERC721Received.selector,
            "UNSAFE_RECIPIENT"
        );
    }

    /*//////////////////////////////////////////////////////////////
                              ERC165 LOGIC
    //////////////////////////////////////////////////////////////*/

    function supportsInterface(
        bytes4 interfaceId
    ) external view virtual returns (bool) {
        return
            interfaceId == 0x01ffc9a7 || // ERC165 Interface ID for ERC165
            interfaceId == 0x80ac58cd || // ERC165 Interface ID for ERC721
            interfaceId == 0x5b5e139f; // ERC165 Interface ID for ERC721Metadata
    }
}
