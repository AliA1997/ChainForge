"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  useAccount,
  useChains,
  useConnect,
  useDisconnect,
  useSwitchChain,
} from "wagmi";
import { useToasts } from "./Toasts";
import { LAST_WALLET_KEY } from "./Skeleton";
import { shortAddress } from "@/lib/format";
import type { AppConfig } from "@/lib/wagmi";

type ChainId = AppConfig["chains"][number]["id"];

/**
 * Wallet connect + chain switcher. Handles the wallet states the constitution
 * requires: no wallet installed (explicit message), multiple wallet extensions
 * (EIP-6963 picker), connect rejection/failure (surfaced as toasts — never
 * silent), wrong/unknown chain, and connected.
 */
export function WalletButton() {
  const { address, chainId, isConnected } = useAccount();
  const { connect, connectors, isPending: connecting, error: connectError } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain, isPending: switching } = useSwitchChain();
  const chains = useChains();
  const toasts = useToasts();
  const [menuOpen, setMenuOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);

  const activeChain = chains.find((c) => c.id === chainId);

  // Remember the last connected state so the lazy-load skeleton can show it
  // instead of a generic placeholder ("previous state" while loading).
  useEffect(() => {
    try {
      if (isConnected && address) {
        window.localStorage.setItem(
          LAST_WALLET_KEY,
          JSON.stringify({ address, chainName: activeChain?.name }),
        );
      } else {
        window.localStorage.removeItem(LAST_WALLET_KEY);
      }
    } catch {
      // storage unavailable — skeleton just stays generic
    }
  }, [isConnected, address, activeChain?.name]);

  // Surface connect failures — a silently swallowed error looks like a dead button.
  const reportedError = useRef<unknown>(null);
  useEffect(() => {
    if (!connectError || connectError === reportedError.current) return;
    reportedError.current = connectError;
    const raw = connectError.message;
    const detail = raw.includes("Provider not found")
      ? "No wallet extension responded. Install MetaMask (metamask.io), then reload this page."
      : raw.includes("rejected")
        ? "You dismissed the connection request in your wallet."
        : raw.split("\n")[0];
    toasts.push({ kind: "error", title: "Wallet connection failed", detail });
  }, [connectError, toasts]);

  // wagmi lists the generic injected() connector plus every EIP-6963 wallet it
  // discovers (MetaMask, Rabby, …). Prefer discovered wallets; de-dupe by name.
  const walletChoices = useMemo(() => {
    const seen = new Set<string>();
    const unique = connectors.filter((c) => !seen.has(c.name) && seen.add(c.name));
    const discovered = unique.filter((c) => c.id !== "injected");
    return discovered.length > 0 ? discovered : unique;
  }, [connectors]);

  if (!isConnected || !address) {
    const handleConnect = () => {
      const hasProvider = typeof window !== "undefined" && "ethereum" in window;
      if (!hasProvider && walletChoices.every((c) => c.id === "injected")) {
        toasts.push({
          kind: "error",
          title: "No wallet found",
          detail:
            "This browser has no wallet extension. Install MetaMask from metamask.io, then reload.",
        });
        return;
      }
      if (walletChoices.length > 1) {
        setPickerOpen((open) => !open);
        return;
      }
      connect({ connector: walletChoices[0] });
    };

    return (
      <div className="relative">
        <button className="btn-primary" disabled={connecting} onClick={handleConnect}>
          {connecting ? "Check your wallet…" : "Connect Wallet"}
        </button>
        {pickerOpen && (
          <div className="card absolute right-0 mt-2 w-56 p-2 shadow-2xl">
            <p className="px-2 pb-1 pt-1 text-[11px] uppercase tracking-wide text-zinc-500">
              Choose a wallet
            </p>
            {walletChoices.map((connector) => (
              <button
                key={connector.uid}
                onClick={() => {
                  setPickerOpen(false);
                  connect({ connector });
                }}
                className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm text-zinc-200 hover:bg-zinc-800"
              >
                {connector.icon && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={connector.icon} alt="" className="h-4 w-4 rounded" />
                )}
                {connector.name}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

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
