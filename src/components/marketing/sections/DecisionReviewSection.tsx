import { Reveal } from '@/components/marketing/Reveal';

// DISPATCH 04 — the trust story, staged like a VAR review. Left: the AI's
// language read, hedged and human. Right: the deterministic engine's verdict,
// clipped and certain. A centre seam divides them, the way a VAR split does.

const ENGINE = [
  ['Severity', 'SEV-1'],
  ['Zone', 'GATE E1'],
  ['Team', 'MEDICAL'],
  ['Rule fired', 'life-safety keyword'],
  ['Confidence', '99.2%'],
] as const;

function AiSide() {
  return (
    <div className="flex flex-col justify-between gap-8 p-8 sm:p-12">
      <p className="font-[family-name:var(--font-jetbrains)] text-[0.7rem] uppercase tracking-[0.24em] text-[#46E0D0]">
        ◐ AI Commentary — Language
      </p>
      <blockquote className="font-[family-name:var(--font-fraunces)] text-2xl italic leading-snug text-[#ECE6D7] sm:text-3xl">
        “A volunteer just reported an unconscious person near Gate E1. I read it in Spanish,
        translated it, and I think it&rsquo;s medical — but I don&rsquo;t decide how serious.”
      </blockquote>
      <p className="font-[family-name:var(--font-jetbrains)] text-xs leading-relaxed text-[#8B8474]">
        DETECTS · TRANSLATES · CATEGORISES. 30+ LANGUAGES. NEVER SETS A SEVERITY.
      </p>
    </div>
  );
}

function EngineSide() {
  return (
    <div className="flex flex-col justify-between gap-8 bg-[#120C0B] p-8 sm:p-12">
      <p className="font-[family-name:var(--font-jetbrains)] text-[0.7rem] uppercase tracking-[0.24em] text-[#FF3B30]">
        ▮ Safety Engine — Verdict
      </p>
      <dl className="space-y-3 font-[family-name:var(--font-jetbrains)]">
        {ENGINE.map(([k, v]) => (
          <div
            key={k}
            className="flex items-baseline justify-between gap-4 border-b border-[#2A251D] pb-2"
          >
            <dt className="text-[0.62rem] uppercase tracking-[0.2em] text-[#8B8474]">{k}</dt>
            <dd className="text-lg tnum text-[#ECE6D7]">{v}</dd>
          </div>
        ))}
      </dl>
      <div>
        <div className="h-1 w-full overflow-hidden rounded-full bg-[#2A251D]">
          <div className="led-bar h-full w-[99%] text-[#FF3B30]" />
        </div>
        <p className="mt-3 font-[family-name:var(--font-jetbrains)] text-xs uppercase tracking-[0.2em] text-[#FF3B30]">
          Decision locked · Deterministic · Auditable
        </p>
      </div>
    </div>
  );
}

export function DecisionReviewSection() {
  return (
    <section id="how" className="border-t border-[#2A251D] bg-[#100E0B] py-24 text-[#ECE6D7]">
      <div className="mx-auto max-w-6xl px-6">
        <header className="mb-10 flex items-center gap-4">
          <span className="font-[family-name:var(--font-jetbrains)] text-xs uppercase tracking-[0.24em] text-[#FF3B30]">
            ◉ VAR Check
          </span>
          <span aria-hidden="true" className="rule-draw h-px flex-1 bg-[#2A251D]" />
          <span className="font-[family-name:var(--font-jetbrains)] text-xs uppercase tracking-[0.24em] text-[#8B8474]">
            Dispatch 04 — Decision Review
          </span>
        </header>

        <h2 className="mb-12 max-w-3xl font-[family-name:var(--font-fraunces)] text-4xl font-black leading-[0.95] tracking-tight sm:text-6xl">
          The AI talks.
          <br />
          The engine <em className="not-italic text-[#FF3B30]">decides.</em>
        </h2>

        <Reveal className="grid overflow-hidden rounded-sm border border-[#2A251D] md:grid-cols-2 md:divide-x md:divide-[#2A251D]">
          <AiSide />
          <EngineSide />
        </Reveal>

        <p className="mt-8 max-w-2xl font-[family-name:var(--font-jetbrains)] text-xs leading-relaxed text-[#8B8474]">
          The model&rsquo;s output schema has no severity field and no team field — there is no
          shape in which it can set one. A life-safety keyword overrides its category outright.
          Tested across English, Spanish, Bengali &amp; Hindi.
        </p>
      </div>
    </section>
  );
}
