export type QaTopic =
  | "EVM & opcodes"
  | "Gas & transactions"
  | "Account abstraction"
  | "Auth & security"
  | "Frontend data"
  | "Tooling"
  | "Networks";

export interface QaEntry {
  id: string;
  topic: QaTopic;
  question: string;
  answer: string;
}

export const QA_TOPICS: QaTopic[] = [
  "EVM & opcodes",
  "Gas & transactions",
  "Account abstraction",
  "Auth & security",
  "Frontend data",
  "Tooling",
  "Networks",
];

export const QA_ENTRIES: QaEntry[] = [
  // ——— Frontend data (includes the four reference answers from the constitution) ———
  {
    id: "tx-ux",
    topic: "Frontend data",
    question:
      "How would you handle a user action that requires an on-chain transaction, from a UX perspective?",
    answer:
      "I'd treat it like an optimistic update — the moment the user submits, I update local state to reflect the intended outcome, show a pending indicator tied to the transaction hash, and only roll back if the transaction fails or reverts. I'd use TanStack Query to manage the read-side cache and invalidate it once the transaction confirms, so the UI never feels frozen waiting on block time.",
  },
  {
    id: "read-vs-write",
    topic: "Frontend data",
    question:
      "What's the difference between reading and writing to a smart contract, and how does that affect your frontend architecture?",
    answer:
      "Reads are free and synchronous from the UI's perspective — I can call them on load or on interval without user friction. Writes require a wallet signature, cost gas, and are asynchronous with real latency — so I architect those as a distinct flow with explicit pending/success/failure states, usually surfaced via a toast or persistent status indicator rather than blocking the UI.",
  },
  {
    id: "mixed-feed",
    topic: "Frontend data",
    question: "How do you keep a feed of social content fresh when some of it is on-chain?",
    answer:
      "I'd split the data sources — off-chain content (posts, metadata) from a fast API or CMS, on-chain state (likes, ownership, token-gating) fetched separately and cached with a shorter TTL or event-based invalidation. Merging happens client-side so an on-chain refresh never forces a full feed re-fetch.",
  },
  {
    id: "polling-vs-events",
    topic: "Frontend data",
    question: "Polling versus event subscriptions for live on-chain data — how do you choose?",
    answer:
      "Polling with useReadContract plus refetchInterval is simple and works on any RPC, but wastes requests when nothing changes. useWatchContractEvent reacts only when something happens and carries the event payload, but needs filter or websocket support and you must handle missed logs after reconnects. My default: events for activity feeds, polling at roughly the chain's block time for aggregate values, and always invalidating reads when my own transaction confirms. Neither beats block time — that's the floor.",
  },
  {
    id: "query-keys",
    topic: "Frontend data",
    question: "How do you structure TanStack Query caching for chain data?",
    answer:
      "Every query key includes chainId, contract address, function, and args — wagmi does this automatically — so switching networks or accounts can never serve stale cross-chain data. staleTime is tuned to block time: there is no point refetching an L1 value every second when state can only change every 12. Writes don't set the cache directly; they invalidate the affected keys after the receipt confirms, so the chain remains the single source of truth.",
  },
  {
    id: "reorgs",
    topic: "Frontend data",
    question: "What is a reorg and how should a frontend deal with it?",
    answer:
      "A reorg is the chain replacing recent blocks with a heavier competing branch, so a transaction that was 'confirmed' can briefly disappear. For most UX, one confirmation plus optimistic UI is fine, but for high-value actions I wait more confirmations or check finality (safe/finalized block tags). Practically: treat receipts near the head as provisional, re-verify on the finalized tag before triggering anything irreversible like crediting a purchase.",
  },

  // ——— EVM & opcodes ———
  {
    id: "storage-memory-calldata",
    topic: "EVM & opcodes",
    question: "Explain storage vs memory vs calldata, and the gas implications.",
    answer:
      "Storage is the contract's persistent key-value store of 32-byte slots — by far the most expensive (a cold SSTORE to a fresh slot is 20k+ gas, a cold SLOAD ~2100). Memory is a transient byte array per call, cheap but wiped afterwards, with cost growing quadratically at large sizes. Calldata is the read-only transaction input — the cheapest place for data because it's never copied unless you ask. Rule of thumb: function args you only read should be calldata, working values memory, and storage touched as few times as possible — cache reads in a local variable.",
  },
  {
    id: "delegatecall",
    topic: "EVM & opcodes",
    question: "What does DELEGATECALL do and why is it central to proxies?",
    answer:
      "DELEGATECALL executes another contract's code in the caller's context: the caller's storage, address, and balance, with msg.sender and msg.value preserved from the original call. That's exactly what an upgradeable proxy needs — the proxy holds state and delegates every call to an implementation whose code can be swapped. The danger is that storage is addressed by slot number, not name, so proxy and implementation must agree on layout; a mismatched upgrade silently corrupts state. That's why upgrade tooling validates layouts and why patterns like EIP-1967 pin proxy metadata to hashed slots.",
  },
  {
    id: "create2",
    topic: "EVM & opcodes",
    question: "CREATE vs CREATE2 — what's the difference and when does CREATE2 matter?",
    answer:
      "CREATE derives the new address from the deployer's address and nonce, so it depends on deployment order. CREATE2 uses keccak256(0xff, deployer, salt, keccak256(initCode)) — fully deterministic and order-independent. That enables counterfactual deployment: you can compute an address, let users receive funds at it, and only deploy the code when it's first needed — which is exactly how ERC-4337 smart accounts hand out wallet addresses that don't exist on-chain yet.",
  },
  {
    id: "private-storage",
    topic: "EVM & opcodes",
    question: "Is `private` state actually private on-chain?",
    answer:
      "No. `private` only prevents other contracts from calling a getter and stops Solidity generating one — the data still sits in a public storage slot anyone can read with eth_getStorageAt or an SLOAD probe. Secrets must never go on-chain in plaintext; you either keep them off-chain, commit to hashes, or use encryption where only ciphertext is stored. A good follow-up to volunteer: the same applies to 'hidden' NFT metadata and unrevealed random seeds.",
  },
  {
    id: "unbounded-loops",
    topic: "EVM & opcodes",
    question: "Why are loops over unbounded arrays dangerous in a contract?",
    answer:
      "Gas per iteration is roughly constant but array growth is unbounded, so eventually the function exceeds the block gas limit and becomes permanently uncallable — a self-inflicted denial of service. Classic victims are 'pay all holders' loops and view functions returning whole arrays. Fixes: paginate reads with offset/limit, convert push-payments into pull-payments (each user withdraws their own share), and cap anything users can grow.",
  },
  {
    id: "transient-storage",
    topic: "EVM & opcodes",
    question: "What is transient storage (EIP-1153) and what is it good for?",
    answer:
      "TSTORE/TLOAD, added in Cancun, give storage that persists across calls within one transaction and clears automatically at its end, at ~100 gas instead of SSTORE's thousands. The flagship use is reentrancy locks: the lock only needs to live for one transaction, so paying persistent-storage prices for it was pure waste. The caveat interviewers want: it survives across the whole transaction, not just one call frame, so reads in later invocations within the same tx can see leftovers unless you clear them.",
  },

  // ——— Gas & transactions ———
  {
    id: "eip1559",
    topic: "Gas & transactions",
    question: "Explain EIP-1559: base fee, priority fee, and maxFeePerGas.",
    answer:
      "Every block has a protocol-set base fee that rises when blocks are over half full and falls when they're under — it's burned, not paid to validators. Users add a priority fee (tip) to incentivise inclusion, and set maxFeePerGas as a ceiling; the effective price is min(maxFee, baseFee + tip) and anything unused is refunded. For UX this made fees predictable: wallets estimate baseFee's near-term trajectory instead of blind first-price auctions. When users complain a tx is stuck, it's usually maxFee below the current base fee.",
  },
  {
    id: "gas-estimation-fails",
    topic: "Gas & transactions",
    question: "Why does gas estimation sometimes fail, and what do you do about it?",
    answer:
      "eth_estimateGas simulates the transaction against current state — if the call would revert (insufficient allowance, failed require, wrong phase), estimation itself fails. That's a feature: I simulate before sending so users see 'this will revert: NotOwner' instead of paying for a failed transaction. Estimates can also go stale when state changes between estimate and inclusion, so wallets pad the limit. On OP-Stack L2s the quoted cost also includes an L1 data component that plain gasLimit × gasPrice math misses.",
  },
  {
    id: "nonces-stuck",
    topic: "Gas & transactions",
    question: "How do nonces work and how do you rescue a stuck transaction?",
    answer:
      "Every account transaction carries a strictly sequential nonce; the network processes them in order, so one underpriced transaction blocks everything behind it. To rescue, you replace it: send a new transaction with the same nonce and a fee bumped ~10%+ — either the real payload repriced, or a zero-value self-transfer to cancel. Frontends should surface 'speed up / cancel' rather than letting users mash the button, which just queues more stuck nonces.",
  },
  {
    id: "tx-lifecycle",
    topic: "Gas & transactions",
    question: "Walk through a transaction's lifecycle from click to finality.",
    answer:
      "The dapp builds the request and the wallet signs it; it enters the mempool as pending, where fee level decides inclusion order. A block producer includes it, execution either succeeds or reverts — reverted transactions are still mined and still cost gas, which surprises users. Then confirmations accumulate; on Ethereum, finality arrives via consensus checkpoints (the finalized tag, ~13 minutes), while rollups add their own sequencer-instant vs L1-final distinction. My UI states map to exactly these phases: signing → pending(hash) → confirmed → (optionally) finalized, plus reverted and replaced.",
  },

  // ——— Account abstraction ———
  {
    id: "eoa-vs-contract",
    topic: "Account abstraction",
    question: "What's the difference between an EOA and a contract account?",
    answer:
      "An EOA is a keypair: it holds no code, and a valid secp256k1 signature is the only authorisation logic it can ever have. A contract account is code — it can enforce arbitrary rules (multisig, spending limits, session keys, social recovery) but historically couldn't initiate transactions; something with a key had to poke it. Account abstraction (ERC-4337, and EIP-7702 giving EOAs temporary code) exists precisely to close that gap.",
  },
  {
    id: "erc4337-flow",
    topic: "Account abstraction",
    question: "Describe the ERC-4337 flow: UserOperation, bundler, EntryPoint, paymaster.",
    answer:
      "The user signs a UserOperation — a pseudo-transaction — into an alternative mempool. A bundler collects UserOps, wraps them in one real transaction, and calls the global EntryPoint contract, which asks each smart account to validate its op (any logic: passkeys, multisig) and then executes it. A paymaster can step in during validation to sponsor gas — that's how 'gasless' UX works: someone still pays, just not the user. It's all done in contracts and infra, with no consensus change needed.",
  },
  {
    id: "gasless-ux",
    topic: "Account abstraction",
    question: "A PM asks for 'no gas fees in our app'. What are your options?",
    answer:
      "Three levels. Cheapest: reduce perceived friction — batch approvals, use permit signatures, move to an L2 where fees are cents. Real sponsorship: ERC-4337 paymasters covering gas for allow-listed operations, with rate limits so you don't fund a spam faucet. Legacy: meta-transactions (ERC-2771 relayers), still fine for single contracts you control. I'd also push back gently on scope: sponsor onboarding and first actions, not every transaction forever, because paymaster spend is a real budget line.",
  },
  {
    id: "eip7702",
    topic: "Account abstraction",
    question: "What does EIP-7702 add on top of ERC-4337?",
    answer:
      "7702 (Pectra, 2025) lets an EOA delegate to contract code via a special transaction type, so an existing key-based account can temporarily behave like a smart account — batching, sponsorship, session keys — without migrating assets to a new address. It complements 4337 rather than replacing it: 4337 defines the smart-account rails (EntryPoint, bundlers, paymasters); 7702 lets a billion existing EOAs ride them. For UX it means features like one-click approve-and-swap for MetaMask users.",
  },

  // ——— Auth & security ———
  {
    id: "siwe",
    topic: "Auth & security",
    question: "What's SIWE and why would you use it over traditional auth?",
    answer:
      "Sign-In With Ethereum lets a user prove wallet ownership via a signed message instead of a password — no gas cost, no on-chain transaction. The backend verifies the signature against the wallet address and issues a session token. It fits naturally into a web3 app because identity is already tied to the wallet.",
  },
  {
    id: "siwe-server-side",
    topic: "Auth & security",
    question: "Why must SIWE verification happen server-side, and what stops replay attacks?",
    answer:
      "The signature only proves key ownership to whoever verifies it — if the client just tells your API 'I verified it', anyone can lie with a curl request. So the server issues a random single-use nonce, the EIP-4361 message embeds it along with the domain, chain id, and expiry, and the server verifies the signature and burns the nonce before creating a session. The nonce kills replays, the domain binding kills phishing sites re-using signatures, and the chain id stops cross-chain reuse.",
  },
  {
    id: "reentrancy",
    topic: "Auth & security",
    question: "Explain reentrancy and how you prevent it.",
    answer:
      "When a contract sends ETH or calls an external contract, that contract's code runs and can call back in before the first invocation finished — if state wasn't updated yet, it can drain funds by re-entering repeatedly (the DAO hack). Defences layer up: checks-effects-interactions ordering so state is settled before any external call, pull-payments instead of push, and an explicit reentrancy lock — classically a storage flag, in modern code a transient-storage lock at a fraction of the gas. I'd mention that read-only reentrancy against view functions consumed by other protocols is the trendy variant interviewers probe.",
  },
  {
    id: "connected-not-authed",
    topic: "Auth & security",
    question: "Is a connected wallet an authenticated user?",
    answer:
      "No — connection just means the site can see an address; any frontend can claim any address, and eth_accounts is spoofable by the client anyway. Authentication requires proof of key control, which is what the SIWE signature provides, verified server-side and exchanged for a session. The practical consequence: gate server data by session, never by the address the client sends you, and treat wallet connection purely as a UX state.",
  },
  {
    id: "approval-phishing",
    topic: "Auth & security",
    question: "What is approval phishing and how should apps mitigate it?",
    answer:
      "ERC-20 approve and NFT setApprovalForAll grant a spender ongoing rights over assets — scammers trick users into signing approvals (or Permit2 signatures) to attacker addresses, then drain at leisure. As builders: request the minimum allowance rather than infinite where practical, display exactly what's being approved in plain language, support revocation, and never normalise blind signing of opaque hex. Wallet-side simulation (showing predicted asset changes) is the industry's main answer; your dapp should be legible to it.",
  },

  // ——— Tooling ———
  {
    id: "hardhat-vs-foundry",
    topic: "Tooling",
    question: "Hardhat vs Foundry — when would you pick each?",
    answer:
      "Foundry is Rust-fast with tests written in Solidity — ideal for protocol teams: fuzzing, invariants, and gas snapshots are first-class citizens. Hardhat is TypeScript-first, which wins when the same team ships the frontend: tests and deploy scripts share types and a viem client with the app, and Hardhat 3 narrowed the gap by adopting Solidity tests and a Rust rewrite. My honest answer: full-stack product repo → Hardhat; contracts-only protocol repo → Foundry; many serious teams run both.",
  },
  {
    id: "truffle-sunset",
    topic: "Tooling",
    question: "Why was Truffle sunset, and what replaced it?",
    answer:
      "Consensys sunset Truffle and Ganache in late 2023 after the ecosystem had already moved: Hardhat offered better TypeScript integration, plugins, and console.log debugging, and then Foundry raised the bar on speed and testing rigour. Migration-wise, Truffle migrations map to Hardhat Ignition modules or forge scripts, and Ganache to the built-in Hardhat/anvil nodes. Naming Truffle as your current toolchain in an interview signals a stale stack — knowing why it lost is the useful part.",
  },
  {
    id: "fork-testing",
    topic: "Tooling",
    question: "What is fork testing and when do you reach for it?",
    answer:
      "Both Hardhat and anvil can fork a live network at a block: your tests run locally but against real deployed state — real Uniswap pools, real token balances via impersonated whale accounts. It's how you test integrations you don't control without redeploying half of DeFi as mocks. Trade-offs: RPC-bound and slower, snapshot the block for determinism, and remember forked state goes stale — good CI pins the fork block and refreshes it deliberately.",
  },
  {
    id: "contract-verification",
    topic: "Tooling",
    question: "What does verifying a contract on Etherscan actually do?",
    answer:
      "Verification uploads your source and compiler settings so the explorer can recompile and match the on-chain bytecode — proving the source corresponds to what's deployed. Users get readable code and a Read/Write UI instead of raw hex; integrators get the ABI. It matters for trust (unverified contracts read as red flags) and for your own debugging, since explorers can then decode reverts and events. Toolchains automate it: hardhat verify or forge's --verify flag straight from CI.",
  },

  // ——— Networks ———
  {
    id: "l1-vs-l2",
    topic: "Networks",
    question: "Explain optimistic rollups vs ZK rollups at interview depth.",
    answer:
      "Both execute transactions off L1 and post data to it, inheriting Ethereum's data availability. Optimistic rollups (Arbitrum, OP Stack) assume batches are valid and allow a ~7-day fraud-proof window — cheap and EVM-equivalent, but native withdrawals are slow, hence bridge liquidity providers. ZK rollups (zkSync, Scroll, Linea) post validity proofs, so L1-verified finality in hours or minutes and no challenge window, at the cost of prover complexity. For app UX on either: users see ~1–2s sequencer confirmation; the L1-finality distinction only matters for bridges and high-value settlement.",
  },
  {
    id: "confirmed-vs-finalized",
    topic: "Networks",
    question: "What's the difference between 'confirmed' and 'finalized'?",
    answer:
      "Confirmed means included in a block near the head — visible but theoretically revertible by a reorg. Finalized on post-merge Ethereum means two-thirds of validators attested through consensus checkpoints (~13 minutes); reverting it would require burning a third of staked ETH. RPCs expose this directly as block tags: latest vs safe vs finalized. In apps, I render at latest for responsiveness and gate irreversible side effects (fulfilment, off-chain credit) on finalized or N confirmations proportional to value.",
  },
  {
    id: "block-time-floor",
    topic: "Networks",
    question: "Why can't on-chain apps feel like Web2 real-time, and what do you do about it?",
    answer:
      "State only changes when a block is produced — every 12s on Ethereum L1, ~1–2s on major L2s — so that's the hard latency floor for reads reflecting new writes; no amount of polling beats it. The playbook: optimistic UI for the user's own actions, event subscriptions rather than tight polling for everyone else's, an indexer for anything query-shaped, and honest pending states. Choosing an L2 is itself a UX decision: 2-second blocks make optimistic UI nearly invisible.",
  },
  {
    id: "why-testnets",
    topic: "Networks",
    question: "How do testnets differ from mainnet, and what are the gotchas?",
    answer:
      "Same protocol, valueless currency from faucets — but the differences bite: less validator weight (testnets historically get reorged and even deprecated — Goerli, Mumbai), empty mempools that make gas estimation unrealistically forgiving, and third-party contracts that may not be deployed there. So testnets prove correctness, not economics. Teams graduate to mainnet-fork testing for realistic state, and some run 'dark launches' on mainnet with feature flags because only mainnet has real MEV and congestion.",
  },
];
