"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import type { Abi, Address } from "viem";

type AbiConstructor = Extract<Abi[number], { type: "constructor" }>;
import type { ContractMeta } from "@/contracts/registry";
import { parseArgs, placeholderFor } from "@/lib/abi-args";
import { useDeployFlow } from "@/hooks/useTxFlow";

export function DeployPanel({
  meta,
  onDeployed,
}: {
  meta: ContractMeta;
  onDeployed: (address: Address) => void;
}) {
  const { address: account } = useAccount();
  const { state, deploy } = useDeployFlow();

  const ctor = meta.abi.find((item): item is AbiConstructor => item.type === "constructor");
  const inputs = ctor?.inputs ?? [];

  // Prefill address-typed constructor args with the connected account —
  // Counter and TipJar take their owner this way.
  const [raws, setRaws] = useState<string[]>(() =>
    inputs.map((input) => (input.type === "address" && account ? account : "")),
  );
  const [formError, setFormError] = useState<string>();

  const busy = state.phase === "wallet" || state.phase === "pending";

  async function handleDeploy() {
    setFormError(undefined);
    let args: unknown[];
    try {
      args = parseArgs(inputs, raws);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : String(error));
      return;
    }
    await deploy(
      { abi: meta.abi, bytecode: meta.bytecode, args, label: meta.name },
      { onDeployed },
    );
  }

  return (
    <div className="card p-4">
      <h3 className="text-sm font-semibold text-white">Deploy a fresh {meta.name}</h3>
      {inputs.length > 0 && (
        <div className="mt-3 space-y-2">
          {inputs.map((input, i) => (
            <div key={input.name ?? i}>
              <label className="mb-1 block font-mono text-xs text-zinc-400">
                {input.name} <span className="text-zinc-600">({input.type})</span>
              </label>
              <input
                className="input font-mono text-xs"
                placeholder={placeholderFor(input.type)}
                value={raws[i] ?? ""}
                onChange={(e) =>
                  setRaws((prev) => prev.map((v, j) => (j === i ? e.target.value : v)))
                }
              />
              {meta.constructorHints?.[input.name ?? ""] && (
                <p className="mt-1 text-[11px] text-zinc-500">
                  {meta.constructorHints[input.name ?? ""]}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
      {formError && <p className="mt-2 text-xs text-red-400">{formError}</p>}
      <button className="btn-primary mt-3 w-full" disabled={busy} onClick={handleDeploy}>
        {state.phase === "wallet"
          ? "Confirm in wallet…"
          : state.phase === "pending"
            ? "Deploying…"
            : "Deploy"}
      </button>
      <p className="mt-2 text-[11px] leading-relaxed text-zinc-500">
        Sends the creation bytecode as a transaction with no <span className="font-mono">to</span>{" "}
        address. The contract address comes back in the receipt.
      </p>
    </div>
  );
}
