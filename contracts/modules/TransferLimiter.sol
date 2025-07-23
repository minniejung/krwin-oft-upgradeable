// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import { TransferLimit } from "contracts/types/TransferLimitTypes.sol";

abstract contract TransferLimiter {
    error TransferLimitExceeded();
    error TransferLimitNotSet();

    event TransferLimitConfigured(uint32 indexed dstEid, TransferLimit config);
    event TransferLimitChecked(uint32 indexed dstEid, address indexed user, uint256 amount, bool success);
    event TransferLimitViolated(uint32 indexed dstEid, address indexed user, string reason);

    mapping(uint32 => TransferLimit) public transferLimitConfigs;
    mapping(uint32 => uint256) public dailyTransferAmount;
    mapping(uint32 => uint256) public lastUpdatedTime;
    mapping(uint32 => mapping(address => uint256)) public userDailyTransferAmount;
    mapping(uint32 => mapping(address => uint256)) public userDailyAttempt;
    mapping(uint32 => mapping(address => uint256)) public lastUserUpdatedTime;

    function _setTransferLimitConfigs(TransferLimit[] memory configs) internal {
        for (uint256 i = 0; i < configs.length; i++) {
            transferLimitConfigs[configs[i].dstEid] = configs[i];
            emit TransferLimitConfigured(configs[i].dstEid, configs[i]);
        }
    }

    function _checkAndUpdateTransferLimit(uint32 dstEid, uint256 amount, address user) internal {
        TransferLimit storage limit = transferLimitConfigs[dstEid];
        if (limit.dstEid == 0) revert TransferLimitNotSet();

        _resetIfNeeded(dstEid, user);

        if (amount < limit.singleTransferLowerLimit) {
            emit TransferLimitViolated(dstEid, user, "below lower limit");
            revert TransferLimitExceeded();
        }
        if (amount > limit.singleTransferUpperLimit) {
            emit TransferLimitViolated(dstEid, user, "above upper limit");
            revert TransferLimitExceeded();
        }
        if (dailyTransferAmount[dstEid] + amount > limit.maxDailyTransferAmount) {
            emit TransferLimitViolated(dstEid, user, "global daily exceeded");
            revert TransferLimitExceeded();
        }
        if (userDailyTransferAmount[dstEid][user] + amount > limit.dailyTransferAmountPerAddress) {
            emit TransferLimitViolated(dstEid, user, "user daily exceeded");
            revert TransferLimitExceeded();
        }
        if (userDailyAttempt[dstEid][user] >= limit.dailyTransferAttemptPerAddress) {
            emit TransferLimitViolated(dstEid, user, "user attempt exceeded");
            revert TransferLimitExceeded();
        }

        dailyTransferAmount[dstEid] += amount;
        userDailyTransferAmount[dstEid][user] += amount;
        userDailyAttempt[dstEid][user] += 1;

        emit TransferLimitChecked(dstEid, user, amount, true);
    }

    function isTransferAllowed(uint32 dstEid, uint256 amount, address user) public view returns (bool) {
        TransferLimit memory limit = transferLimitConfigs[dstEid];
        if (limit.dstEid == 0) return false;

        bool resetGlobal = block.timestamp - lastUpdatedTime[dstEid] >= 1 days;
        bool resetUser = block.timestamp - lastUserUpdatedTime[dstEid][user] >= 1 days;

        uint256 globalAmount = resetGlobal ? 0 : dailyTransferAmount[dstEid];
        uint256 userAmount = resetUser ? 0 : userDailyTransferAmount[dstEid][user];
        uint256 userTries = resetUser ? 0 : userDailyAttempt[dstEid][user];

        return (amount >= limit.singleTransferLowerLimit &&
            amount <= limit.singleTransferUpperLimit &&
            globalAmount + amount <= limit.maxDailyTransferAmount &&
            userAmount + amount <= limit.dailyTransferAmountPerAddress &&
            userTries < limit.dailyTransferAttemptPerAddress);
    }

    function _resetIfNeeded(uint32 dstEid, address user) internal {
        if (block.timestamp - lastUpdatedTime[dstEid] >= 1 days) {
            dailyTransferAmount[dstEid] = 0;
            lastUpdatedTime[dstEid] = block.timestamp;
        }

        if (block.timestamp - lastUserUpdatedTime[dstEid][user] >= 1 days) {
            userDailyTransferAmount[dstEid][user] = 0;
            userDailyAttempt[dstEid][user] = 0;
            lastUserUpdatedTime[dstEid][user] = block.timestamp;
        }
    }
}
