# Overview

**Mission:** An interactive learning application that deploys real smart contracts (or generates deploy-ready code) while teaching the web3 concepts behind every step. The end goal for a user is to be able to **pass a senior software engineer web3 interview** — every feature should map to something a senior candidate is expected to explain or demonstrate.

- A application that will deploy web3 smart contract, but at the same time it would teach users how to create smart contracts, what opcodes to use, and deploying smart contracts
- Provide information about the type of different testnet's (Sepolia, Holesky, Polygon Amoy, Base Sepolia, Arbitrum Sepolia — what they're for, how to get faucet funds, chain IDs, block times).
- Techniques on how to handle perceived performance. Such as:
    - Wallet connection using wagmi or other providers.
    - Sign In with Ethereum (SIWE) pattern, and how to implement it in your React applications.
    - Gas Abstractions/UX Friction, estimate transaction fees, and type of ethereum contracts you can use, such as ERC-4337 (account abstraction, paymasters, bundlers).
    - Caching in Web3, using TanStack React Query (query keys per chain+address+block, staleTime tuned to block time, invalidation on confirmation).
    - Optimistic UI — showing things as done when they are not yet confirmed on-chain, with rollback on revert.
- Read vs Writes: reads are free (via RPC `eth_call`), writes cost gas and move through `pending -> confirmed` and can end in `failed/reverted` states.
- Real-time on-chain data is not a normal API. Options: polling (`useReadContract` + `refetchInterval`) or event listening (`useWatchContractEvent`). Both are slower than Web2 real-time — block time (~12s on Ethereum mainnet, ~2s on L2s) is your floor latency.
- Provide advanced opcodes and how they are used (e.g. `DELEGATECALL` for proxies, `CREATE2` for deterministic addresses, `SSTORE`/`SLOAD` gas costs, `STATICCALL`, `SELFDESTRUCT` deprecation, `PUSH0`, transient storage `TSTORE`/`TLOAD`).
- Provide example, runnable tutorials (smart contracts) that deploy contracts to Polygon testnet, Ethereum testnet, and others.
- Provide a Q&A section with senior-level interview questions and model answers (see Reference Patterns below).

## Product Pillars

1. **Learn** — structured tutorials: Solidity basics → EVM/opcodes → deployment → frontend integration → UX patterns.
2. **Do** — every tutorial ends with a real action: compile, deploy to a testnet, read state, send a transaction, watch an event.
3. **Explain** — every action surfaces the "interview answer": *why* it works this way, what the trade-offs are, and how to articulate it.
4. **Drill** — the Q&A section works as flashcard-style interview prep, organized by topic (EVM, gas, auth, UX, data fetching, security).

## Tech Stack

- **Next.js 15 (App Router) + React 19** — the frontend framework. Next (not Vite) because SIWE needs a server: Route Handlers provide the nonce/verify/session endpoints in the same deployable. Function components only; use React 19 idioms (`use`, Actions, `useOptimistic` for optimistic tx UI). All wagmi hooks live in Client Components (`"use client"`); follow wagmi's official Next.js SSR setup (cookie-based storage for hydration).
- **TypeScript** — strict mode; no `any` for chain data — type contract ABIs with `as const` so viem/wagmi infer types end-to-end.
- **wagmi v2 + viem** — wallet connection, contract reads/writes, event watching. viem (not ethers) for all low-level chain access.
- **TanStack React Query** — comes with wagmi; owns all server/chain state. No chain data in `useState`.
- **Hardhat 3** — contract compilation, testing, and deployment (via Hardhat Ignition). Chosen over Foundry because Hardhat 3 is TypeScript-first and uses **viem natively** — tests, deploy scripts, and frontend share one language and one chain library, and artifact types flow straight into the app's ABI registry.
  > Note: **Foundry** is still first-class curriculum content — senior interviews ask about it. Cover `forge test` (Solidity tests), fuzzing, `cast`, and fork testing as taught material, and treat "Hardhat vs Foundry — when and why?" (plus "why was Truffle sunset?") as Q&A topics.
