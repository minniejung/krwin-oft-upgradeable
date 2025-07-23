// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";

abstract contract Freezable is AccessControlUpgradeable {
    bytes32 public constant FREEZER_ROLE = keccak256("FREEZER_ROLE");

    mapping(address => bool) internal frozen;

    event AccountFrozen(address indexed account);
    event AccountUnfrozen(address indexed account);

    function __Freezable_init() internal onlyInitializing {
        _grantRole(FREEZER_ROLE, _msgSender());
    }

    function freeze(address account) external onlyRole(FREEZER_ROLE) {
        frozen[account] = true;
        emit AccountFrozen(account);
    }

    function unfreeze(address account) external onlyRole(FREEZER_ROLE) {
        frozen[account] = false;
        emit AccountUnfrozen(account);
    }

    function isFrozen(address account) public view returns (bool) {
        return frozen[account];
    }
}
