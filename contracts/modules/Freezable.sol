// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";

abstract contract Freezable is AccessControlUpgradeable {
    error AccountIsFrozen(address account);

    mapping(address => bool) internal frozenAccounts;

    event AccountFrozen(address indexed account);
    event AccountUnfrozen(address indexed account);

    bytes32 public constant FREEZER_ROLE = keccak256("FREEZER_ROLE");

    modifier notFrozen(address account) {
        if (frozenAccounts[account]) revert AccountIsFrozen(account);
        _;
    }

    function __Freezable_init() internal onlyInitializing {
        _grantRole(FREEZER_ROLE, _msgSender());
    }

    function freezeAccount(address account) external onlyRole(FREEZER_ROLE) {
        frozenAccounts[account] = true;
        emit AccountFrozen(account);
    }

    function unfreezeAccount(address account) external onlyRole(FREEZER_ROLE) {
        frozenAccounts[account] = false;
        emit AccountUnfrozen(account);
    }

    function isFrozen(address account) public view returns (bool) {
        return frozenAccounts[account];
    }
}
