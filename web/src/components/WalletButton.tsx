"use client";

import { useState } from "react";
import {
  useAccount,
  useChains,
  useConnect,
  useDisconnect,
  useSwitchChain,
} from "wagmi";
import { shortAddress } from "@/lib/format";
import type { AppConfig } from "@/lib/wagmi";

type ChainId = AppConfig["chains"][number]["id"];

/**
 * Wallet connect + chain switcher. Handles the four wallet states the
 * constitution requires: no wallet installed, disconnected, wrong/unknown
 * chain, and connected.
 */
export function WalletButton() {
  const { address, chainId, isConnected } = useAccount();
  const { connect, connectors, isPending: connecting } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain, isPending: switching } = useSwitchChain();
  const chains = useChains();
  const [menuOpen, setMenuOpen] = useState(false);

  if (!isConnected || !address) {
    const injectedConnector = connectors[0];
    return (
      <button
        className="btn-primary"
        disabled={connecting || !injectedConnector}
        onClick={() => injectedConnector && connect({ connector: injectedConnector })}
        title={!injectedConnector ? "No injected wallet found — install MetaMask" : undefined}
      >
        {connecting ? "Connecting…" : "Connect Wallet"}
      </button>
    );
  }

  const activeChain = chains.find((c) => c.id === chainId);

  return (
    <div className="relative">
      <button className="btn-ghost font-mono text-xs" onClick={() => setMenuOpen((open) => !open)}>
        <span
          className={`h-2 w-2 rounded-full ${activeChain ? "bg-emerald-500" : "bg-amber-500"}`}
        />
        {activeChain?.name ?? "Unsupported chain"} · {shortAddress(address)}
      </button>

      {menuOpen && (
        <div className="card absolute right-0 mt-2 w-64 p-2 shadow-2xl">
          <p className="px-2 pb-1 pt-1 text-[11px] uppercase tracking-wide text-zinc-500">
            Switch network
          </p>
          {chains.map((chain) => (
            <button
              key={chain.id}
              disabled={switching || chain.id === chainId}
              onClick={() => {
                switchChain({ chainId: chain.id as ChainId });
                setMenuOpen(false);
              }}
              className={`flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left text-sm hover:bg-zinc-800 disabled:opacity-50 ${
                chain.id === chainId ? "text-emerald-400" : "text-zinc-300"
              }`}
            >
              {chain.name}
              {chain.id === chainId && <span>●</span>}
            </button>
          ))}
          <div className="mt-1 border-t border-zinc-800 pt-1">
            <button
              onClick={() => {
                disconnect();
                setMenuOpen(false);
              }}
              className="w-full rounded-lg px-2 py-1.5 text-left text-sm text-red-400 hover:bg-zinc-800"
            >
              Disconnect
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
