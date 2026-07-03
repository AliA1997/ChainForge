"use client";

import { useMemo, useState } from "react";
import { QA_ENTRIES, QA_TOPICS, type QaTopic } from "@/data/qa";
import { useLocalStorage } from "@/hooks/useLocalStorage";

type Mode = "browse" | "drill";

export default function QaPage() {
  const [topic, setTopic] = useState<QaTopic | "all">("all");
  const [mode, setMode] = useState<Mode>("browse");
  const [known, setKnown] = useLocalStorage<Record<string, boolean>>("chainforge.qa.known", {});

  const pool = useMemo(
    () => QA_ENTRIES.filter((qa) => topic === "all" || qa.topic === topic),
    [topic],
  );
  const knownCount = pool.filter((qa) => known[qa.id]).length;

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Q&amp;A Drill</h1>
          <p className="mt-2 max-w-2xl text-zinc-400">
            Senior-level questions with model answers in the first person — say them out loud.
            Mark the ones you can deliver cold; drill the rest.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            className={mode === "browse" ? "btn-primary" : "btn-ghost"}
            onClick={() => setMode("browse")}
          >
            Browse
          </button>
          <button
            className={mode === "drill" ? "btn-primary" : "btn-ghost"}
            onClick={() => setMode("drill")}
          >
            Flashcards
          </button>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <button
          onClick={() => setTopic("all")}
          className={`badge cursor-pointer ${topic === "all" ? "border-indigo-500 text-indigo-300" : "border-zinc-700 text-zinc-400 hover:border-zinc-500"}`}
        >
          All ({QA_ENTRIES.length})
        </button>
        {QA_TOPICS.map((t) => {
          const count = QA_ENTRIES.filter((qa) => qa.topic === t).length;
          return (
            <button
              key={t}
              onClick={() => setTopic(t)}
              className={`badge cursor-pointer ${topic === t ? "border-indigo-500 text-indigo-300" : "border-zinc-700 text-zinc-400 hover:border-zinc-500"}`}
            >
              {t} ({count})
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex items-center gap-3">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-zinc-800">
          <div
            className="h-full rounded-full bg-emerald-500 transition-all"
            style={{ width: pool.length ? `${(knownCount / pool.length) * 100}%` : "0%" }}
          />
        </div>
        <span className="text-xs text-zinc-500">
          {knownCount}/{pool.length} confident
        </span>
      </div>

      {mode === "browse" ? (
        <div className="mt-6 space-y-3">
          {pool.map((qa) => (
            <details key={qa.id} className="card p-4">
              <summary className="flex cursor-pointer items-start justify-between gap-3">
                <span className="font-medium text-zinc-100">{qa.question}</span>
                <span className="flex shrink-0 items-center gap-2">
                  <span className="badge border-zinc-700 text-zinc-500">{qa.topic}</span>
                  {known[qa.id] && <span className="text-emerald-400">✓</span>}
                </span>
              </summary>
              <p className="mt-3 leading-relaxed text-zinc-300">“{qa.answer}”</p>
              <button
                className={`mt-3 ${known[qa.id] ? "btn-ghost" : "btn-primary"}`}
                onClick={() => setKnown((prev) => ({ ...prev, [qa.id]: !prev[qa.id] }))}
              >
                {known[qa.id] ? "Mark as needs work" : "I can deliver this cold"}
              </button>
            </details>
          ))}
        </div>
      ) : (
        <Drill pool={pool} known={known} setKnown={setKnown} />
      )}
    </div>
  );
}

function Drill({
  pool,
  known,
  setKnown,
}: {
  pool: typeof QA_ENTRIES;
  known: Record<string, boolean>;
  setKnown: (fn: (prev: Record<string, boolean>) => Record<string, boolean>) => void;
}) {
  const [order, setOrder] = useState(() => shuffle(pool.map((qa) => qa.id)));
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);

  // re-shuffle when the filtered pool changes
  const poolKey = pool.map((qa) => qa.id).join(",");
  const [lastPoolKey, setLastPoolKey] = useState(poolKey);
  if (poolKey !== lastPoolKey) {
    setLastPoolKey(poolKey);
    setOrder(shuffle(pool.map((qa) => qa.id)));
    setIndex(0);
    setRevealed(false);
  }

  const current = pool.find((qa) => qa.id === order[index]);
  if (!current) return <p className="mt-10 text-center text-zinc-500">No questions in this topic.</p>;

  function advance(markKnown: boolean | null) {
    if (markKnown !== null) {
      setKnown((prev) => ({ ...prev, [current!.id]: markKnown }));
    }
    setRevealed(false);
    setIndex((i) => (i + 1) % order.length);
  }

  return (
    <div className="mx-auto mt-8 max-w-2xl">
      <p className="text-center text-xs text-zinc-500">
        Card {index + 1} of {order.length}
        {known[current.id] && " · previously marked confident"}
      </p>
      <div className="card mt-3 min-h-64 p-8">
        <p className="text-center text-[11px] uppercase tracking-wider text-zinc-500">
          {current.topic}
        </p>
        <p className="mt-4 text-center text-lg font-medium text-white">{current.question}</p>
        {revealed && (
          <p className="mt-6 border-t border-zinc-800 pt-6 leading-relaxed text-zinc-300">
            “{current.answer}”
          </p>
        )}
      </div>
      <div className="mt-4 flex justify-center gap-3">
        {!revealed ? (
          <button className="btn-primary" onClick={() => setRevealed(true)}>
            Reveal answer — but say yours out loud first
          </button>
        ) : (
          <>
            <button className="btn-ghost border-red-700/60 text-red-300" onClick={() => advance(false)}>
              Needs work
            </button>
            <button className="btn-ghost" onClick={() => advance(null)}>
              Skip
            </button>
            <button className="btn-ghost border-emerald-700/60 text-emerald-300" onClick={() => advance(true)}>
              Nailed it
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
