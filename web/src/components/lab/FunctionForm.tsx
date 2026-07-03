"use client";

import { useCallback, useEffect, useState } from "react";
import { usePublicClient } from "wagmi";
import { parseEther, type Abi, type AbiFunction, type Address } from "viem";
import { parseArgs, isReadFunction, placeholderFor, signatureOf } from "@/lib/abi-args";
import { stringifyResult } from "@/lib/format";
import { useTxFlow } from "@/hooks/useTxFlow";

const PHASE_LABELS: Record<string, string> = {
  wallet: "Confirm in wallet…",
  pending: "Pending…",
};

/**
 * One collapsible card per ABI function. Reads call eth_call (free); writes
 * run the full tx state machine. No-arg reads auto-fetch and re-fetch when
 * `refreshKey` changes (i.e. after any confirmed write).
 */
export function FunctionForm({
  abi,
  fn,
  address,
  refreshKey,
  onConfirmed,
}: {
  abi: Abi;
  fn: AbiFunction;
  address: Address;
  refreshKey: number;
  onConfirmed?: () => void;
}) {
  const publicClient = usePublicClient();
  const { state, sendWrite } = useTxFlow();

  const isRead = isReadFunction(fn);
  const autoRead = isRead && fn.inputs.length === 0;

  const [raws, setRaws] = useState<string[]>(() => fn.inputs.map(() => ""));
  const [ethValue, setEthValue] = useState("");
  const [result, setResult] = useState<string>();
  const [error, setError] = useState<string>();
  const [reading, setReading] = useState(false);

  const runRead = useCallback(
    async (argRaws: string[]) => {
      if (!publicClient) return;
      setError(undefined);
      setReading(true);
      try {
        const args = parseArgs(fn.inputs, argRaws);
        const value = await publicClient.readContract({
          address,
          abi,
          functionName: fn.name,
          args,
        });
        setResult(stringifyResult(value));
      } catch (err) {
        setError(err instanceof Error ? err.message.split("\n")[0] : String(err));
      } finally {
        setReading(false);
      }
    },
    [publicClient, abi, address, fn],
  );

  // auto-fetch parameterless reads; re-fetch after confirmed writes
  useEffect(() => {
    if (autoRead) void runRead([]);
  }, [autoRead, runRead, refreshKey]);

  async function runWrite() {
    setError(undefined);
    let args: unknown[];
    let value: bigint | undefined;
    try {
      args = parseArgs(fn.inputs, raws);
      value =
        fn.stateMutability === "payable" && ethValue.trim() !== ""
          ? parseEther(ethValue.trim())
          : undefined;
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      return;
    }
    await sendWrite(
      { address, abi, functionName: fn.name, args, value },
      { label: fn.name, onConfirmed },
    );
  }

  const busy = state.phase === "wallet" || state.phase === "pending";

  return (
    <div className="card p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-mono text-sm text-zinc-100">{signatureOf(fn)}</span>
        <div className="flex items-center gap-2">
          {fn.stateMutability === "payable" && (
            <span className="badge border-amber-500/40 text-amber-300">payable</span>
          )}
          {isRead ? (
            <span className="badge border-emerald-500/40 text-emerald-300">free read</span>
          ) : (
            <span className="badge border-indigo-500/40 text-indigo-300">tx · gas</span>
          )}
        </div>
      </div>

      {(fn.inputs.length > 0 || fn.stateMutability === "payable") && (
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {fn.inputs.map((input, i) => (
            <input
              key={input.name ?? i}
              className="input font-mono text-xs"
              placeholder={`${input.name || `arg${i}`}: ${placeholderFor(input.type)}`}
              value={raws[i] ?? ""}
              onChange={(e) => setRaws((prev) => prev.map((v, j) => (j === i ? e.target.value : v)))}
            />
          ))}
          {fn.stateMutability === "payable" && (
            <input
              className="input font-mono text-xs border-amber-700/50"
              placeholder="ETH value to send, e.g. 0.001"
              value={ethValue}
              onChange={(e) => setEthValue(e.target.value)}
            />
          )}
        </div>
      )}

      <div className="mt-3 flex items-center gap-3">
        {isRead ? (
          <button className="btn-ghost" disabled={reading} onClick={() => runRead(raws)}>
            {reading ? "Reading…" : autoRead ? "Refresh" : "Call"}
          </button>
        ) : (
          <button className="btn-primary" disabled={busy} onClick={runWrite}>
            {PHASE_LABELS[state.phase] ?? "Send transaction"}
          </button>
        )}
        {!isRead && state.phase === "confirmed" && (
          <span className="text-xs text-emerald-400">✓ confirmed</span>
        )}
        {!isRead && (state.phase === "reverted" || state.phase === "rejected") && (
          <span className="text-xs text-red-400">{state.error}</span>
        )}
      </div>

      {error && <p className="mt-2 break-all text-xs text-red-400">{error}</p>}
      {isRead && result !== undefined && !error && (
        <pre className="mt-3 overflow-x-auto rounded-lg bg-zinc-950 p-3 font-mono text-xs text-emerald-300">
          {result}
        </pre>
      )}
    </div>
  );
}
