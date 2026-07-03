"use client";

import dynamic from "next/dynamic";
import { GasSkeleton } from "@/components/Skeleton";

// Live meters poll the chain every block — client-only, behind a skeleton.
const GasLivePanel = dynamic(() => import("@/components/gas/GasLivePanel"), {
  ssr: false,
  loading: () => <GasSkeleton />,
});

export default function GasLabPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-white">Gas Lab</h1>
      <p className="mt-2 max-w-2xl text-zinc-400">
        Live EIP-1559 numbers from the connected chain — refreshed every block, because
        that&apos;s the only time they can change.
      </p>

      <div className="mt-6">
        <GasLivePanel />
      </div>

      {/* explainer — static, renders immediately */}
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <div className="card p-5">
          <h3 className="font-semibold text-white">Why base fee moves</h3>
          <p className="mt-2 text-sm leading-relaxed text-zinc-400">
            Blocks target 50% fullness. Above target the base fee rises up to 12.5% per block;
            below it falls. Sustained demand compounds fast — 12.5% per 12s doubles fees in about
            a minute — which is exactly the spike behaviour users see during mints.
          </p>
        </div>
        <div className="card p-5">
          <h3 className="font-semibold text-white">Burned vs paid</h3>
          <p className="mt-2 text-sm leading-relaxed text-zinc-400">
            The base fee is destroyed, not paid to anyone — removing the validator incentive to
            stuff blocks and making ETH supply demand-sensitive. Only the tip goes to the block
            proposer. &ldquo;Who gets the gas fee?&rdquo; is a two-part answer now.
          </p>
        </div>
        <div className="card p-5">
          <h3 className="font-semibold text-white">What your wallet actually sends</h3>
          <p className="mt-2 text-sm leading-relaxed text-zinc-400">
            maxFeePerGas (ceiling) and maxPriorityFeePerGas (tip). Effective price is
            min(maxFee, baseFee + tip); the difference is refunded. A &ldquo;stuck&rdquo;
            transaction usually means maxFee fell below the current base fee — fix by replacing
            with the same nonce and a higher fee.
          </p>
        </div>
      </div>
    </div>
  );
}
