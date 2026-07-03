import Link from "next/link";
import { TUTORIALS } from "@/data/tutorials";

export const metadata = { title: "Learn — ChainForge" };

const LEVEL_STYLES: Record<string, string> = {
  Foundations: "border-emerald-500/40 text-emerald-300",
  Intermediate: "border-amber-500/40 text-amber-300",
  Advanced: "border-red-500/40 text-red-300",
};

export default function LearnIndex() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-white">The Curriculum</h1>
      <p className="mt-2 max-w-2xl text-zinc-400">
        Eight lessons, each ending with something you actually deploy or run. Work them in order —
        every lesson links the interview questions it prepares you for in the{" "}
        <Link href="/qa" className="text-indigo-400 hover:underline">Q&amp;A Drill</Link>.
      </p>

      <div className="mt-8 space-y-3">
        {TUTORIALS.map((tutorial) => (
          <Link
            key={tutorial.slug}
            href={`/learn/${tutorial.slug}`}
            className="card group flex items-start gap-5 p-5 transition-colors hover:border-indigo-600/60"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-800 font-mono text-lg font-bold text-indigo-300">
              {tutorial.lesson}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-semibold text-white group-hover:text-indigo-300">
                  {tutorial.title}
                </h2>
                <span className={`badge ${LEVEL_STYLES[tutorial.level]}`}>{tutorial.level}</span>
                <span className="text-xs text-zinc-500">~{tutorial.minutes} min</span>
              </div>
              <p className="mt-1 text-sm leading-relaxed text-zinc-400">{tutorial.summary}</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {tutorial.concepts.map((concept) => (
                  <span key={concept} className="badge border-zinc-700 text-zinc-500">
                    {concept}
                  </span>
                ))}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
