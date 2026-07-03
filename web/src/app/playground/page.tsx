import Link from "next/link";
import { CONTRACTS } from "@/contracts/registry";

export const metadata = { title: "Playground — ChainForge" };

export default function PlaygroundIndex() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-white">Contract Playground</h1>
      <p className="mt-2 max-w-2xl text-zinc-400">
        Every contract below was compiled from{" "}
        <span className="font-mono text-zinc-300">contracts/</span> in this repo. Deploy your own
        instance to any testnet with your wallet, then read it, write to it, and watch its events —
        the full lifecycle a senior interview expects you to narrate.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {CONTRACTS.map((contract) => (
          <Link
            key={contract.slug}
            href={`/playground/${contract.slug}`}
            className="card group p-5 transition-colors hover:border-indigo-600/60"
          >
            <div className="flex items-center justify-between">
              <span className="badge border-indigo-500/40 text-indigo-300">
                Lesson {contract.lesson}
              </span>
              <span className="text-zinc-600 transition-transform group-hover:translate-x-1">→</span>
            </div>
            <h2 className="mt-3 font-mono text-lg font-semibold text-white">{contract.name}</h2>
            <p className="mt-1 text-sm font-medium text-indigo-300/80">{contract.tagline}</p>
            <p className="mt-2 text-sm leading-relaxed text-zinc-400">{contract.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
