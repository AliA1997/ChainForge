// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/// @title GuestBook — Lesson 2: structs, dynamic arrays, calldata, and pagination
/// @notice An on-chain message wall. Demonstrates why you must paginate reads and
///         cap writes: unbounded loops over a growing array are a classic DoS bug.
contract GuestBook {
    /// @notice Thrown when a message exceeds `MAX_MESSAGE_LENGTH` bytes.
    error MessageTooLong(uint256 length, uint256 maxLength);
    /// @notice Thrown when a message is empty.
    error EmptyMessage();

    /// @notice Indexed author lets a UI subscribe to "my posts" only.
    event MessagePosted(address indexed author, uint256 indexed index, string text, uint256 timestamp);

    struct Message {
        address author;
        uint64 timestamp; // packed into the same slot as `author` (20 + 8 = 28 bytes)
        string text;      // dynamic — stored in its own keccak-derived slots
    }

    /// @dev Strings cost gas per 32-byte word; cap them so posting stays affordable.
    uint256 public constant MAX_MESSAGE_LENGTH = 280;

    Message[] private _messages;

    /// @param text Declared `calldata`, not `memory`: read directly from the
    ///        transaction payload with no copy — the cheapest way to accept input.
    function post(string calldata text) external {
        uint256 length = bytes(text).length;
        if (length == 0) revert EmptyMessage();
        if (length > MAX_MESSAGE_LENGTH) revert MessageTooLong(length, MAX_MESSAGE_LENGTH);

        _messages.push(Message({author: msg.sender, timestamp: uint64(block.timestamp), text: text}));
        emit MessagePosted(msg.sender, _messages.length - 1, text, block.timestamp);
    }

    function totalMessages() external view returns (uint256) {
        return _messages.length;
    }

    /// @notice Paginated reader. NEVER expose `return _messages;` — once the array
    ///         is large enough, copying it to memory exceeds RPC gas caps and every
    ///         read starts failing. Reads are free, but they still execute in the EVM.
    /// @param offset Index of the first message to return.
    /// @param limit  Maximum number of messages to return.
    function getMessages(uint256 offset, uint256 limit) external view returns (Message[] memory page) {
        uint256 total = _messages.length;
        if (offset >= total) return new Message[](0);

        uint256 end = offset + limit;
        if (end > total) end = total;

        page = new Message[](end - offset);
        for (uint256 i = offset; i < end; i++) {
            page[i - offset] = _messages[i];
        }
    }
}
