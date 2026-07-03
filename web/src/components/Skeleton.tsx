"use client";

import { useEffect, useState } from "react";

export function Shimmer({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-zinc-800/80 ${className}`} />;
}

export const LAST_WALLET_KEY = "chainforge.wallet.last";

interface LastWallet {
  address: string;
  chainName?: string;
}

/**
 * Placeholder for the lazily-loaded WalletButton. If we've seen a connected
 * wallet before, render its address as the "previous state" so the header
 * doesn't flash Connect → address on every navigation. Read in an effect
 * (not during render) so server HTML and first client paint match.
 */
export function WalletButtonSkeleton() {
  const [last, setLast] = useState<LastWallet | null>(null);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(LAST_WALLET_KEY);
      if (raw) setLast(JSON.parse(raw) as LastWallet);
    } catch {
      // corrupted entry — keep the generic placeholder
    }
  }, []);

  if (last?.address) {
    return (
      <div className="btn-ghost pointer-events-none animate-pulse font-mono text-xs opacity-70">
        <span className="h-2 w-2 rounded-full bg-zinc-600" />
        {last.chainName ? `${last.chainName} · ` : ""}
        {last.address.slice(0, 6)}…{last.address.slice(-4)}
      </div>
    );
  }
  return <Shimmer className="h-9 w-36" />;
}

/** Mirrors the ContractLab layout: deploy/instances rail + interact panel. */
export function LabSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,340px)_1fr]">
      <div className="space-y-4">
        <div className="card space-y-3 p-4">
          <Shimmer className="h-4 w-2/3" />
          <Shimmer className="h-8 w-full" />
          <Shimmer className="h-9 w-full" />
        </div>
        <div className="card space-y-3 p-4">
          <Shimmer className="h-4 w-1/2" />
          <Shimmer className="h-8 w-full" />
        </div>
      </div>
      <div className="space-y-4">
        <Shimmer className="h-12 w-full" />
        <Shimmer className="h-9 w-2/3" />
        <div className="card space-y-3 p-4">
          <Shimmer className="h-5 w-1/3" />
          <Shimmer className="h-9 w-full" />
        </div>
        <div className="card space-y-3 p-4">
          <Shimmer className="h-5 w-1/4" />
          <Shimmer className="h-9 w-full" />
        </div>
      </div>
    </div>
  );
}

/** Mirrors the Gas Lab live section: three stat cards + estimator table. */
export function GasSkeleton() {
  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="card space-y-2 p-5">
            <Shimmer className="h-3 w-1/2" />
            <Shimmer className="h-8 w-2/3" />
            <Shimmer className="h-3 w-full" />
          </div>
        ))}
      </div>
      <div className="card mt-8 space-y-3 p-5">
        <Shimmer className="h-5 w-1/3" />
        {[0, 1, 2, 3, 4].map((i) => (
          <Shimmer key={i} className="h-9 w-full" />
        ))}
      </div>
    </div>
  );
}

/** Mirrors the SIWE auth card. */
export function SiweSkeleton() {
  return (
    <div className="card space-y-4 p-6">
      <Shimmer className="h-4 w-3/4" />
      <Shimmer className="h-4 w-1/2" />
      <Shimmer className="h-10 w-48" />
    </div>
  );
}
