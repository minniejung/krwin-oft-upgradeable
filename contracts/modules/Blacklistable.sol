// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";

abstract contract Blacklistable is AccessControlUpgradeable {
    error AccountIsBlacklisted(address account);

    mapping(address => bool) internal blacklistedAccounts;

    event AccountBlacklisted(address indexed account);
    event AccountUnblacklisted(address indexed account);

    bytes32 public constant BLACKLISTER_ROLE = keccak256("BLACKLISTER_ROLE");

    modifier notBlacklisted(address account) {
        if (blacklistedAccounts[account]) revert AccountIsBlacklisted(account);
        _;
    }

    function __Blacklistable_init() internal onlyInitializing {
        _grantRole(BLACKLISTER_ROLE, _msgSender());
    }

    function addToBlacklist(address account) external onlyRole(BLACKLISTER_ROLE) {
        blacklistedAccounts[account] = true;
        emit AccountBlacklisted(account);
    }

    function removeFromBlacklist(address account) external onlyRole(BLACKLISTER_ROLE) {
        blacklistedAccounts[account] = false;
        emit AccountUnblacklisted(account);
    }

    function isBlacklisted(address account) public view returns (bool) {
        return blacklistedAccounts[account];
    }
}
