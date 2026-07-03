// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/// @title DelegateLogic — the "implementation" half of Lesson 5
/// @notice Code that is meant to be executed via DELEGATECALL from another contract.
/// @dev Its storage layout is a CONTRACT with its callers: slot 0 = number,
///      slot 1 = lastWriter. Delegatecall runs this code against the CALLER's storage.
contract DelegateLogic {
    uint256 public number;     // slot 0
    address public lastWriter; // slot 1

    event NumberSet(address indexed writer, uint256 value);

    function setNumber(uint256 newNumber) external {
        number = newNumber;        // writes slot 0 — of whoever is executing this code
        lastWriter = msg.sender;   // msg.sender is PRESERVED through delegatecall
        emit NumberSet(msg.sender, newNumber);
    }
}

/// @title DelegateDemo — Lesson 5: DELEGATECALL, the opcode behind every proxy
/// @notice Calls DelegateLogic with delegatecall and shows the writes land HERE,
///         not in the logic contract. This is exactly how upgradeable proxies work —
///         and why a storage-layout mismatch between proxy and implementation
///         corrupts state (the bug behind several nine-figure exploits).
contract DelegateDemo {
    error DelegatecallFailed();

    // MUST mirror DelegateLogic's layout, slot for slot.
    uint256 public number;     // slot 0
    address public lastWriter; // slot 1

    address public immutable logic; // immutables live in code, not storage — no slot used

    event DelegatedWrite(address indexed caller, uint256 value);

    constructor(address logic_) {
        logic = logic_;
    }

    /// @notice Execute DelegateLogic.setNumber IN THIS CONTRACT'S storage context.
    function setNumberViaDelegate(uint256 newNumber) external {
        (bool ok, ) = logic.delegatecall(abi.encodeCall(DelegateLogic.setNumber, (newNumber)));
        if (!ok) revert DelegatecallFailed();
        emit DelegatedWrite(msg.sender, newNumber);
    }

    /// @notice For contrast: a plain CALL. The write lands in the LOGIC contract's
    ///         storage, and there msg.sender becomes THIS contract, not you.
    function setNumberViaCall(uint256 newNumber) external {
        DelegateLogic(logic).setNumber(newNumber);
    }
}
