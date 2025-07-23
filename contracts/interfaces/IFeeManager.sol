// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

interface IFeeManager {
    function getFeeSplit(uint256 amount) external view returns (uint256 lpAmount, uint256 treasuryAmount);
    function lpReceiver() external view returns (address);
    function treasuryReceiver() external view returns (address);
}
