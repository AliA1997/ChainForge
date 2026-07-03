"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useAccount } from "wagmi";
import { isAddress, type AbiFunction, type Address } from "viem";
import { getContract } from "@/contracts/registry";
import { isReadFunction } from "@/lib/abi-args";
import { explorerAddressUrl, shortAddress } from "@/lib/format";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { ConnectGate } from "@/components/ConnectGate";
import { DeployPanel } from "./DeployPanel";
import { FunctionForm } from "./FunctionForm";
import { EventFeed } from "./EventFeed";

interface Instance {
  address: Address;
  deployedAt: number;
}

type Tab = "read" | "write" | "events";

export function ContractLab({ slug }: { slug: string }) {
  const meta = getContract(slug)!;
  const { chain, chainId } = useAccount();

  const [instances, setInstances] = useLocalStorage<Instance[]>(
    `chainforge.instances.${slug}.${chainId ?? "none"}`,
    [],
  );
  const [activeAddress, setActiveAddress] = useState<Address | "">("");
  const [attachInput, setAttachInput] = useState("");
  const [attachError, setAttachError] = useState<string>();
  const [tab, setTab] = useState<Tab>("read");
  // bumped after every confirmed write so no-arg reads re-fetch — the lab's
  // visible version of "invalidate queries on confirmation"
  const [refreshKey, setRefreshKey] = useState(0);

  const address = activeAddress || instances[instances.length - 1]?.address || "";

  const functions = useMemo(
    () => meta.abi.filter((item): item is AbiFunction => item.type === "function"),
    [meta.abi],
  );
  const reads = functions.filter(isReadFunction);
  const writes = functions.filter((fn) => !isReadFunction(fn));
  const events = meta.abi.filter((item) => item.type === "event");

  function attach() {
    const trimmed = attachInput.trim();
    if (!isAddress(trimmed)) {
      setAttachError("Not a valid address.");
      return;
    }
    setAttachError(undefined);
    setInstances((prev) =>
      prev.some((i) => i.address.toLowerCase() === trimmed.toLowerCase())
        ? prev
        : [...prev, { address: trimmed, deployedAt: Date.now() }],
    );
    setActiveAddress(trimmed);
    setAttachInput("");
  }

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-mono text-3xl font-bold text-white">{meta.name}</h1>
            <span className="badge border-indigo-500/40 text-indigo-300">Lesson {meta.lesson}</span>
          </div>
          <p className="mt-1 text-indigo-300/80">{meta.tagline}</p>
        </div>
        <Link href={`/learn/${meta.tutorialSlug}`} className="btn-ghost">
          Read the tutorial →
        </Link>
      </div>
      <p className="mt-3 max-w-3xl text-sm leading-relaxed text-zinc-400">{meta.description}</p>

      {meta.tryFirst && (
        <div className="mt-4 flex flex-wrap gap-2">
          {meta.tryFirst.map((suggestion) => (
            <span key={suggestion} className="badge border-zinc-700 text-zinc-400">
              try: {suggestion}
            </span>
          ))}
        </div>
      )}

      <div className="mt-8">
        <ConnectGate>
          <div className="grid gap-6 lg:grid-cols-[minmax(0,340px)_1fr]">
            {/* left rail: deploy + instances */}
            <div className="space-y-4">
              <DeployPanel
                meta={meta}
                onDeployed={(deployed) => {
                  setInstances((prev) => [...prev, { address: deployed, deployedAt: Date.now() }]);
                  setActiveAddress(deployed);
                }}
              />

              <div className="card p-4">
                <h3 className="text-sm font-semibold text-white">
                  Instances on {chain?.name ?? "this chain"}
                </h3>
                {instances.length === 0 ? (
                  <p className="mt-2 text-xs text-zinc-500">
                    Nothing deployed yet — deploy above or attach an existing address below.
                  </p>
                ) : (
                  <ul className="mt-2 space-y-1">
                    {instances.map((instance) => (
                      <li key={instance.address}>
                        <button
                          onClick={() => setActiveAddress(instance.address)}
                          className={`w-full rounded-lg px-2 py-1.5 text-left font-mono text-xs hover:bg-zinc-800 ${
                            instance.address === address ? "bg-zinc-800 text-emerald-400" : "text-zinc-300"
                          }`}
                        >
                          {shortAddress(instance.address)}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
                <div className="mt-3 flex gap-2">
                  <input
                    className="input font-mono text-xs"
                    placeholder="attach existing 0x…"
                    value={attachInput}
                    onChange={(e) => setAttachInput(e.target.value)}
                  />
                  <button className="btn-ghost shrink-0" onClick={attach}>
                    Use
                  </button>
                </div>
                {attachError && <p className="mt-1 text-xs text-red-400">{attachError}</p>}
              </div>
            </div>

            {/* right: interact */}
            <div>
              {!address ? (
                <div className="card p-10 text-center text-sm text-zinc-500">
                  Deploy or attach an instance to start interacting.
                </div>
              ) : (
                <>
                  <div className="card flex flex-wrap items-center justify-between gap-2 p-3">
                    <span className="font-mono text-xs text-zinc-300">{address}</span>
                    {explorerAddressUrl(chain, address) && (
                      <a
                        href={explorerAddressUrl(chain, address)}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-indigo-400 hover:underline"
                      >
                        Explorer ↗
                      </a>
                    )}
                  </div>

                  <div className="mt-4 flex gap-1 border-b border-zinc-800">
                    {(
                      [
                        ["read", `Read (${reads.length}) — free`],
                        ["write", `Write (${writes.length}) — costs gas`],
                        ["events", `Events (${events.length})`],
                      ] as [Tab, string][]
                    ).map(([id, label]) => (
                      <button
                        key={id}
                        onClick={() => setTab(id)}
                        className={`border-b-2 px-4 py-2 text-sm transition-colors ${
                          tab === id
                            ? "border-indigo-500 text-white"
                            : "border-transparent text-zinc-500 hover:text-zinc-300"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>

                  <div className="mt-4 space-y-3">
                    {tab === "read" &&
                      reads.map((fn) => (
                        <FunctionForm
                          key={`${fn.name}-${fn.inputs.length}`}
                          abi={meta.abi}
                          fn={fn}
                          address={address as Address}
                          refreshKey={refreshKey}
                        />
                      ))}
                    {tab === "write" &&
                      writes.map((fn) => (
                        <FunctionForm
                          key={`${fn.name}-${fn.inputs.length}`}
                          abi={meta.abi}
                          fn={fn}
                          address={address as Address}
                          refreshKey={refreshKey}
                          onConfirmed={() => setRefreshKey((k) => k + 1)}
                        />
                      ))}
                    {tab === "events" && (
                      <EventFeed abi={meta.abi} address={address as Address} />
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </ConnectGate>
      </div>
    </div>
  );
}
