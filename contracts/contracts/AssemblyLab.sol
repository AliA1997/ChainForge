// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/// @title AssemblyLab — Lesson 6: touching the EVM directly with inline assembly
/// @notice Small, safe demonstrations of the opcodes the Opcode Explorer teaches:
///         SLOAD, EXTCODESIZE, CHAINID, GASLEFT, and transient storage (TSTORE/TLOAD).
contract AssemblyLab {
    uint256 public slot0Value = 42;        // storage slot 0
    address public slot1Value = address(this); // storage slot 1

    /// @notice Read ANY storage slot of THIS contract. There is no "private" on-chain:
    ///         `private` only removes the getter — anyone can read every slot.
    function readSlot(uint256 slot) external view returns (bytes32 result) {
        assembly {
            result := sload(slot)
        }
    }

    /// @notice EXTCODESIZE — how contracts detect other contracts. Zero for EOAs…
    ///         and also zero for a contract whose constructor is still running,
    ///         which is why `isContract()` checks are not a security boundary.
    function codeSizeOf(address target) external view returns (uint256 size) {
        assembly {
            size := extcodesize(target)
        }
    }

    /// @notice CHAINID — used in EIP-712/SIWE signatures to stop cross-chain replay.
    function currentChainId() external view returns (uint256 id) {
        assembly {
            id := chainid()
        }
    }

    /// @notice Measure the real gas cost of one cold SLOAD (~2100 gas post-EIP-2929).
    function measureSloadGas() external view returns (uint256 gasUsed) {
        uint256 before;
        uint256 value;
        assembly {
            before := gas()
            value := sload(0)
            gasUsed := sub(before, gas())
        }
        // keep `value` alive so the optimizer can't delete the SLOAD
        if (value == type(uint256).max) gasUsed = 0;
    }

    /// @notice TSTORE/TLOAD (EIP-1153, Cancun): storage that lives only for the
    ///         duration of the transaction. ~100 gas vs ~20k for SSTORE — the modern
    ///         way to build reentrancy locks. This function writes, reads back, and
    ///         returns the value; after the tx, the slot is zero again.
    function transientRoundTrip(uint256 value) external returns (uint256 readBack) {
        assembly {
            tstore(0, value)
            readBack := tload(0)
        }
    }

    /// @notice Prove transient storage cleared: called in a LATER transaction,
    ///         tload(0) is zero even if transientRoundTrip stored something before.
    function readTransient() external view returns (uint256 value) {
        assembly {
            value := tload(0)
        }
    }
}