- **Solidity ^0.8.x** — all example contracts; rely on built-in overflow checks, custom errors over `require` strings for gas.
- **SIWE** — `siwe` library + session-based auth for the signed-in experience.
- **Testnets** — Sepolia (Ethereum), Polygon Amoy, plus at least one L2 testnet (Base Sepolia or Arbitrum Sepolia) to teach L1 vs L2 differences.

## Architectural Principles

1. **Chain state is server state.** All on-chain data flows through wagmi/TanStack Query hooks. Never copy chain data into local component state; derive UI from the query cache so invalidation is the single freshness mechanism.
2. **Reads and writes are architecturally separate flows.** Reads: hooks, free, can run on mount/interval. Writes: explicit user-initiated flow with a state machine — `idle → wallet-prompt → pending(txHash) → confirmed | reverted | rejected`. Every write surfaces all of those states in the UI; none may silently fail.
3. **Optimistic by default, honest on failure.** Use `useOptimistic`/query-cache updates the moment a tx is submitted; roll back visibly on revert or rejection. Never show optimistic state without a pending indicator tied to the tx hash.
4. **Block time is the latency floor.** Never poll faster than the target chain's block time. Prefer event subscriptions (`useWatchContractEvent`) over tight polling; when polling, set `refetchInterval` from the chain's block time, not a magic number.
5. **The wallet is untrusted input.** Handle: no wallet installed, wrong chain, account switching mid-session, user rejection. Every write path checks chain ID first and offers a switch-chain prompt.
6. **Never touch real funds.** All deploy targets are testnets. No mainnet RPC writes, no private keys in the repo — keys and RPC URLs come from `.env` (gitignored) and the app must fail loudly if one is missing rather than falling back to a default key.
7. **Teach through the code.** This is a learning app: example contracts and tutorial snippets are product content, not just implementation. They must be idiomatic, commented where a concept is being taught, and every tutorial must be runnable end-to-end as written.
8. **Contracts are versioned artifacts.** ABIs and deployed addresses live in a typed registry (per-chain address map + `as const` ABI). The frontend never hardcodes an address inline.

## Code Patterns

- **Contract interaction:** one custom hook per contract concern (e.g. `useCounterValue`, `useIncrementCounter`), wrapping `useReadContract`/`useWriteContract` + `useWaitForTransactionReceipt`. Components never call wagmi primitives directly.
- **Write flow pattern:** `useWriteContract` → toast/status keyed by tx hash → `useWaitForTransactionReceipt` → on success, `queryClient.invalidateQueries` for the affected reads; on revert, roll back optimistic state and show the decoded revert reason.
- **Query keys:** always include `chainId`, contract `address`, and args — wagmi does this automatically; custom queries must follow the same convention.
- **ABI typing:** ABIs declared `as const` in `src/contracts/<Name>/abi.ts`; addresses in `src/contracts/<Name>/addresses.ts` keyed by chain ID.
- **SIWE:** nonce from a Next.js Route Handler → `signMessage` → verify server-side → httpOnly session cookie. Never verify signatures client-side only; never treat a connected wallet as an authenticated user.
- **Solidity examples:** `// SPDX-License-Identifier: MIT`, pinned `pragma solidity ^0.8.x`, custom errors, events for every state change (so tutorials can demonstrate event listening), NatSpec comments on public functions since they double as teaching material.
- **Tutorial content:** each tutorial is a self-contained unit — concept explainer, annotated contract, deploy steps, frontend integration snippet, and 2–3 linked interview Q&As.
- **Q&A entries:** follow the Reference Patterns format below — realistic senior-level question, first-person model answer that names concrete tools and trade-offs, kept to one tight paragraph.

## SDD and Workflow

### Specification
- Every feature starts as a short spec in `docs/specs/<feature>.md` before any code: user story, what the user learns (which interview question(s) it prepares them for), acceptance criteria, and which chain(s)/contract(s) it touches.
- A spec for a tutorial must name the target testnet, the contract being deployed, and the exact end state ("user has deployed X to Sepolia and can read Y in the UI").
- Specs are cheap and small — one feature, one file, written to be readable by a learner too.

