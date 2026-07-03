import { TESTNETS } from "@/data/testnets";

export const metadata = { title: "Testnets — ChainForge" };

const KIND_STYLES: Record<string, string> = {
  L1: "border-emerald-500/40 text-emerald-300",
  "Optimistic rollup": "border-indigo-500/40 text-indigo-300",
  "ZK-adjacent L2": "border-purple-500/40 text-purple-300",
  "Sidechain-style PoS": "border-amber-500/40 text-amber-300",
};

export default function TestnetsPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-white">Testnet Directory</h1>
      <p className="mt-2 max-w-2xl text-zinc-400">
        Where to practice without spending anything real. Add these to your wallet, fill up from a
        faucet, and note the block times — they are the latency floor your UX designs against.
      </p>

      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        {TESTNETS.map((net) => (
          <div key={net.id} className="card p-5">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-semibold text-white">{net.name}</h2>
              <span className={`badge ${KIND_STYLES[net.kind]}`}>{net.kind}</span>
            </div>
            <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
              <dt className="text-zinc-500">Chain ID</dt>
              <dd className="font-mono text-zinc-200">{net.id}</dd>
              <dt className="text-zinc-500">Parent network</dt>
              <dd className="text-zinc-200">{net.parent}</dd>
              <dt className="text-zinc-500">Currency</dt>
              <dd className="text-zinc-200">{net.currency}</dd>
              <dt className="text-zinc-500">Block time</dt>
              <dd className="text-zinc-200">
                {net.blockTimeSeconds === 0 ? "instant (local)" : `~${net.blockTimeSeconds}s`}
              </dd>
              <dt className="text-zinc-500">RPC</dt>
              <dd className="break-all font-mono text-xs text-zinc-300">{net.rpc}</dd>
              {net.explorer && (
                <>
                  <dt className="text-zinc-500">Explorer</dt>
                  <dd>
                    <a
                      href={net.explorer}
                      target="_blank"
                      rel="noreferrer"
                      className="break-all text-xs text-indigo-400 hover:underline"
                    >
                      {net.explorer.replace("https://", "")}
                    </a>
                  </dd>
                </>
              )}
            </dl>
            {net.faucets.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {net.faucets.map((faucet) => (
                  <a
                    key={faucet.url}
                    href={faucet.url}
                    target="_blank"
                    rel="noreferrer"
                    className="badge border-emerald-600/40 text-emerald-300 hover:border-emerald-400"
                  >
                    🚰 {faucet.name}
                  </a>
                ))}
              </div>
            )}
            <p className="mt-3 text-sm leading-relaxed text-zinc-400">{net.notes}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
