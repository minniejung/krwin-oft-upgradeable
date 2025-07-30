// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import { OFTUpgradeable } from "@layerzerolabs/oft-evm-upgradeable/contracts/oft/OFTUpgradeable.sol";
import { AccessControlUpgradeable } from "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import { PausableUpgradeable } from "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import { ERC20PermitUpgradeable } from "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20PermitUpgradeable.sol";
import { ERC165Upgradeable } from "@openzeppelin/contracts-upgradeable/utils/introspection/ERC165Upgradeable.sol";

import "./FeeManager.sol";
import "./modules/TransferLimiter.sol";
import "./modules/Blacklistable.sol";
import "./modules/Freezable.sol";
import "./interfaces/IFeeManager.sol";

contract ABC is
    Initializable,
    OFTUpgradeable,
    ERC20PermitUpgradeable,
    PausableUpgradeable,
    ERC165Upgradeable,
    AccessControlUpgradeable,
    Blacklistable,
    Freezable,
    TransferLimiter
{
    error BlockedSender(address sender);
    error BlockedRecipient(address recipient);
    error AccountNotBlocked(address account);
    error FeeTooHigh();
    error InvalidAddress();
    error InsufficientBalance();
    error InsufficientAllowance();

    event MintFeePaid(address indexed minter, uint256 fee);
    event BurnFeePaid(address indexed burner, uint256 fee);
    event MintFeeUpdated(uint256 newFee);
    event BurnFeeUpdated(uint256 newFee);
    event FeeManagerUpdated(address indexed oldManager, address indexed newManager);
    event ReserveOracleUpdated(address indexed oldOracle, address indexed newOracle);
    event BlockedFundsDestroyed(address indexed account, uint256 amount);
    event ReserveMinted(address indexed from, address indexed to, uint256 amount);

    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant FUNDS_RECOVERY_ROLE = keccak256("FUNDS_RECOVERY_ROLE");

    uint256 public mintFee;
    uint256 public burnFee;
    address public feeManager;
    address public reserveOracle;

    uint256[50] private __gap;

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor(address _lzEndpoint) OFTUpgradeable(_lzEndpoint) {
        _disableInitializers();
    }

    // TODO PoR
    modifier onlyWhenReserveSufficient(uint256 amount) {
        _;
    }

    function initialize(
        string memory _name,
        string memory _symbol,
        address _delegate,
        address _admin
    ) public initializer {
        __Ownable_init(_msgSender());
        __OFT_init(_name, _symbol, _delegate);
        __ERC20Permit_init(_name);
        __Pausable_init();
        __ERC165_init();
        __AccessControl_init();
        __Blacklistable_init();
        __Freezable_init();

        _grantRole(DEFAULT_ADMIN_ROLE, _admin);
        _grantRole(OPERATOR_ROLE, _admin);
        _grantRole(MINTER_ROLE, _admin);
        _grantRole(FUNDS_RECOVERY_ROLE, _admin);
    }

    // ERC165
    function supportsInterface(
        bytes4 interfaceId
    ) public view override(AccessControlUpgradeable, ERC165Upgradeable) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    // Mint & Burn
    function mint(
        address to,
        uint256 amount
    ) public onlyRole(MINTER_ROLE) whenNotPaused onlyWhenReserveSufficient(amount) {
        if (isBlocked(to)) revert BlockedRecipient(to);
        _mint(to, amount);
        emit ReserveMinted(msg.sender, to, amount);
    }

    function transferFromReserve(address to, uint256 amount) external onlyRole(MINTER_ROLE) whenNotPaused {
        if (isBlocked(to)) revert BlockedRecipient(to);

        uint256 mintFeeToPay = (amount * mintFee) / 10000;
        if (balanceOf(msg.sender) < amount) revert InsufficientBalance();

        (uint256 lpAmount, uint256 treasuryAmount) = IFeeManager(feeManager).getFeeSplit(mintFeeToPay);
        _transfer(msg.sender, IFeeManager(feeManager).lpReceiver(), lpAmount);
        _transfer(msg.sender, IFeeManager(feeManager).treasuryReceiver(), treasuryAmount);

        emit MintFeePaid(msg.sender, mintFeeToPay);

        _transfer(msg.sender, to, amount - mintFeeToPay);
    }

    function burn(uint256 amount) public whenNotPaused onlyWhenReserveSufficient(amount) {
        if (isBlocked(_msgSender())) revert BlockedSender(_msgSender());

        uint256 burnFeeToPay = (amount * burnFee) / 10000;
        if (balanceOf(_msgSender()) < amount) revert InsufficientBalance();

        (uint256 lpAmount, uint256 treasuryAmount) = IFeeManager(feeManager).getFeeSplit(burnFeeToPay);
        _transfer(msg.sender, IFeeManager(feeManager).lpReceiver(), lpAmount);
        _transfer(msg.sender, IFeeManager(feeManager).treasuryReceiver(), treasuryAmount);

        emit BurnFeePaid(_msgSender(), burnFeeToPay);

        _burn(_msgSender(), amount - burnFeeToPay);
    }

    function burnFrom(address account, uint256 amount) public {
        if (account == address(0)) revert InvalidAddress();

        uint256 currentAllowance = allowance(account, msg.sender);
        if (currentAllowance < amount) revert InsufficientAllowance();

        _approve(account, msg.sender, currentAllowance - amount);

        if (balanceOf(account) < amount) revert InsufficientBalance();

        _burn(account, amount);
    }

    // Check if an account is blocked (blacklisted or frozen)
    function isBlocked(address account) public view returns (bool) {
        return isFrozen(account) || isBlacklisted(account);
    }

    function destroyBlockedFunds(address account) external onlyRole(FUNDS_RECOVERY_ROLE) {
        if (!isBlocked(account)) revert AccountNotBlocked(account);

        uint256 balance = balanceOf(account);
        _burn(account, balance);
        emit BlockedFundsDestroyed(account, balance);
    }

    // Override transfer to add blocked checks
    function transfer(address to, uint256 amount) public virtual override returns (bool) {
        if (isBlocked(msg.sender)) revert BlockedSender(msg.sender);
        if (isBlocked(to)) revert BlockedRecipient(to);
        return super.transfer(to, amount);
    }

    function transferFrom(address from, address to, uint256 amount) public virtual override returns (bool) {
        if (isBlocked(from)) revert BlockedSender(from);
        if (isBlocked(to)) revert BlockedRecipient(to);
        return super.transferFrom(from, to, amount);
    }

    // Override approve to add blocked checks
    function approve(address spender, uint256 amount) public virtual override returns (bool) {
        if (isBlocked(msg.sender)) revert BlockedSender(msg.sender);
        if (isBlocked(spender)) revert BlockedRecipient(spender);
        return super.approve(spender, amount);
    }

    // Pause/unpause contract
    function pause() external onlyRole(OPERATOR_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(OPERATOR_ROLE) {
        _unpause();
    }

    function isPaused() external view returns (bool) {
        return paused();
    }

    // Fee setters
    function setMintFee(uint256 newFee) external onlyRole(OPERATOR_ROLE) {
        if (newFee > 500) revert FeeTooHigh();
        mintFee = newFee;
        emit MintFeeUpdated(newFee);
    }

    function setBurnFee(uint256 newFee) external onlyRole(OPERATOR_ROLE) {
        if (newFee > 500) revert FeeTooHigh();
        burnFee = newFee;
        emit BurnFeeUpdated(newFee);
    }

    function setFeeManager(address newManager) external onlyRole(OPERATOR_ROLE) {
        if (newManager == address(0)) revert InvalidAddress();
        address oldManager = feeManager;
        feeManager = newManager;
        emit FeeManagerUpdated(oldManager, newManager);
    }

    // Oracle setter
    function setReserveOracle(address newOracle) external onlyRole(OPERATOR_ROLE) {
        reserveOracle = newOracle;
        emit ReserveOracleUpdated(reserveOracle, newOracle);
    }

    function setTransferLimitConfigs(TransferLimit[] calldata configs) external onlyRole(OPERATOR_ROLE) {
        _setTransferLimitConfigs(configs);
    }

    // Set peer for cross-chain communication
    function setPeer(uint32 _eid, bytes32 _peer) public override onlyOwner {
        super.setPeer(_eid, _peer);
    }

    // Transfer ownership to admin
    function transferOwnership(address newOwner) public override onlyRole(DEFAULT_ADMIN_ROLE) {
        _transferOwnership(newOwner);
    }
}
