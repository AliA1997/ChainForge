# Spec: ChainForge platform MVP

## User story
As an engineer preparing for a senior web3 interview, I want to deploy real contracts to testnets
while being taught the underlying concepts, so I can answer from experience rather than memory.

## What the user learns (interview questions prepared)
The full Q&A bank (30 entries across 7 topics) — every tutorial links the entries it unlocks.
Anchors: read-vs-write architecture, tx lifecycle/UX, DELEGATECALL/proxies, CREATE2, EIP-1559,
reentrancy, SIWE, Hardhat-vs-Foundry, L1-vs-L2.

## Chains / contracts touched
Sepolia (primary), Polygon Amoy, Base/OP/Arbitrum Sepolia, local Hardhat (31337).
Contracts: Counter, GuestBook, TipJar, Create2Factory, DelegateLogic+DelegateDemo, AssemblyLab.

## Acceptance criteria
- [x] All contracts compile (solc 0.8.28, cancun) and pass their Hardhat test suite (24 tests).
- [x] `npm run export` regenerates the web app's typed ABI/bytecode registry from artifacts.
- [x] User can deploy any curriculum contract from the browser with an injected wallet and then
      read, write (full state machine: wallet → pending → confirmed/reverted/rejected), and watch
      events on their instance. Instances persist per chain in localStorage.
- [x] Every write is simulated before sending; reverts surface as decoded custom-error names.
- [x] 8 tutorials render with code blocks and link to their playground contract and Q&A entries.
- [x] Opcode explorer (40+ entries), testnet directory (6 networks + faucets), live gas lab.
- [x] SIWE: server nonce → wallet signature → server-side verification → httpOnly session,
      all in-memory, no DB.
- [x] `next build` completes cleanly.

## Out of scope (per product owner)
Username/password/OAuth auth, Playwright/e2e tests, any database.

## Plan
Monorepo-lite: `contracts/` (Hardhat 3 ESM workspace) and `web/` (Next.js 15) with a one-way
artifact export script bridging them. Read/write split per the constitution: reads via
publicClient/eth_call (auto-refetch on confirmation), writes via useTxFlow state machine.
Risks handled: public-RPC eth_getLogs caps (bounded 10k-block lookback), wallet edge cases
(ConnectGate, chain switcher, rejection as first-class state), no-DB SIWE (globalThis store,
documented single-process caveat).