### Technical Planning
- After the spec, write the plan in the same file under a `## Plan` heading: components/hooks to create, contract changes, new dependencies, and which Architectural Principles apply.
- Call out the read/write split explicitly: which data is a read (and its refresh strategy) vs which actions are writes (and their state machine).
- Identify risks: gas estimation edge cases, testnet faucet dependencies, wallet edge cases (wrong chain, rejection).

### Task Breakdown
- Break the plan into tasks that are each independently verifiable, ordered: **contract → deployment (Ignition module) → typed ABI/address registry → hooks → UI → tutorial content → Q&A entries**.
- A task is done only when it can be demonstrated (test passes, contract deploys, UI renders real testnet data) — not when the code compiles.

### Implementation
- Contracts first, with Hardhat tests, before any frontend work depends on them.
- Frontend work follows the Code Patterns above; new patterns must be added to this file when they emerge.
- Every tutorial feature ships with its explainer content and Q&A entries in the same change — the code and the teaching are one deliverable.
- Verify against a live testnet before considering a tutorial complete; a tutorial that only works against a local chain does not meet the spec.
- Keep secrets out of the repo: `.env.example` documents required variables (`RPC_URL_*`, `DEPLOYER_PRIVATE_KEY` for testnet-only throwaway keys).

### Reference Patterns
1) Example Question and Answers:
```text
Q: How would you handle a user action that requires an on-chain transaction, from a UX perspective?


"I'd treat it like an optimistic update — the moment the user submits, I update local state to reflect the intended outcome, show a pending indicator tied to the transaction hash, and only roll back if the transaction fails or reverts. I'd use TanStack Query to manage the read-side cache and invalidate it once the transaction confirms, so the UI never feels frozen waiting on block time."



Q: What's the difference between reading and writing to a smart contract, and how does that affect your frontend architecture?


"Reads are free and synchronous from the UI's perspective — I can call them on load or on interval without user friction. Writes require a wallet signature, cost gas, and are asynchronous with real latency — so I architect those as a distinct flow with explicit pending/success/failure states, usually surfaced via a toast or persistent status indicator rather than blocking the UI."



Q: How do you keep a feed of social content fresh when some of it is on-chain?


"I'd split the data sources — off-chain content (posts, metadata) from a fast API or CMS, on-chain state (likes, ownership, token-gating) fetched separately and cached with a shorter TTL or event-based invalidation. I did something similar with MobX feed stores at AlSaqr, using a predicate map to merge multiple data sources into one coherent feed without re-fetching everything on every update."



Q: What's SIWE and why would you use it over traditional auth?


"Sign-In With Ethereum lets a user prove wallet ownership via a signed message instead of a password — no gas cost, no on-chain transaction. The backend verifies the signature against the wallet address and issues a session token. It fits naturally into a Web3 social app because identity is already tied to the wallet."
```

2) Q&A topic areas to cover (each needs entries in the above format):
- **EVM & opcodes** — storage vs memory vs calldata, `DELEGATECALL` and proxy patterns, `CREATE2`, gas costs of `SSTORE`, why loops over unbounded arrays are dangerous.
- **Gas & transactions** — EIP-1559 (base fee + priority fee), gas estimation and why it fails, nonce management, stuck/replaced transactions.
- **Account abstraction** — EOA vs contract accounts, ERC-4337 flow (UserOperation, bundler, paymaster), what "gasless" UX actually means.
- **Auth & security** — SIWE end-to-end, why signature verification must be server-side, replay attacks and nonces, approval phishing.
- **Frontend data** — wagmi/viem vs ethers, TanStack Query caching strategy for chain data, polling vs event subscriptions, handling reorgs.
- **Tooling** — Hardhat vs Foundry (and why Truffle was sunset), testing strategies (unit vs fuzz vs fork tests), deployment flows (Hardhat Ignition, `forge script`), verifying contracts on Etherscan.
- **Networks** — L1 vs L2 (optimistic vs ZK rollups), testnet landscape, finality differences and what they mean for UX.
