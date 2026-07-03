import Link from "next/link";
import { notFound } from "next/navigation";
import { CONTRACTS, getContract } from "@/contracts/registry";
import { LabLoader } from "@/components/lab/LabLoader";

export function generateStaticParams() {
  return CONTRACTS.map((c) => ({ contract: c.slug }));
}

export default async function ContractLabPage({
  params,
}: {
  params: Promise<{ contract: string }>;
}) {
  const { contract } = await params;
  const meta = getContract(contract);
  if (!meta) notFound();

  return (
    <div>
      {/* static lesson header — server-rendered, paints before the web3 chunk loads */}
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
        <LabLoader slug={contract} />
      </div>
    </div>
  );
}
