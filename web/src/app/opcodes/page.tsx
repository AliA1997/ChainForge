"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { OPCODES, OPCODE_CATEGORIES, type OpcodeCategory } from "@/data/opcodes";

export default function OpcodesPage() {
  const [category, setCategory] = useState<OpcodeCategory | "all">("all");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return OPCODES.filter(
      (op) =>
        (category === "all" || op.category === category) &&
        (query === "" ||
          op.name.toLowerCase().includes(query) ||
          op.description.toLowerCase().includes(query) ||
          op.usage.toLowerCase().includes(query)),
    );
  }, [category, search]);

  return (
    <div>
      <h1 className="text-3xl font-bold text-white">Opcode Explorer</h1>
      <p className="mt-2 max-w-2xl text-zinc-400">
        The instructions your Solidity compiles to, with the gas costs and the senior-interview
        angle for each. Several are demonstrated live by the{" "}
        <Link href="/playground/assembly-lab" className="text-indigo-400 hover:underline">
          AssemblyLab
        </Link>{" "}
        contract.
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <input
          className="input max-w-xs"
          placeholder="Search opcodes…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button
          onClick={() => setCategory("all")}
          className={`badge cursor-pointer ${category === "all" ? "border-indigo-500 text-indigo-300" : "border-zinc-700 text-zinc-400 hover:border-zinc-500"}`}
        >
          All ({OPCODES.length})
        </button>
        {OPCODE_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`badge cursor-pointer ${category === cat ? "border-indigo-500 text-indigo-300" : "border-zinc-700 text-zinc-400 hover:border-zinc-500"}`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="mt-6 space-y-3">
        {filtered.map((op) => (
          <div key={op.name} className="card p-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-mono text-base font-bold text-white">{op.name}</span>
              <span className="font-mono text-xs text-zinc-500">{op.hex}</span>
              <span className="badge border-zinc-700 text-zinc-400">{op.category}</span>
              <span className="badge border-amber-500/30 text-amber-300/90">gas: {op.gas}</span>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-zinc-300">{op.description}</p>
            <p className="mt-2 border-l-2 border-indigo-600/50 pl-3 text-sm leading-relaxed text-zinc-400">
              <span className="font-medium text-indigo-300">In the wild: </span>
              {op.usage}
            </p>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="py-10 text-center text-zinc-500">No opcodes match that search.</p>
        )}
      </div>
    </div>
  );
}
