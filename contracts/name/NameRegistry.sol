// SPDX-License-Identifier: GPL-3.0-only

pragma solidity 0.8.28;

import "../proxy/utils/InitializableWithGap.sol";
import "../common/INameRegistry.sol";
import "./Contracts.sol";

contract NameRegistry is InitializableWithGap, INameRegistry, Contracts {
    /*
     * Modifiers
     */

    modifier onlyAdministrator() {
        require(
            this.administrator() == msg.sender,
            "The sender is not the Administrator"
        );
        _;
    }

    /*
     * Storages
     */
    mapping(uint8 => address) private _addressStorage;

    /*
     * Public Functions
     */

    /**
     * @dev Initializes the contract setting the administrator
     */
    function initialize(address _administrator) public initializer {
        _addressStorage[Contracts.ADMINISTRATOR] = _administrator;
    }

    /**
     * @dev Sets the name as an address you want to conbine with
     * @param key string of the name
     * @param value address you want to register
     */
    function set(uint8 key, address value)
        external
        override
        onlyAdministrator
    {
        _addressStorage[key] = value;
    }

    /**
     * @dev Gets the address associated with the key name
     * @return address
     */
    function get(uint8 key)
        external
        view
        override
        returns (address)
    {
        return _addressStorage[key];
    }

    /**
     * @dev Gets the Startrail administrator address
     * @return address
     */
    function administrator()
        external
        view
        override
        returns (address)
    {
        return this.get(Contracts.ADMINISTRATOR);
    }
}
