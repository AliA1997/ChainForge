"use client";

import { useState } from "react";
import { useAccount, useBlock, useEstimateFeesPerGas } from "wagmi";
import { formatEther } from "viem";
import { formatGwei } from "@/lib/format";

const OPERATIONS = [
  { name: "ETH transfer", gas: 21_000n, note: "the protocol minimum — no code runs" },
  { name: "Counter.increment()", gas: 45_000n, note: "one warm SSTORE + one LOG (Lesson 1)" },
  { name: "ERC-20 transfer", gas: 65_000n, note: "two balance slots + event" },
  { name: "ERC-20 approve", gas: 46_000n, note: "one allowance slot + event" },
  { name: "NFT mint", gas: 150_000n, note: "ownership + balance + metadata writes" },
  { name: "DEX swap", gas: 185_000n, note: "multiple pools/slots touched" },
  { name: "Deploy GuestBook", gas: 700_000n, note: "32k base + ~200 gas per bytecode byte" },
];

/** The live half of the Gas Lab — lazy-loaded client-only (wagmi + per-block polling). */
export default function GasLivePanel() {
  const { chain } = useAccount();
  const { data: block } = useBlock({ watch: true });
  const { data: fees } = useEstimateFeesPerGas();
  const [ethPrice, setEthPrice] = useState("3000");

  const baseFee = block?.baseFeePerGas ?? null;
  const maxFee = fees?.maxFeePerGas ?? null;
  const tip = fees?.maxPriorityFeePerGas ?? null;
  const effective = baseFee !== null && tip !== null ? baseFee + tip : maxFee;
  const price = Number.parseFloat(ethPrice) || 0;

  return (
    <div>
      <p className="mb-4 text-xs text-zinc-500">
        Watching {chain?.name ?? "Sepolia (connect a wallet to switch chains)"} — values update
        once per block.
      </p>

      {/* live meters */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="card p-5">
          <p className="text-xs uppercase tracking-wide text-zinc-500">Base fee (burned)</p>
          <p className="mt-1 font-mono text-2xl font-bold text-white">
            {baseFee !== null ? `${formatGwei(baseFee)} gwei` : "…"}
          </p>
          <p className="mt-1 text-xs text-zinc-500">
            set by protocol from block fullness — block{" "}
            <span className="font-mono">{block?.number?.toString() ?? "…"}</span>
          </p>
        </div>
        <div className="card p-5">
          <p className="text-xs uppercase tracking-wide text-zinc-500">Priority fee (tip)</p>
          <p className="mt-1 font-mono text-2xl font-bold text-white">
            {tip !== null ? `${formatGwei(tip)} gwei` : "…"}
          </p>
          <p className="mt-1 text-xs text-zinc-500">what you bid to the validator for inclusion</p>
        </div>
        <div className="card p-5">
          <p className="text-xs uppercase tracking-wide text-zinc-500">Wallet max fee</p>
          <p className="mt-1 font-mono text-2xl font-bold text-white">
            {maxFee !== null ? `${formatGwei(maxFee)} gwei` : "…"}
          </p>
          <p className="mt-1 text-xs text-zinc-500">
            ceiling — unused headroom is refunded, effective = min(max, base + tip)
          </p>
        </div>
      </div>

      {/* estimator */}
      <div className="card mt-8 overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 p-4">
          <h2 className="font-semibold text-white">What would it cost right now?</h2>
          <label className="flex items-center gap-2 text-sm text-zinc-400">
            Assume ETH = $
            <input
              className="input w-24"
              value={ethPrice}
              onChange={(e) => setEthPrice(e.target.value)}
              inputMode="decimal"
            />
          </label>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800 text-left text-xs uppercase tracking-wide text-zinc-500">
                <th className="p-3">Operation</th>
                <th className="p-3">Gas units</th>
                <th className="p-3">Cost (ETH)</th>
                <th className="p-3">Cost (USD)</th>
              </tr>
            </thead>
            <tbody>
              {OPERATIONS.map((op) => {
                const costWei = effective !== null ? op.gas * effective : null;
                const costEth = costWei !== null ? Number(formatEther(costWei)) : null;
                return (
                  <tr key={op.name} className="border-b border-zinc-800/60">
                    <td className="p-3">
                      <span className="text-zinc-100">{op.name}</span>
                      <span className="block text-xs text-zinc-500">{op.note}</span>
                    </td>
                    <td className="p-3 font-mono text-zinc-300">{op.gas.toLocaleString()}</td>
                    <td className="p-3 font-mono text-zinc-300">
                      {costEth !== null ? costEth.toFixed(8) : "…"}
                    </td>
                    <td className="p-3 font-mono text-emerald-300">
                      {costEth !== null ? `$${(costEth * price).toFixed(4)}` : "…"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="p-4 text-xs leading-relaxed text-zinc-500">
          cost = gas units × (base fee + tip). Gas units measure work and are identical on every
          EVM chain — the price per unit is what differs between L1 and L2. On OP-Stack chains an
          additional L1 data fee applies that this table doesn&apos;t show — a good interview detail.
        </p>
      </div>
    </div>
  );
}
