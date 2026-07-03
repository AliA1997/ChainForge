# ChainForge — learn web3 by deploying it

A learning platform wrapped around real smart contracts. Work through eight lessons, deploy the
contracts to public testnets with your own wallet, explore the EVM opcode by opcode, and drill
senior-interview Q&A until you can deliver the answers cold.

**Testnets only. Never use a private key that has ever held real funds.**

## Layout

```
contracts/   Hardhat 3 + Solidity 0.8.28 (cancun) — 6 teaching contracts, 24 tests, Ignition deploys
web/         Next.js 15 + React 19 + wagmi v2 + viem + TanStack Query — the app
docs/specs/  Feature specs (SDD workflow — see CLAUDE.md)
```

## Quick start

```bash
# 1. contracts: compile, test, export ABIs to the web app
cd contracts
npm install
npx hardhat compile
npx hardhat test          # 24 passing
npm run export            # writes web/src/contracts/generated/

# 2. web app
cd ../web
npm install
npm run dev               # http://localhost:3000
```

Connect MetaMask (or any injected wallet), switch to Sepolia, grab faucet ETH
(see the in-app Testnets page), and start Lesson 1.

### Optional: local chain

```bash
cd contracts
npx hardhat node          # chain id 31337 on :8545, 20 funded accounts
```

The web app already includes Hardhat (31337) in its chain list — point MetaMask at
`http://127.0.0.1:8545` for instant, free iteration.

### Optional: deploy the curriculum yourself

```bash
cd contracts
cp .env.example .env      # fill in RPC URL + a TESTNET-ONLY throwaway key
npm run deploy:sepolia    # Hardhat Ignition, idempotent
```

## What's inside

| Piece | What it teaches |
| --- | --- |
| `Counter.sol` | state, events, custom errors, access control |
| `GuestBook.sol` | storage vs memory vs calldata, struct packing, pagination, unbounded-array DoS |
| `TipJar.sol` | payable, receive(), checks-effects-interactions, reentrancy guard |
| `Create2Factory.sol` | CREATE2, deterministic/counterfactual addresses |
| `DelegateLogic/DelegateDemo.sol` | DELEGATECALL context, storage-layout collisions, proxies |
| `AssemblyLab.sol` | inline assembly: SLOAD, EXTCODESIZE, CHAINID, gas measurement, TSTORE/TLOAD |
| Playground | deploy + generic ABI-driven read/write/event explorer for all of the above |
| Gas Lab | live EIP-1559 base fee/tip + what-would-it-cost table |
| Opcode Explorer | 40+ opcodes with gas costs and where they bite in production |
| Testnet Directory | Sepolia, Amoy, Base/OP/Arbitrum Sepolia — faucets, chain ids, block times |
| SIWE demo | full EIP-4361 flow against in-memory Next.js route handlers |
| Q&A Drill | 30 senior-interview questions with first-person model answers + flashcards |

No database, no traditional auth, no e2e suite — state lives in memory, localStorage, and on-chain.
