export interface TutorialSection {
  heading: string;
  body: string[];
  code?: { title: string; code: string };
}

export interface Tutorial {
  slug: string;
  lesson: number;
  title: string;
  level: "Foundations" | "Intermediate" | "Advanced";
  minutes: number;
  summary: string;
  concepts: string[];
  /** Playground contract to practice on, if any. */
  playgroundSlug?: string;
  /** Q&A drill entries that this lesson prepares you for. */
  qaIds: string[];
  sections: TutorialSection[];
}

export const TUTORIALS: Tutorial[] = [
  {
    slug: "your-first-contract",
    lesson: 1,
    title: "Your first contract: state, events, and custom errors",
    level: "Foundations",
    minutes: 15,
    summary:
      "Deploy a Counter to a real testnet and learn the three things every contract is made of: storage, functions that mutate it for a gas price, and events the frontend listens to.",
    concepts: ["storage slots", "events & indexed topics", "custom errors", "access control", "gas"],
    playgroundSlug: "counter",
    qaIds: ["read-vs-write", "tx-lifecycle"],
    sections: [
      {
        heading: "What a contract actually is",
        body: [
          "A deployed contract is three things: bytecode at an address, a persistent key-value store of 32-byte slots (storage), and an ABI describing how to call it. There is no server, no process — code only runs when a transaction or call targets the address, and every mutation is paid for in gas by whoever sent it.",
          "Counter has exactly one meaningful storage slot. Reading it is free (an eth_call served by any node); changing it requires a signed transaction that the whole network executes and agrees on. That asymmetry — free reads, expensive consensus-backed writes — shapes everything you will build.",
        ],
        code: {
          title: "contracts/Counter.sol (core)",
          code: `uint256 public value;      // storage slot 0
address public owner;      // storage slot 1

function increment() external {
    uint256 previous = value;
    value = previous + 1;
    emit CounterChanged(msg.sender, previous, value);
}`,
        },
      },
      {
        heading: "Events: the contract's changelog",
        body: [
          "Contracts cannot push data to your app. Instead they emit events — cheap log entries stored in transaction receipts. `address indexed by` makes the author a topic, so a frontend can subscribe to 'changes made by this wallet' without scanning every block.",
          "This is why well-written contracts emit an event on every state change: the event stream IS the API your UI consumes, via useWatchContractEvent or an indexer. Storage answers 'what is the value now'; events answer 'what happened'.",
        ],
      },
      {
        heading: "Custom errors over require strings",
        body: [
          "`revert NotOwner(msg.sender)` encodes a 4-byte selector plus arguments instead of an ABI-encoded string — cheaper to deploy and to revert, and machine-decodable: viem turns it back into a typed error object so your UI can say 'you are not the owner' rather than dumping hex.",
          "Note that reverted transactions are still mined and still cost gas up to the revert point. That is why this app simulates every write before sending it — catching the revert while it is still free.",
        ],
      },
      {
        heading: "Do it",
        body: [
          "Open the Counter playground, deploy an instance to Sepolia (get faucet ETH first — see Testnets), call increment, and watch value change and CounterChanged land in the Events tab. Then call decrement at zero and observe the CannotGoNegative revert being caught by simulation before you pay for it.",
          "Interview framing: you can now narrate the full write lifecycle — sign → mempool → mined → confirmed, with reverted and rejected as first-class failure states.",
        ],
      },
    ],
  },
  {
    slug: "storage-structs-and-pagination",
    lesson: 2,
    title: "Storage, structs, calldata — and why pagination is survival",
    level: "Foundations",
    minutes: 20,
    summary:
      "GuestBook stores arbitrary user text on-chain. Learn the three data locations, struct packing, and the unbounded-array mistake that permanently bricks contracts.",
    concepts: ["storage vs memory vs calldata", "struct packing", "dynamic arrays", "pagination", "DoS by gas"],
    playgroundSlug: "guestbook",
    qaIds: ["storage-memory-calldata", "unbounded-loops", "private-storage"],
    sections: [
      {
        heading: "Three data locations, three price tags",
        body: [
          "Every reference type in Solidity lives somewhere explicit. Storage persists forever and is the most expensive. Memory lasts one call and is cheap. Calldata is the read-only transaction input itself — the cheapest, because nothing is copied until you ask.",
          "GuestBook.post takes `string calldata text`: the string is validated and pushed to storage straight from the transaction payload. Declaring it `memory` would copy it first for no benefit — a small but telling review finding.",
        ],
        code: {
          title: "Struct packing",
          code: `struct Message {
    address author;   // 20 bytes ┐ packed into
    uint64 timestamp; //  8 bytes ┘ one 32-byte slot
    string text;      // dynamic — keccak-derived slots
}`,
        },
      },
      {
        heading: "The unbounded array trap",
        body: [
          "The naive reader `function all() view returns (Message[] memory)` works in the demo and dies in production: copying the whole array into memory has gas cost proportional to its length, and memory expansion is quadratic. Past a few thousand messages the call exceeds node gas caps and every read fails — forever, because you cannot shrink the array.",
          "The same bug on the write path is worse: any loop whose length users control (airdrop-to-all-holders, delete-all) will eventually exceed the block gas limit, permanently disabling the function. The fixes are always the same: paginate reads, cap writes, and convert push loops into pull patterns.",
        ],
        code: {
          title: "The paginated reader",
          code: `function getMessages(uint256 offset, uint256 limit)
    external view returns (Message[] memory page)
{
    uint256 total = _messages.length;
    if (offset >= total) return new Message[](0);
    uint256 end = offset + limit;
    if (end > total) end = total;
    page = new Message[](end - offset);
    for (uint256 i = offset; i < end; i++) {
        page[i - offset] = _messages[i];
    }
}`,
        },
      },
      {
        heading: "Nothing is private",
        body: [
          "`_messages` is declared private, but private only removes the auto-generated getter. The data sits in publicly readable storage slots — eth_getStorageAt reads anything. Lesson 6's AssemblyLab makes this visceral by SLOADing 'private' slots directly.",
          "Consequence for design: never store secrets, unrevealed answers, or plaintext PII on-chain. Commit to a hash now, reveal later.",
        ],
      },
      {
        heading: "Do it",
        body: [
          "Deploy GuestBook, post a few messages (stay under 280 bytes — try going over and watch MessageTooLong), then page through them with getMessages(0, 2), getMessages(2, 2). Check the MessagePosted events carry the running index.",
        ],
      },
    ],
  },
  {
    slug: "payable-and-reentrancy",
    lesson: 3,
    title: "Payable, the withdraw pattern, and reentrancy",
    level: "Intermediate",
    minutes: 25,
    summary:
      "TipJar moves real (testnet) ETH. Learn payable functions, receive(), checks-effects-interactions, and the reentrancy attack every security question circles back to.",
    concepts: ["payable & msg.value", "receive/fallback", "checks-effects-interactions", "reentrancy", "call vs transfer"],
    playgroundSlug: "tipjar",
    qaIds: ["reentrancy", "transient-storage", "gas-estimation-fails"],
    sections: [
      {
        heading: "Receiving ETH is opt-in",
        body: [
          "Functions reject attached value unless marked `payable` — the compiler inserts a CALLVALUE check that reverts otherwise. TipJar.tip is payable and reads msg.value; bare transfers with no calldata land in `receive()`.",
          "Design note: TipJar tracks totals per tipper in a mapping and emits an event per tip. The mapping answers 'current state' queries; the events feed the activity UI. Storage for what contracts need, events for what frontends need.",
        ],
      },
      {
        heading: "The attack: reentrancy",
        body: [
          "When you send ETH to an address with `.call`, that address's code runs — and it can call back into you before your first call finishes. If you update balances AFTER sending, the attacker re-enters and drains you in a loop. This is the DAO hack, and it still headlines audit reports.",
          "Defence one is ordering: checks (validate), effects (update state), interactions (external calls) — strictly in that order, so re-entering finds state already settled. Defence two is an explicit lock.",
        ],
        code: {
          title: "TipJar's guard + CEI ordering",
          code: `modifier nonReentrant() {
    if (_lock == 2) revert Reentrancy();
    _lock = 2;
    _;
    _lock = 1;
}

function withdraw() external onlyOwner nonReentrant {
    uint256 amount = address(this).balance;
    if (amount == 0) revert NothingToWithdraw();
    emit Withdrawn(owner, amount);            // effects first
    (bool ok, ) = owner.call{value: amount}(""); // interaction last
    if (!ok) revert WithdrawFailed();
}`,
        },
      },
      {
        heading: "call vs transfer — the answer changed",
        body: [
          "Older tutorials say use `.transfer` because its 2300-gas stipend prevents reentrancy. That advice aged badly: 2300 gas breaks smart-contract wallets and multisigs, and gas repricings can shift what fits in the stipend. Modern practice: use `.call{value: ...}(\"\")`, check the bool, and handle reentrancy explicitly with CEI + a lock.",
          "The modern twist worth volunteering in interviews: since Cancun, locks belong in transient storage (TSTORE/TLOAD) — ~100 gas instead of thousands, auto-cleared at transaction end. Lesson 6 demonstrates the opcodes live.",
        ],
      },
      {
        heading: "Do it",
        body: [
          "Deploy TipJar (you as owner), tip yourself 0.001 testnet ETH with a message, watch the pending → confirmed toast flow, then withdraw. Try withdrawing from a second account and watch simulation catch NotOwner before anything is sent.",
        ],
      },
    ],
  },
  {
    slug: "create2-deterministic-deploys",
    lesson: 4,
    title: "CREATE2: addresses before contracts exist",
    level: "Advanced",
    minutes: 20,
    summary:
      "Predict a contract's address from a salt, verify the prediction on-chain, then deploy exactly there. The mechanism behind counterfactual smart accounts.",
    concepts: ["CREATE vs CREATE2", "init code & constructor args", "counterfactual deployment", "ERC-4337 accounts"],
    playgroundSlug: "create2-factory",
    qaIds: ["create2", "eoa-vs-contract", "erc4337-flow"],
    sections: [
      {
        heading: "Two ways to birth a contract",
        body: [
          "CREATE derives the address from deployer + nonce: deploy in a different order, get different addresses. CREATE2 replaces the nonce with your salt and the hash of the init code: address = keccak256(0xff ‖ deployer ‖ salt ‖ keccak256(initCode))[12:]. Same factory, same salt, same code → same address, on any chain, forever.",
          "Init code means creation bytecode PLUS ABI-encoded constructor args — change the owner argument and the predicted address changes too. The factory computes this exactly:",
        ],
        code: {
          title: "Prediction = the formula, verbatim",
          code: `bytes32 initCodeHash = keccak256(
    abi.encodePacked(type(Counter).creationCode, abi.encode(counterOwner))
);
return address(uint160(uint256(keccak256(
    abi.encodePacked(bytes1(0xff), address(this), salt, initCodeHash)
))));`,
        },
      },
      {
        heading: "Why this matters: counterfactual everything",
        body: [
          "ERC-4337 wallets hand users an address computed this way before any code exists there. Users can receive funds at it immediately; the account contract deploys itself lazily on first use, often paid by a paymaster. 'Your address is a promise about future code' is the sentence that shows an interviewer you actually get it.",
          "Deterministic deployment factories (the canonical 0x4e59b44847b379578588920cA78FbF26c0B4956C) use the same trick so a protocol lands at identical addresses on every chain — which is why config files can hardcode one address for all networks.",
        ],
      },
      {
        heading: "Do it",
        body: [
          "Deploy Create2Factory, call predictAddress with a salt (any 32-byte hex — 0x0000…0001 works) and your address. Copy the prediction, call deployCounter with the same inputs, and compare against the CounterDeployed event. Deploy the same salt again and watch AlreadyDeployed revert. Then attach the predicted address in the Counter playground — it's a fully working Counter.",
        ],
      },
    ],
  },
  {
    slug: "delegatecall-and-proxies",
    lesson: 5,
    title: "DELEGATECALL: the opcode behind every proxy",
    level: "Advanced",
    minutes: 25,
    summary:
      "Run another contract's code against your own storage, watch msg.sender survive the hop, and understand exactly how upgradeable proxies work — and how they get exploited.",
    concepts: ["delegatecall vs call", "execution context", "storage layout collisions", "upgradeable proxies", "EIP-1967"],
    playgroundSlug: "delegate-demo",
    qaIds: ["delegatecall", "hardhat-vs-foundry", "private-storage"],
    sections: [
      {
        heading: "Context is everything",
        body: [
          "A plain CALL switches everything to the callee: its storage, its address, and msg.sender becomes the caller contract. DELEGATECALL borrows only the CODE: it executes against the caller's storage, at the caller's address, with the original msg.sender intact.",
          "DelegateDemo makes this concrete: the same setNumber(uint256) touches completely different storage depending on which opcode carried it.",
        ],
        code: {
          title: "One function, two contexts",
          code: `// delegatecall: writes DemoDemo's slot 0, msg.sender = YOU
(bool ok, ) = logic.delegatecall(
    abi.encodeCall(DelegateLogic.setNumber, (newNumber))
);

// plain call: writes DelegateLogic's slot 0, msg.sender = the demo
DelegateLogic(logic).setNumber(newNumber);`,
        },
      },
      {
        heading: "Storage is addressed by slot number, not by name",
        body: [
          "The EVM knows nothing about your variable names — delegatecalled code writes 'slot 0', 'slot 1'. That is why DelegateDemo declares number and lastWriter in exactly the same order as DelegateLogic. Break that contract and writes silently corrupt unrelated variables.",
          "This is the bug class behind real nine-figure incidents (uninitialized proxies, implementation upgrades with shifted layouts — Wormhole-adjacent, Audius, Parity's killed library). Production stacks pin proxy metadata to hashed slots (EIP-1967: implementation at keccak256('eip1967.proxy.implementation') − 1) precisely so it can never collide with implementation variables, and upgrade tooling diffs layouts before allowing an upgrade.",
        ],
      },
      {
        heading: "From here to real proxies",
        body: [
          "A production proxy is just a fallback function that delegatecalls everything to an implementation address, plus an admin path to change that address. Minimal proxies (EIP-1167 clones) hardcode the target into 45 bytes of bytecode for cheap mass deployment; UUPS puts the upgrade function in the implementation itself.",
          "Interview answer skeleton: define the context rule, name the storage-collision hazard, name EIP-1967, and contrast transparent vs UUPS trade-offs. That's a senior-complete answer.",
        ],
      },
      {
        heading: "Do it",
        body: [
          "Deploy DelegateLogic, copy its address, deploy DelegateDemo with it. Call setNumberViaDelegate(7): demo.number is 7, demo.lastWriter is YOUR address, and the logic contract is untouched. Then setNumberViaCall(9): now attach DelegateLogic in its own playground and see number=9 with lastWriter = the demo's address.",
        ],
      },
    ],
  },
  {
    slug: "inline-assembly-and-opcodes",
    lesson: 6,
    title: "Inline assembly: touching the EVM directly",
    level: "Advanced",
    minutes: 25,
    summary:
      "SLOAD 'private' storage, measure real opcode gas, distinguish contracts from EOAs, and prove transient storage clears — live, on a testnet you deployed to.",
    concepts: ["Yul/inline assembly", "SLOAD/SSTORE costs", "EXTCODESIZE", "CHAINID", "EIP-1153 transient storage"],
    playgroundSlug: "assembly-lab",
    qaIds: ["transient-storage", "storage-memory-calldata", "connected-not-authed"],
    sections: [
      {
        heading: "When assembly is legitimate",
        body: [
          "Inline assembly (Yul) drops below Solidity's safety rails: no type checks, no overflow protection, manual memory discipline. Legitimate uses are narrow — gas-critical library code, opcodes Solidity doesn't expose, and proxies' calldata forwarding. Everything else is a code-review red flag.",
          "AssemblyLab uses it the right way: tiny, single-purpose probes, each demonstrating one opcode you can now discuss from experience instead of from a blog post.",
        ],
        code: {
          title: "Nothing is private",
          code: `function readSlot(uint256 slot) external view returns (bytes32 result) {
    assembly {
        result := sload(slot)
    }
}`,
        },
      },
      {
        heading: "Measuring gas honestly",
        body: [
          "measureSloadGas brackets a cold SLOAD with gas() and returns the difference — expect ~2100 (EIP-2929 cold access) with a little overhead. Warm access would be 100. Numbers you have measured stick in interviews far better than numbers you memorised.",
          "Note the anti-optimizer trick: the loaded value feeds a branch, otherwise solc would delete the unused SLOAD and you'd measure nothing.",
        ],
      },
      {
        heading: "Transient storage, proven",
        body: [
          "transientRoundTrip TSTOREs your value and TLOADs it back in the same transaction — you get your number. readTransient, called as a separate transaction, returns 0: the slot auto-cleared. That pair is EIP-1153's whole contract, demonstrated.",
          "Also try codeSizeOf on your own wallet address (0) versus the lab's address (>0) — and be ready to explain why EXTCODESIZE == 0 is NOT a reliable 'is this an EOA' check (constructor-phase contracts, and post-7702 delegated EOAs).",
        ],
      },
    ],
  },
  {
    slug: "frontend-tx-lifecycle",
    lesson: 7,
    title: "Frontend patterns: wagmi, caching, and the tx state machine",
    level: "Intermediate",
    minutes: 30,
    summary:
      "How this very app is built: wagmi + viem + TanStack Query, reads as cached queries, writes as an explicit state machine, and optimistic UI that rolls back honestly.",
    concepts: ["wagmi/viem", "TanStack Query keys", "tx state machine", "optimistic UI", "polling vs events"],
    playgroundSlug: "counter",
    qaIds: ["tx-ux", "query-keys", "polling-vs-events", "mixed-feed", "block-time-floor"],
    sections: [
      {
        heading: "Chain state is server state",
        body: [
          "Treat the chain like a slow, consistent API: every read flows through TanStack Query (wagmi wraps it), keyed by chainId + address + function + args, so switching networks can never leak stale data across chains. Never copy chain data into useState — derive UI from the cache and let invalidation be the only freshness mechanism.",
          "staleTime should relate to block time: refetching an L1 value every 500ms burns RPC quota to learn nothing — state can only change every 12 seconds.",
        ],
      },
      {
        heading: "Writes are a state machine, not a promise",
        body: [
          "A write has real phases users must see: wallet (signature prompt) → pending (hash exists, mempool) → confirmed | reverted | rejected. This app's useTxFlow hook implements exactly that, simulating first so reverts are caught free, then toasting each transition keyed to the tx hash.",
        ],
        code: {
          title: "The shape of useTxFlow",
          code: `const { request } = await publicClient.simulateContract({ ... }); // catch reverts free
const hash = await walletClient.writeContract(request);           // wallet phase
setState({ phase: "pending", hash });                             // mempool
const receipt = await publicClient.waitForTransactionReceipt({ hash });
receipt.status === "success"
  ? onConfirmed()   // invalidate the affected read queries HERE
  : showRevert();   // mined but reverted — gas was still spent`,
        },
      },
      {
        heading: "Optimistic UI with honest rollback",
        body: [
          "The moment a user submits, update local state to the intended outcome and show a pending indicator tied to the hash — then reconcile on the receipt: confirmed invalidates queries so truth flows from the chain; reverted rolls the optimistic state back visibly. React 19's useOptimistic models exactly this: optimistic value while the async action runs, automatic reversion if it throws.",
          "The rule that keeps optimism honest: never show optimistic state without its pending indicator, and never leave it standing after a revert.",
        ],
      },
      {
        heading: "Live data: choose your poison",
        body: [
          "Polling (useReadContract + refetchInterval) is simple, works everywhere, wastes requests. Event watching (useWatchContractEvent) is push-shaped and carries payloads, but needs filter support and reconnect handling. Both are bounded by block time — the floor no architecture beats. Feeds want events; aggregates want block-time polling; anything query-shaped wants an indexer.",
        ],
      },
    ],
  },
  {
    slug: "deploying-to-testnets",
    lesson: 8,
    title: "Shipping to testnets: Hardhat, Ignition, and verification",
    level: "Intermediate",
    minutes: 20,
    summary:
      "Take the contracts in this repo from `npx hardhat test` to a verified deployment on Sepolia — the full toolchain story interviewers expect you to own.",
    concepts: ["Hardhat 3", "Ignition modules", "faucets & keys", "contract verification", "Hardhat vs Foundry"],
    qaIds: ["hardhat-vs-foundry", "truffle-sunset", "fork-testing", "contract-verification", "why-testnets"],
    sections: [
      {
        heading: "The local loop",
        body: [
          "Development runs against Hardhat's in-process network: instant mining, 20 funded accounts, free do-overs. `npx hardhat test` in contracts/ runs the suite you can read in test/ — deploy, act, assert, including revert and event assertions. This loop is seconds; testnets are minutes; that ordering is the workflow.",
        ],
        code: {
          title: "contracts/ — the commands",
          code: `npx hardhat compile                 # solc 0.8.28, cancun
npx hardhat test                    # 24 tests, in-process EVM
npx hardhat node                    # local chain on :8545
npx hardhat ignition deploy ignition/modules/Curriculum.ts \\
  --network sepolia                 # the real thing`,
        },
      },
      {
        heading: "Ignition: declarative deployments",
        body: [
          "Truffle had imperative 'migrations'; Hardhat Ignition declares a module of contracts and dependencies (DelegateDemo needs DelegateLogic's address) and reconciles it against what's already on-chain — reruns are idempotent, partial failures resume. The Curriculum module in this repo deploys all seven contracts in order.",
          "Keys and RPC URLs come from environment variables via configVariable — lazy, so they're only demanded when a network is actually used, and missing ones fail loudly. The repo's .env.example documents them; the key must be a testnet-only throwaway.",
        ],
      },
      {
        heading: "Verify, then trust",
        body: [
          "After deploying, verification uploads source + compiler settings so the explorer recompiles and matches your bytecode. You get readable source, decoded transactions, and a Read/Write tab on Etherscan — and users get proof the code is what you claim.",
          "Interview corner: know the Truffle story (sunset by Consensys, Dec 2023; migrations → Ignition/forge script, Ganache → hardhat node/anvil) and the Hardhat-vs-Foundry decision (TS-first full-stack repos vs Solidity-native protocol repos; Hardhat 3 runs Solidity tests too; serious teams often run both).",
        ],
      },
    ],
  },
];

export function getTutorial(slug: string): Tutorial | undefined {
  return TUTORIALS.find((t) => t.slug === slug);
}
