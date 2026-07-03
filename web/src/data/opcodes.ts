export type OpcodeCategory =
  | "Stack"
  | "Arithmetic & Logic"
  | "Hashing"
  | "Environment"
  | "Block"
  | "Memory"
  | "Storage"
  | "Transient storage"
  | "Control flow"
  | "Calls"
  | "Contract creation"
  | "Logging"
  | "Halting";

export interface OpcodeInfo {
  name: string;
  hex: string;
  gas: string;
  category: OpcodeCategory;
  description: string;
  /** The senior-interview angle: where this opcode shows up in real systems. */
  usage: string;
}

export const OPCODE_CATEGORIES: OpcodeCategory[] = [
  "Storage",
  "Transient storage",
  "Calls",
  "Contract creation",
  "Environment",
  "Memory",
  "Control flow",
  "Logging",
  "Hashing",
  "Arithmetic & Logic",
  "Block",
  "Stack",
  "Halting",
];

export const OPCODES: OpcodeInfo[] = [
  // Storage — the expensive ones first, they carry the most interview weight
  {
    name: "SSTORE", hex: "0x55", gas: "22.1k cold zero→nonzero / 5k update / 100 warm",
    category: "Storage",
    description: "Write a 32-byte word to persistent storage. The most expensive common operation in the EVM; EIP-2929 made first (cold) access of a slot cost extra, and clearing a slot to zero refunds gas.",
    usage: "Why gas golfing exists: pack structs into fewer slots, cache storage in locals, and prefer events over storage for data only the frontend needs. The AssemblyLab contract lets you measure this live.",
  },
  {
    name: "SLOAD", hex: "0x54", gas: "2100 cold / 100 warm",
    category: "Storage",
    description: "Read a word from persistent storage. Cold first-touch of a slot in a transaction costs 2100; subsequent (warm) reads 100.",
    usage: "Reading the same storage variable in a loop is a classic review finding — copy to a memory/local variable once. Warm vs cold is also why multicall batching is cheaper than separate transactions.",
  },
  {
    name: "TSTORE", hex: "0x5D", gas: "100",
    category: "Transient storage",
    description: "EIP-1153 (Cancun): write storage that survives across call frames within one transaction and auto-clears at its end.",
    usage: "Modern reentrancy locks — the lock only needs to live one transaction, so paying SSTORE prices was waste. Also used by Uniswap v4 for transient pool locks. Caveat: persists across the whole tx, so clear what you don't want later frames to see.",
  },
  {
    name: "TLOAD", hex: "0x5C", gas: "100",
    category: "Transient storage",
    description: "Read from transient storage. Always zero in a fresh transaction.",
    usage: "Pairs with TSTORE. The AssemblyLab's transientRoundTrip/readTransient pair proves the auto-clearing behaviour on a real chain.",
  },
  // Calls
  {
    name: "CALL", hex: "0xF1", gas: "100 warm + 2600 cold + 9k if value + memory",
    category: "Calls",
    description: "Call another contract (or send ETH): target executes its own code with its own storage; msg.sender becomes the calling contract.",
    usage: "Every external call is a trust boundary — the callee can reenter you. The 63/64 rule (EIP-150) forwards at most 63/64 of remaining gas, which is why 'leave gas for cleanup' patterns work.",
  },
  {
    name: "DELEGATECALL", hex: "0xF4", gas: "like CALL, no value transfer",
    category: "Calls",
    description: "Execute the target's code in the CALLER's context: caller's storage and address, original msg.sender/msg.value preserved.",
    usage: "The opcode behind every proxy and upgradeable contract, and behind library code sharing. Storage-layout mismatch between proxy and implementation is the classic catastrophic bug. Try it live in the DelegateDemo playground.",
  },
  {
    name: "STATICCALL", hex: "0xFA", gas: "like CALL, no value",
    category: "Calls",
    description: "Like CALL but state changes are forbidden for the whole sub-call tree — any SSTORE, LOG, or CREATE reverts.",
    usage: "What Solidity emits for view function calls; it's the EVM-level guarantee that makes eth_call safe. Also the reason 'read-only reentrancy' is subtle: STATICCALL prevents writes but a view can still observe mid-transaction inconsistent state.",
  },
  {
    name: "RETURNDATACOPY", hex: "0x3E", gas: "3 + memory",
    category: "Calls",
    description: "Copy the return data of the last sub-call into memory (with RETURNDATASIZE, 0x3D).",
    usage: "How proxies forward arbitrary return values, and how try/catch reads revert payloads. Pre-Byzantium proxies had to guess return sizes — this pair is why the minimal proxy (EIP-1167) is only 45 bytes.",
  },
  // Creation
  {
    name: "CREATE", hex: "0xF0", gas: "32k + init execution + 200/byte of code",
    category: "Contract creation",
    description: "Deploy a contract; the new address is keccak256(rlp(sender, nonce)) — dependent on the creator's nonce, so order matters.",
    usage: "What `new Contract()` compiles to. The 24,576-byte runtime size cap (EIP-170) is why large protocols split logic or use libraries and diamonds.",
  },
  {
    name: "CREATE2", hex: "0xF5", gas: "CREATE + 6/word hashed",
    category: "Contract creation",
    description: "Deploy at keccak256(0xff, deployer, salt, keccak256(initCode)) — fully deterministic, independent of nonce or ordering.",
    usage: "Counterfactual addresses: ERC-4337 wallets give users an address before any code exists there; deterministic cross-chain deployments use a shared factory + salt. The Create2Factory playground lets you predict-then-deploy.",
  },
  {
    name: "SELFDESTRUCT", hex: "0xFF", gas: "5000",
    category: "Contract creation",
    description: "Since EIP-6780 (Cancun): only deletes code if executed in the same transaction as creation; otherwise it just sweeps the balance to the target.",
    usage: "A great 'is your knowledge current?' interview probe — the old 'contracts can vanish' answer is obsolete. Metamorphic-contract tricks that abused CREATE2 + SELFDESTRUCT redeployment died with it.",
  },
  {
    name: "EXTCODESIZE", hex: "0x3B", gas: "2600 cold / 100 warm",
    category: "Environment",
    description: "Byte length of the code at an address. Zero for EOAs — and for contracts whose constructor is still executing.",
    usage: "The `isContract()` check, and why it is NOT a security boundary: a constructor-phase attacker has code size zero. Post-7702 EOAs can also carry delegated code, breaking 'EOA == no code' assumptions.",
  },
  // Environment
  {
    name: "CALLER", hex: "0x33", gas: "2",
    category: "Environment",
    description: "The address that made the current call — Solidity's msg.sender.",
    usage: "The bedrock of every access-control check. Interview nuance vs ORIGIN: msg.sender changes at each call hop; delegatecall preserves it — which is exactly what makes proxies transparent.",
  },
  {
    name: "ORIGIN", hex: "0x32", gas: "2",
    category: "Environment",
    description: "The EOA that signed the transaction — tx.origin. Constant through the whole call chain.",
    usage: "Using tx.origin for auth is a famous vulnerability: a malicious contract your user calls can relay into your contract and pass the check. Legit uses are rare (e.g. detecting 'called by a contract').",
  },
  {
    name: "CALLVALUE", hex: "0x34", gas: "2",
    category: "Environment",
    description: "Wei sent with the call — msg.value.",
    usage: "Non-payable functions compile to a CALLVALUE check that reverts if nonzero. In multicall/batch contexts, reusing msg.value across iterations caused real exploits (each loop iteration 'spends' the same value).",
  },
  {
    name: "CALLDATALOAD", hex: "0x35", gas: "3",
    category: "Environment",
    description: "Load 32 bytes of calldata (with CALLDATASIZE 0x36 and CALLDATACOPY 0x37).",
    usage: "Function dispatch: the first 4 bytes of calldata are the selector the contract switches on. Calldata is the cheapest data location — the reason `calldata` params beat `memory` for external functions.",
  },
  {
    name: "CHAINID", hex: "0x46", gas: "2",
    category: "Environment",
    description: "The chain's EIP-155 id (1 mainnet, 11155111 Sepolia…).",
    usage: "Baked into EIP-712 domain separators and SIWE messages so a signature for one chain can't be replayed on another — the defence that saved wallets during the ETH/ETC and post-merge fork eras.",
  },
  {
    name: "ADDRESS", hex: "0x30", gas: "2",
    category: "Environment",
    description: "The executing contract's own address — address(this).",
    usage: "Under delegatecall this is the PROXY's address, not the implementation's — a one-line proof of which context your code runs in.",
  },
  {
    name: "BALANCE", hex: "0x31", gas: "2600 cold / 100 warm",
    category: "Environment",
    description: "ETH balance of an address; SELFBALANCE (0x47, gas 5) is the cheap variant for your own.",
    usage: "Never use address(this).balance == expected as an invariant: anyone can force-feed ETH via selfdestruct sweep or as a block reward target, breaking naive accounting.",
  },
  {
    name: "GAS", hex: "0x5A", gas: "2",
    category: "Environment",
    description: "Remaining gas — Solidity's gasleft().",
    usage: "Used for gas measurements (see AssemblyLab.measureSloadGas) and historically for the 2300-stipend checks in transfer/send — the pattern that aged badly and is now 'use call, guard reentrancy properly'.",
  },
  // Block
  {
    name: "TIMESTAMP", hex: "0x42", gas: "2",
    category: "Block",
    description: "The block's Unix timestamp — block.timestamp.",
    usage: "Fine for deadlines measured in minutes+; wrong as a randomness source or for sub-block precision (proposers have seconds of wiggle). Post-merge, timestamps advance in exact 12s slots on L1.",
  },
  {
    name: "NUMBER", hex: "0x43", gas: "2",
    category: "Block",
    description: "Current block height — block.number.",
    usage: "On L2s this is the L2 block number, and OP-Stack chains produce them every 2s — so 'wait N blocks' logic must be chain-aware. Snapshot/checkpoint systems key state to block numbers.",
  },
  {
    name: "PREVRANDAO", hex: "0x44", gas: "2",
    category: "Block",
    description: "Post-merge: the beacon chain's randomness value for the block (replaced DIFFICULTY).",
    usage: "Better than blockhash for randomness but still proposer-influenceable at the margin — the honest answer for 'how do I do randomness on-chain?' remains commit-reveal or oracle VRF for value at stake.",
  },
  {
    name: "BLOCKHASH", hex: "0x40", gas: "20",
    category: "Block",
    description: "Hash of one of the last 256 blocks; zero beyond that.",
    usage: "The 256-block window is a classic gotcha: lotteries that 'reveal later' break if nobody pokes them within ~50 minutes. Also miner/proposer-biasable — never randomness for real value.",
  },
  {
    name: "BASEFEE", hex: "0x48", gas: "2",
    category: "Block",
    description: "The block's EIP-1559 base fee — block.basefee.",
    usage: "Lets contracts reason about current gas conditions on-chain (e.g. refund contracts, gas-aware keepers). Pairs with the Gas Lab page's live basefee chart.",
  },
  // Memory
  {
    name: "MSTORE", hex: "0x52", gas: "3 + expansion",
    category: "Memory",
    description: "Write a 32-byte word to memory. Memory expands in words; expansion cost grows quadratically past ~724 bytes of active memory.",
    usage: "Why returning giant arrays from view functions can exceed RPC gas caps even though 'reads are free' — memory expansion is still metered inside the EVM.",
  },
  {
    name: "MLOAD", hex: "0x51", gas: "3 + expansion",
    category: "Memory",
    description: "Read a 32-byte word from memory.",
    usage: "Solidity keeps the free-memory pointer at 0x40 — the first thing you see in any disassembly. Hand-written assembly that forgets to respect it corrupts later allocations.",
  },
  {
    name: "MCOPY", hex: "0x5E", gas: "3 + 3/word + expansion",
    category: "Memory",
    description: "EIP-5656 (Cancun): copy memory ranges directly, replacing MLOAD/MSTORE loops.",
    usage: "A 'is your EVM knowledge current?' marker like TSTORE. Compilers emit it for struct/array copies, shaving gas on data-heavy code.",
  },
  // Control flow
  {
    name: "JUMPI", hex: "0x57", gas: "10",
    category: "Control flow",
    description: "Conditional jump to a JUMPDEST (0x5B). All ifs, loops, and function dispatch compile to JUMP/JUMPI.",
    usage: "Jumps only land on JUMPDEST — the property static analyzers and decompilers rely on to rebuild control flow from bytecode.",
  },
  {
    name: "PC", hex: "0x58", gas: "2",
    category: "Control flow",
    description: "Current program counter.",
    usage: "Mostly a disassembly/metaprogramming curiosity; banned in newer Solidity via high-level code. Good trivia, low practical weight.",
  },
  // Logging
  {
    name: "LOG0–LOG4", hex: "0xA0–0xA4", gas: "375 + 375/topic + 8/byte",
    category: "Logging",
    description: "Emit a log with 0–4 indexed topics plus data. Logs live in receipts — contracts can never read them back.",
    usage: "Solidity events: topic 0 is the event signature hash; `indexed` params become topics you can filter server-side (that's what useWatchContractEvent subscribes to). ~8 gas/byte makes events the cheap place for frontend-only data.",
  },
  // Hashing
  {
    name: "KECCAK256", hex: "0x20", gas: "30 + 6/word",
    category: "Hashing",
    description: "The EVM's native hash (pre-standardisation Keccak, not NIST SHA-3).",
    usage: "Everything is keccak: function selectors, event topics, mapping slots (keccak(key . slot)), CREATE2 addresses, EIP-712 digests, Merkle airdrop proofs. If asked 'where does a mapping value live?' — this is the answer.",
  },
  // Arithmetic & logic
  {
    name: "ADD / MUL / SUB", hex: "0x01–0x03", gas: "3–5",
    category: "Arithmetic & Logic",
    description: "256-bit wrapping arithmetic. Overflow checks are NOT in the EVM — Solidity ≥0.8 inserts them in generated code.",
    usage: "Why `unchecked { }` blocks save gas (they skip the inserted checks) and why pre-0.8 code needed SafeMath. A precise answer here signals you know where language ends and VM begins.",
  },
  {
    name: "DIV / MOD", hex: "0x04 / 0x06", gas: "5",
    category: "Arithmetic & Logic",
    description: "Integer division and modulo. Division by zero returns 0 at the EVM level — Solidity adds the revert.",
    usage: "Integer division truncates: the root of rounding-direction bugs in DeFi (fees rounding in users' favour, share-price manipulation). 'Round in the protocol's favour' is the standard rule.",
  },
  {
    name: "EXP", hex: "0x0A", gas: "10 + 50/byte of exponent",
    category: "Arithmetic & Logic",
    description: "Exponentiation — one of the few opcodes priced by operand size.",
    usage: "10**decimals in token math. Compilers constant-fold literal exponents, so the cost mostly bites dynamic exponents.",
  },
  {
    name: "SHL / SHR / SAR", hex: "0x1B–0x1D", gas: "3",
    category: "Arithmetic & Logic",
    description: "Bit shifts (logical left/right, arithmetic right).",
    usage: "Storage packing by hand, extracting packed fields, and the bit-twiddling inside gas-golfed libraries like solady. Reading them fluently is what 'can read assembly' means in practice.",
  },
  {
    name: "AND / OR / XOR / NOT", hex: "0x16–0x19", gas: "3",
    category: "Arithmetic & Logic",
    description: "Bitwise logic over 256-bit words.",
    usage: "Address masking (AND with 160 set bits), flag packing, and the masks you see all over compiled output when values smaller than 32 bytes get cleaned.",
  },
  // Stack
  {
    name: "PUSH0", hex: "0x5F", gas: "2",
    category: "Stack",
    description: "EIP-3855 (Shanghai): push the constant zero — before it, pushing 0 cost a 2-byte PUSH1 0x00.",
    usage: "The compatibility gotcha: bytecode compiled for Shanghai+ fails on chains that haven't shipped PUSH0 — a real cross-chain deployment bug class. Solc's evmVersion setting exists for exactly this.",
  },
  {
    name: "PUSH1–PUSH32", hex: "0x60–0x7F", gas: "3",
    category: "Stack",
    description: "Push 1–32 literal bytes onto the stack.",
    usage: "Roughly half of any real bytecode. The 0x60 you see at the start of most contracts is PUSH1 setting up the free-memory pointer.",
  },
  {
    name: "DUP1–DUP16 / SWAP1–SWAP16", hex: "0x80–0x9F", gas: "3",
    category: "Stack",
    description: "Duplicate or swap stack items — the EVM has no registers, only this 1024-deep stack, and only the top 16 are reachable.",
    usage: "The 16-slot reach limit is the cause of Solidity's 'stack too deep' error — the answer to that interview question lives here, not in the language.",
  },
  // Halting
  {
    name: "RETURN", hex: "0xF3", gas: "0 + memory",
    category: "Halting",
    description: "Halt successfully, returning a memory range. In a constructor, the returned bytes BECOME the contract's runtime code.",
    usage: "That constructor detail is how deployment actually works — and how metamorphic/factory tricks control what code lands on-chain.",
  },
  {
    name: "REVERT", hex: "0xFD", gas: "0 + memory",
    category: "Halting",
    description: "Halt, undo all state changes in the frame, refund remaining gas, and return error data.",
    usage: "Custom errors are 4-byte selectors + args in the revert payload — cheaper than require strings and decodable by viem into the typed errors your frontend shows. Gas up to the revert point is still consumed.",
  },
  {
    name: "INVALID", hex: "0xFE", gas: "all remaining",
    category: "Halting",
    description: "Designated invalid instruction: reverts and consumes ALL remaining gas.",
    usage: "What Solidity ≥0.8 panics (assert failures, overflow in checked math pre-0.8.4 era) compiled to historically; modern panics use REVERT with Panic(uint256). The gas-burning difference is why assert vs require used to matter more.",
  },
];
