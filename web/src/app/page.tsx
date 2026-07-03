import Link from "next/link";
import { TUTORIALS } from "@/data/tutorials";
import { QA_ENTRIES } from "@/data/qa";
import { OPCODES } from "@/data/opcodes";
import { CONTRACTS } from "@/contracts/registry";

const PILLARS = [
  {
    title: "Learn",
    href: "/learn",
    stat: `${TUTORIALS.length} lessons`,
    body: "Solidity → EVM internals → deployment → the frontend patterns that make dapps feel fast.",
  },
  {
    title: "Do",
    href: "/playground",
    stat: `${CONTRACTS.length} contracts`,
    body: "Every lesson ends on-chain: deploy with your own wallet, read, write, watch events land.",
  },
  {
    title: "Explain",
    href: "/opcodes",
    stat: `${OPCODES.length} opcodes`,
    body: "Each action comes with the interview answer — the why, the trade-offs, the gas math.",
  },
  {
    title: "Drill",
    href: "/qa",
    stat: `${QA_ENTRIES.length} questions`,
    body: "Flashcard the model answers until you can deliver them cold, topic by topic.",
  },
];

export default function Home() {
  return (
    <div>
      <section className="py-14 text-center">
        <p className="font-mono text-sm text-indigo-400">testnets only · your wallet · real blocks</p>
        <h1 className="mx-auto mt-4 max-w-3xl text-4xl font-bold leading-tight text-white sm:text-5xl">
          Learn web3 by <span className="text-indigo-400">deploying it</span> —
          then pass the interview about it.
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-zinc-400">
          ChainForge is a curriculum wrapped around real smart contracts. You compile them, deploy
          them to Sepolia or an L2 testnet, poke their storage, and walk away able to explain
          DELEGATECALL, EIP-1559, SIWE, and optimistic UI like someone who has actually shipped them.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/learn/your-first-contract" className="btn-primary px-6 py-3 text-base">
            Start Lesson 1 →
          </Link>
          <Link href="/playground" className="btn-ghost px-6 py-3 text-base">
            Straight to the Playground
          </Link>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {PILLARS.map((pillar) => (
          <Link
            key={pillar.title}
            href={pillar.href}
            className="card group p-5 transition-colors hover:border-indigo-600/60"
          >
            <p className="font-mono text-xs text-indigo-400">{pillar.stat}</p>
            <h2 className="mt-1 text-xl font-semibold text-white group-hover:text-indigo-300">
              {pillar.title}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-zinc-400">{pillar.body}</p>
          </Link>
        ))}
      </section>

      <section className="mt-14 grid gap-4 md:grid-cols-3">
        <div className="card p-5">
          <h3 className="font-semibold text-white">Reads are free, writes are a state machine</h3>
          <p className="mt-2 text-sm leading-relaxed text-zinc-400">
            Every write in this app runs the full lifecycle — simulate, sign, pending(hash),
            confirmed or reverted — with toasts at each phase. The pattern is the product: it&apos;s
            the same one you&apos;ll describe in interviews.
          </p>
        </div>
        <div className="card p-5">
          <h3 className="font-semibold text-white">Block time is the floor</h3>
          <p className="mt-2 text-sm leading-relaxed text-zinc-400">
            On-chain &ldquo;real-time&rdquo; means once per block: ~12s on Ethereum, ~2s on L2s.
            The <Link href="/gas" className="text-indigo-400 hover:underline">Gas Lab</Link> and
            event feeds refresh at exactly that cadence — feel the latency you&apos;ll design around.
          </p>
        </div>
        <div className="card p-5">
          <h3 className="font-semibold text-white">Auth without passwords</h3>
          <p className="mt-2 text-sm leading-relaxed text-zinc-400">
            The <Link href="/siwe" className="text-indigo-400 hover:underline">SIWE demo</Link> runs
            the real EIP-4361 flow against this app&apos;s own API routes: server nonce, wallet
            signature, server-side verification, httpOnly session. No password, no OAuth, no gas.
          </p>
        </div>
      </section>
    </div>
  );
}
