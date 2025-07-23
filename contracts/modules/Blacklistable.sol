// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";

abstract contract Blacklistable is AccessControlUpgradeable {
    error AccountBlacklisted(address account);

    event Blacklisted(address indexed account);
    event UnBlacklisted(address indexed account);

    bytes32 public constant BLACKLISTER_ROLE = keccak256("BLACKLISTER_ROLE");

    mapping(address => bool) internal _blacklisted;

    modifier notBlacklisted(address account) {
        if (_blacklisted[account]) revert AccountBlacklisted(account);
        _;
    }

    function __Blacklistable_init() internal onlyInitializing {
        _grantRole(BLACKLISTER_ROLE, _msgSender());
    }

    function blacklist(address account) external onlyRole(BLACKLISTER_ROLE) {
        _blacklisted[account] = true;
        emit Blacklisted(account);
    }

    function unblacklist(address account) external onlyRole(BLACKLISTER_ROLE) {
        _blacklisted[account] = false;
        emit UnBlacklisted(account);
    }

    function isBlacklisted(address account) public view returns (bool) {
        return _blacklisted[account];
    }
}
