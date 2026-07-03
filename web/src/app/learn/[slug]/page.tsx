import Link from "next/link";
import { notFound } from "next/navigation";
import { TUTORIALS, getTutorial } from "@/data/tutorials";
import { QA_ENTRIES } from "@/data/qa";
import { CodeBlock } from "@/components/CodeBlock";

export function generateStaticParams() {
  return TUTORIALS.map((t) => ({ slug: t.slug }));
}

export default async function TutorialPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tutorial = getTutorial(slug);
  if (!tutorial) notFound();

  const linkedQa = QA_ENTRIES.filter((qa) => tutorial.qaIds.includes(qa.id));
  const index = TUTORIALS.findIndex((t) => t.slug === slug);
  const next = TUTORIALS[index + 1];

  return (
    <article className="mx-auto max-w-3xl">
      <p className="text-sm text-zinc-500">
        Lesson {tutorial.lesson} · {tutorial.level} · ~{tutorial.minutes} min
      </p>
      <h1 className="mt-1 text-3xl font-bold text-white">{tutorial.title}</h1>
      <p className="mt-3 text-lg leading-relaxed text-zinc-400">{tutorial.summary}</p>

      {tutorial.playgroundSlug && (
        <Link
          href={`/playground/${tutorial.playgroundSlug}`}
          className="btn-primary mt-5 inline-flex"
        >
          Open in Playground →
        </Link>
      )}

      <div className="mt-10 space-y-10">
        {tutorial.sections.map((section) => (
          <section key={section.heading}>
            <h2 className="text-xl font-semibold text-white">{section.heading}</h2>
            <div className="mt-3 space-y-3">
              {section.body.map((paragraph, i) => (
                <p key={i} className="leading-relaxed text-zinc-300">
                  {paragraph}
                </p>
              ))}
            </div>
            {section.code && (
              <div className="mt-4">
                <CodeBlock title={section.code.title} code={section.code.code} />
              </div>
            )}
          </section>
        ))}
      </div>

      {linkedQa.length > 0 && (
        <section className="mt-12">
          <h2 className="text-xl font-semibold text-white">Interview questions this unlocks</h2>
          <div className="mt-4 space-y-3">
            {linkedQa.map((qa) => (
              <details key={qa.id} className="card group p-4">
                <summary className="cursor-pointer font-medium text-zinc-100 marker:text-indigo-400">
                  {qa.question}
                </summary>
                <p className="mt-3 leading-relaxed text-zinc-400">“{qa.answer}”</p>
              </details>
            ))}
          </div>
          <Link href="/qa" className="mt-4 inline-block text-sm text-indigo-400 hover:underline">
            Drill all questions →
          </Link>
        </section>
      )}

      <div className="mt-12 flex justify-between border-t border-zinc-800 pt-6">
        <Link href="/learn" className="btn-ghost">← All lessons</Link>
        {next && (
          <Link href={`/learn/${next.slug}`} className="btn-primary">
            Lesson {next.lesson}: {next.title.split(":")[0]} →
          </Link>
        )}
      </div>
    </article>
  );
}
