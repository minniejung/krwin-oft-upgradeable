// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

interface IReserveOracle {
    function isSufficient(uint256 amount) external view returns (bool);
}
