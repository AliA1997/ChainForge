// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/// @title TipJar — Lesson 3: payable functions, the withdraw pattern, and reentrancy
/// @notice Accepts ETH tips with a message. Shows the two security patterns every
///         senior interview probes: checks-effects-interactions and a reentrancy guard.
contract TipJar {
    error NotOwner(address caller);
    error ZeroTip();
    error NothingToWithdraw();
    error Reentrancy();
    error WithdrawFailed();

    event Tipped(address indexed from, uint256 amount, string message);
    event Withdrawn(address indexed to, uint256 amount);

    address public immutable owner;

    /// @notice Lifetime tips per address — lets the UI show a leaderboard.
    mapping(address => uint256) public totalTippedBy;
    uint256 public totalReceived;

    /// @dev Hand-rolled reentrancy guard so the mechanism is visible.
    ///      1 = unlocked, 2 = locked. Non-zero -> non-zero SSTORE is cheaper
    ///      than toggling a bool from zero (avoids the 20k cold-write each time).
    uint256 private _lock = 1;

    modifier nonReentrant() {
        if (_lock == 2) revert Reentrancy();
        _lock = 2;
        _;
        _lock = 1;
    }

    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner(msg.sender);
        _;
    }

    constructor(address owner_) {
        owner = owner_;
    }

    /// @notice `payable` is what allows this function to receive ETH at all —
    ///         sending value to a non-payable function reverts.
    function tip(string calldata message) external payable {
        if (msg.value == 0) revert ZeroTip();
        totalTippedBy[msg.sender] += msg.value;
        totalReceived += msg.value;
        emit Tipped(msg.sender, msg.value, message);
    }

    /// @notice Checks-Effects-Interactions: we emit and read state BEFORE the
    ///         external call, and the guard blocks re-entry during the call.
    ///         `.call` (not `.transfer`) because transfer's 2300 gas stipend
    ///         breaks smart-contract wallets and is considered deprecated advice.
    function withdraw() external onlyOwner nonReentrant {
        uint256 amount = address(this).balance;
        if (amount == 0) revert NothingToWithdraw();

        emit Withdrawn(owner, amount);

        (bool ok, ) = owner.call{value: amount}("");
        if (!ok) revert WithdrawFailed();
    }

    /// @notice Bare ETH transfers (no calldata) land here. Counted as an anonymous tip.
    receive() external payable {
        totalTippedBy[msg.sender] += msg.value;
        totalReceived += msg.value;
        emit Tipped(msg.sender, msg.value, "");
    }
}
