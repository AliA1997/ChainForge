"use client";

import { useEffect, useState } from "react";
import { usePublicClient } from "wagmi";
import type { Abi, AbiEvent, Address, Log } from "viem";
import { stringifyResult } from "@/lib/format";

interface FeedEntry {
  key: string;
  eventName: string;
  args: string;
  blockNumber: string;
  live: boolean;
}

function toEntry(log: Log & { eventName?: string; args?: unknown }, live: boolean): FeedEntry {
  return {
    key: `${log.transactionHash}-${log.logIndex}`,
    eventName: log.eventName ?? "unknown",
    args: stringifyResult(log.args ?? {}),
    blockNumber: log.blockNumber?.toString() ?? "?",
    live,
  };
}

/**
 * Streams events with eth_newFilter/polling under the hood via viem's
 * watchContractEvent — the "real-time" of web3, bounded by block time.
 */
export function EventFeed({ abi, address }: { abi: Abi; address: Address }) {
  const publicClient = usePublicClient();
  const events = abi.filter((item): item is AbiEvent => item.type === "event");

  const [watching, setWatching] = useState(true);
  const [entries, setEntries] = useState<FeedEntry[]>([]);
  const [loadingPast, setLoadingPast] = useState(false);
  const [error, setError] = useState<string>();

  useEffect(() => {
    if (!watching || !publicClient || events.length === 0) return;
    const unwatch = publicClient.watchContractEvent({
      address,
      abi,
      onLogs: (logs) => {
        setEntries((prev) => {
          const next = [...logs.map((l) => toEntry(l, true)), ...prev];
          // de-dupe (watcher can re-deliver) and cap the feed
          const seen = new Set<string>();
          return next.filter((e) => !seen.has(e.key) && seen.add(e.key)).slice(0, 50);
        });
      },
      onError: (err) => setError(err.message.split("\n")[0]),
    });
    return unwatch;
  }, [watching, publicClient, address, abi, events.length]);

  async function loadPast() {
    if (!publicClient) return;
    setLoadingPast(true);
    setError(undefined);
    try {
      // bounded lookback — public RPCs cap eth_getLogs ranges
      const latest = await publicClient.getBlockNumber();
      const fromBlock = latest > 9999n ? latest - 9999n : 0n;
      const logs = await publicClient.getContractEvents({ address, abi, fromBlock });
      setEntries((prev) => {
        const next = [...logs.reverse().map((l) => toEntry(l, false)), ...prev];
        const seen = new Set<string>();
        return next.filter((e) => !seen.has(e.key) && seen.add(e.key)).slice(0, 50);
      });
    } catch (err) {
      setError(err instanceof Error ? err.message.split("\n")[0] : String(err));
    } finally {
      setLoadingPast(false);
    }
  }

  return (
    <div className="card p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span
            className={`h-2 w-2 rounded-full ${watching ? "animate-pulse bg-emerald-500" : "bg-zinc-600"}`}
          />
          <span className="text-sm font-medium text-white">
            {watching ? "Watching new events…" : "Paused"}
          </span>
        </div>
        <div className="flex gap-2">
          <button className="btn-ghost" onClick={() => setWatching((w) => !w)}>
            {watching ? "Pause" : "Watch"}
          </button>
          <button className="btn-ghost" disabled={loadingPast} onClick={loadPast}>
            {loadingPast ? "Loading…" : "Load recent history"}
          </button>
        </div>
      </div>

      <p className="mt-2 text-xs text-zinc-500">
        New events appear at most once per block — this is the latency floor of on-chain
        “real-time”. History is fetched with{" "}
        <span className="font-mono">eth_getLogs</span> over the last ~10k blocks.
      </p>

      {error && <p className="mt-2 text-xs text-red-400">{error}</p>}

      <div className="mt-4 space-y-2">
        {entries.length === 0 ? (
          <p className="py-6 text-center text-sm text-zinc-600">
            No events yet. Send a write transaction, then watch it land here.
          </p>
        ) : (
          entries.map((entry) => (
            <div key={entry.key} className="rounded-lg bg-zinc-950 p-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-semibold text-indigo-300">
                  {entry.eventName}
                </span>
                <span className="text-[11px] text-zinc-500">
                  block {entry.blockNumber} {entry.live && "· live"}
                </span>
              </div>
              <pre className="mt-1 overflow-x-auto font-mono text-[11px] text-zinc-400">
                {entry.args}
              </pre>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
