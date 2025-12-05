// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title TippingPlatform
 * @notice Allows readers to tip authors with automatic platform fee splitting
 * @dev Supports both native ETH and ERC20 tokens
 */
contract TippingPlatform is ReentrancyGuard, Pausable, Ownable {
    using SafeERC20 for IERC20;

    // Platform fee in basis points (1000 = 10%)
    uint256 public platformFeeBps;

    // Minimum tip amount to prevent dust attacks
    uint256 public minimumTipAmount;

    // Maximum fee cap for safety (3000 = 30%)
    uint256 public constant MAX_FEE_BPS = 3000;

    event TipSent(
        address indexed from,
        address indexed to,
        uint256 totalAmount,
        uint256 authorAmount,
        uint256 platformFee,
        address token, // address(0) for ETH
        uint256 timestamp
    );

    event PlatformFeeUpdated(uint256 oldFee, uint256 newFee);
    event MinimumTipAmountUpdated(uint256 oldAmount, uint256 newAmount);
    event EmergencyWithdraw(address token, uint256 amount);

    constructor(
        uint256 _initialFeeBps,
        uint256 _minimumTipAmount
    ) Ownable(msg.sender) {
        require(_initialFeeBps <= MAX_FEE_BPS, "Fee exceeds maximum");
        platformFeeBps = _initialFeeBps;
        minimumTipAmount = _minimumTipAmount;
    }

    /**
     * @notice Tip an author with native ETH
     * @param _authorAddress Wallet address of the author to tip
     */
    function tipAuthor(
        address _authorAddress
    ) external payable nonReentrant whenNotPaused {
        require(msg.value >= minimumTipAmount, "Tip below minimum amount");
        require(_authorAddress != address(0), "Invalid author address");
        require(_authorAddress != msg.sender, "Cannot tip yourself");

        // Calculate split
        uint256 platformFee = (msg.value * platformFeeBps) / 10000;
        uint256 authorAmount = msg.value - platformFee;

        // Transfer to author
        (bool successAuthor, ) = _authorAddress.call{value: authorAmount}("");
        require(successAuthor, "Transfer to author failed");

        // Transfer fee to owner (only if fee > 0)
        if (platformFee > 0) {
            (bool successOwner, ) = payable(owner()).call{value: platformFee}(
                ""
            );
            require(successOwner, "Transfer to platform failed");
        }

        emit TipSent(
            msg.sender,
            _authorAddress,
            msg.value,
            authorAmount,
            platformFee,
            address(0),
            block.timestamp
        );
    }

    /**
     * @notice Tip an author with ERC20 token
     * @dev User must approve this contract to spend _amount of tokens first
     */
    function tipAuthorWithToken(
        address _authorAddress,
        address _token,
        uint256 _amount
    ) external nonReentrant whenNotPaused {
        require(_amount >= minimumTipAmount, "Tip below minimum amount");
        require(_authorAddress != address(0), "Invalid author address");
        require(_token != address(0), "Invalid token address");
        require(_authorAddress != msg.sender, "Cannot tip yourself");

        IERC20 token = IERC20(_token);

        uint256 platformFee = (_amount * platformFeeBps) / 10000;
        uint256 authorAmount = _amount - platformFee;

        // OPTIMIZATION: We pull the FULL amount to the contract first.
        // This ensures the user only sees one interaction in their wallet (Transfer to Platform),
        // and guarantees the split happens atomically from the contract's balance.
        token.safeTransferFrom(msg.sender, address(this), _amount);

        // Send share to author
        token.safeTransfer(_authorAddress, authorAmount);

        // Send share to owner
        if (platformFee > 0) {
            token.safeTransfer(owner(), platformFee);
        }

        emit TipSent(
            msg.sender,
            _authorAddress,
            _amount,
            authorAmount,
            platformFee,
            _token,
            block.timestamp
        );
    }

    // --- Admin Functions ---

    function setPlatformFee(uint256 _newFeeBps) external onlyOwner {
        require(_newFeeBps <= MAX_FEE_BPS, "Fee exceeds maximum");
        uint256 oldFee = platformFeeBps;
        platformFeeBps = _newFeeBps;
        emit PlatformFeeUpdated(oldFee, _newFeeBps);
    }

    function setMinimumTipAmount(uint256 _newMinimum) external onlyOwner {
        uint256 oldAmount = minimumTipAmount;
        minimumTipAmount = _newMinimum;
        emit MinimumTipAmountUpdated(oldAmount, _newMinimum);
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    function emergencyWithdraw(address _token) external onlyOwner {
        if (_token == address(0)) {
            uint256 balance = address(this).balance;
            require(balance > 0, "No ETH to withdraw");
            (bool success, ) = owner().call{value: balance}("");
            require(success, "ETH withdrawal failed");
            emit EmergencyWithdraw(address(0), balance);
        } else {
            IERC20 token = IERC20(_token);
            uint256 balance = token.balanceOf(address(this));
            require(balance > 0, "No tokens to withdraw");
            token.safeTransfer(owner(), balance);
            emit EmergencyWithdraw(_token, balance);
        }
    }

    /**
     * @notice Calculate tip split for a given amount
     * @dev Useful for frontend to display estimated amounts before transaction
     */
    function calculateSplit(
        uint256 _amount
    ) external view returns (uint256 authorAmount, uint256 platformFee) {
        platformFee = (_amount * platformFeeBps) / 10000;
        authorAmount = _amount - platformFee;
        return (authorAmount, platformFee);
    }

    // Fallback function
    receive() external payable {
        revert("Please use tipAuthor() function");
    }
}
