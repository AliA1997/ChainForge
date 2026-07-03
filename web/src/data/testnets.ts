export interface TestnetInfo {
  id: number;
  name: string;
  parent: string;
  kind: "L1" | "Optimistic rollup" | "ZK-adjacent L2" | "Sidechain-style PoS";
  currency: string;
  blockTimeSeconds: number;
  rpc: string;
  explorer: string;
  faucets: { name: string; url: string }[];
  notes: string;
}

export const TESTNETS: TestnetInfo[] = [
  {
    id: 11155111,
    name: "Sepolia",
    parent: "Ethereum",
    kind: "L1",
    currency: "SepoliaETH",
    blockTimeSeconds: 12,
    rpc: "https://ethereum-sepolia-rpc.publicnode.com",
    explorer: "https://sepolia.etherscan.io",
    faucets: [
      { name: "Google Cloud faucet", url: "https://cloud.google.com/application/web3/faucet/ethereum/sepolia" },
      { name: "Alchemy faucet", url: "https://www.alchemy.com/faucets/ethereum-sepolia" },
    ],
    notes:
      "The default Ethereum testnet for application development. Same 12s block time and EIP-1559 fee market as mainnet, so gas UX you build here transfers directly. Holesky/Hoodi exist too, but they target validator/staking testing, not dapps.",
  },
  {
    id: 80002,
    name: "Polygon Amoy",
    parent: "Polygon PoS",
    kind: "Sidechain-style PoS",
    currency: "POL",
    blockTimeSeconds: 2,
    rpc: "https://rpc-amoy.polygon.technology",
    explorer: "https://amoy.polygonscan.com",
    faucets: [{ name: "Polygon faucet", url: "https://faucet.polygon.technology" }],
    notes:
      "Replaced Mumbai in 2024. Polygon PoS is technically its own EVM chain with checkpoints to Ethereum, not a rollup — a distinction interviewers like. ~2s blocks make it feel dramatically faster than Sepolia.",
  },
  {
    id: 84532,
    name: "Base Sepolia",
    parent: "Base (Coinbase, OP Stack)",
    kind: "Optimistic rollup",
    currency: "ETH",
    blockTimeSeconds: 2,
    rpc: "https://sepolia.base.org",
    explorer: "https://sepolia.basescan.org",
    faucets: [
      { name: "Coinbase faucet", url: "https://portal.cdp.coinbase.com/products/faucet" },
      { name: "Alchemy faucet", url: "https://www.alchemy.com/faucets/base-sepolia" },
    ],
    notes:
      "An OP Stack rollup: transactions execute on L2, data posts to Sepolia L1 in blobs. Fees have two parts — L2 execution plus L1 data — which is why estimates look odd compared with plain L1 gas math.",
  },
  {
    id: 421614,
    name: "Arbitrum Sepolia",
    parent: "Arbitrum One",
    kind: "Optimistic rollup",
    currency: "ETH",
    blockTimeSeconds: 1,
    rpc: "https://sepolia-rollup.arbitrum.io/rpc",
    explorer: "https://sepolia.arbiscan.io",
    faucets: [{ name: "Alchemy faucet", url: "https://www.alchemy.com/faucets/arbitrum-sepolia" }],
    notes:
      "Arbitrum Nitro rollup: sub-second soft-confirmation from the sequencer, full L1 finality later. A good chain for demonstrating the 'confirmed vs finalized' distinction in interviews.",
  },
  {
    id: 11155420,
    name: "OP Sepolia",
    parent: "Optimism (OP Stack)",
    kind: "Optimistic rollup",
    currency: "ETH",
    blockTimeSeconds: 2,
    rpc: "https://sepolia.optimism.io",
    explorer: "https://sepolia-optimism.etherscan.io",
    faucets: [{ name: "Superchain faucet", url: "https://console.optimism.io/faucet" }],
    notes:
      "The original OP Stack testnet. Behaviourally identical to Base Sepolia — same stack — which itself is a teaching point: the 'Superchain' is many chains sharing one codebase.",
  },
  {
    id: 31337,
    name: "Hardhat (local)",
    parent: "Your machine",
    kind: "L1",
    currency: "ETH",
    blockTimeSeconds: 0,
    rpc: "http://127.0.0.1:8545",
    explorer: "",
    faucets: [],
    notes:
      "Run `npx hardhat node` in contracts/ for an instant-mining local chain with 20 funded accounts. Perfect for development loops — but a tutorial only counts as complete when it also runs on a public testnet.",
  },
];
