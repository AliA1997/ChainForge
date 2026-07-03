// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/// @title Counter — Lesson 1: state, events, custom errors, access control
/// @notice The "hello world" of smart contracts. One storage slot, mutating
///         functions that cost gas, and events so frontends can react.
/// @dev Every state change emits an event: the UI watches these instead of polling.
contract Counter {
    /// @notice Thrown when someone other than the owner calls a guarded function.
    error NotOwner(address caller);
    /// @notice Thrown when decrementing below zero (uint256 cannot go negative).
    error CannotGoNegative();

    /// @notice Emitted on every change. `by` is indexed so UIs can filter per user.
    event CounterChanged(address indexed by, uint256 previousValue, uint256 newValue);

    /// @notice One 32-byte word in storage slot 0. Reading it via the auto-getter is free.
    uint256 public value;

    /// @notice Slot 1. Set once at deployment; `immutable` would be cheaper but we
    ///         keep it in storage so the AssemblyLab can read it with SLOAD.
    address public owner;

    constructor(address initialOwner) {
        owner = initialOwner;
    }

    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner(msg.sender);
        _;
    }

    /// @notice Anyone may increment. Costs gas: one SLOAD + one SSTORE + a LOG.
    function increment() external {
        uint256 previous = value;
        value = previous + 1;
        emit CounterChanged(msg.sender, previous, value);
    }

    /// @notice Reverts with a custom error instead of a require-string — cheaper
    ///         and the frontend can decode the error selector.
    function decrement() external {
        uint256 previous = value;
        if (previous == 0) revert CannotGoNegative();
        value = previous - 1;
        emit CounterChanged(msg.sender, previous, value);
    }

    /// @notice Only the owner may jump to an arbitrary value.
    function setValue(uint256 newValue) external onlyOwner {
        uint256 previous = value;
        value = newValue;
        emit CounterChanged(msg.sender, previous, newValue);
    }
}
