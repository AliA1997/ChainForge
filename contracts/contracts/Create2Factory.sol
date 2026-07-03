// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Counter} from "./Counter.sol";

/// @title Create2Factory — Lesson 4: CREATE vs CREATE2 and deterministic addresses
/// @notice Deploys `Counter` instances at addresses you can compute BEFORE deploying.
/// @dev CREATE:  address = keccak256(rlp(deployer, nonce))          — depends on nonce.
///      CREATE2: address = keccak256(0xff, deployer, salt, keccak256(initCode))[12:]
///      — fully deterministic. This is how smart-account wallets (ERC-4337) hand out
///      addresses that don't exist on-chain yet ("counterfactual deployment").
contract Create2Factory {
    /// @notice CREATE2 reverts if the (salt, initCode) pair was already deployed.
    error AlreadyDeployed(address at);

    event CounterDeployed(address indexed at, bytes32 indexed salt, address owner);

    /// @notice Deploy a Counter at a salt-determined address.
    function deployCounter(bytes32 salt, address counterOwner) external returns (address deployed) {
        address predicted = predictAddress(salt, counterOwner);
        if (predicted.code.length != 0) revert AlreadyDeployed(predicted);

        // `new C{salt: s}(...)` compiles to the CREATE2 opcode.
        deployed = address(new Counter{salt: salt}(counterOwner));
        emit CounterDeployed(deployed, salt, counterOwner);
    }

    /// @notice Compute the address a salt WILL produce — without deploying anything.
    /// @dev initCode = creation bytecode ++ ABI-encoded constructor args. Change
    ///      either one and the resulting address changes too.
    function predictAddress(bytes32 salt, address counterOwner) public view returns (address) {
        bytes32 initCodeHash = keccak256(
            abi.encodePacked(type(Counter).creationCode, abi.encode(counterOwner))
        );
        return address(
            uint160(uint256(keccak256(abi.encodePacked(bytes1(0xff), address(this), salt, initCodeHash))))
        );
    }
}
