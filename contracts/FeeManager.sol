// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable-4.7.3/token/ERC20/IERC20Upgradeable.sol";

contract FeeManager is Initializable, OwnableUpgradeable {
    error InvalidSplit();
    error InvalidToken();
    error OnlyTokenCanCall(address caller);

    event ReceiversUpdated(address indexed lp, address indexed treasury);
    event SharesUpdated(uint256 lpShare, uint256 treasuryShare);
    event FeeManagerInitialized(address indexed token, address indexed lpReceiver, address indexed treasuryReceiver);

    uint256 public constant BPS_DENOMINATOR = 10_000;

    address public lpReceiver;
    address public treasuryReceiver;
    address public feeToken;
    uint256 public lpShare;
    uint256 public treasuryShare;

    function initialize(address _token, address _lpReceiver, address _treasuryReceiver) public initializer {
        __Ownable_init(_msgSender());
        if (_lpReceiver == address(0) || _treasuryReceiver == address(0)) revert InvalidToken();
        feeToken = _token;
        lpReceiver = _lpReceiver;
        treasuryReceiver = _treasuryReceiver;
        lpShare = 0;
        treasuryShare = 10000;
        emit FeeManagerInitialized(_token, _lpReceiver, _treasuryReceiver);
    }

    function getFeeSplit(uint256 amount) external view returns (uint256 lpAmount, uint256 treasuryAmount) {
        if (lpShare + treasuryShare != BPS_DENOMINATOR) revert InvalidSplit();
        uint256 lp = (amount * lpShare) / BPS_DENOMINATOR;
        uint256 treasury = amount - lp;
        return (lp, treasury);
    }

    function updateReceivers(address _lp, address _treasury) external onlyOwner {
        if (_lp == address(0) || _treasury == address(0)) revert InvalidToken();

        lpReceiver = _lp;
        treasuryReceiver = _treasury;

        emit ReceiversUpdated(_lp, _treasury);
    }

    function updateShares(uint256 _lpShare, uint256 _treasuryShare) external onlyOwner {
        if (_lpShare + _treasuryShare != BPS_DENOMINATOR) revert InvalidSplit();

        lpShare = _lpShare;
        treasuryShare = _treasuryShare;

        emit SharesUpdated(_lpShare, _treasuryShare);
    }
}
