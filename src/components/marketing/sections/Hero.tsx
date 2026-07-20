import Link from 'next/link';

// The landing masthead, set as an editorial "dispatch" rather than a hero card:
// a running-head rule, an oversized Fraunces headline that rises line by line,
// an asymmetric dek/status band, and a multilingual ticker as the footer. The
// palette is scoped to this block (warm ink + bone + one vermilion signal) so
// the dark app theme is untouched. All motion is CSS and reduced-motion-safe.

const TICKER = [
  'हिन्दी',
  'العربية',
  'Français',
  'Español',
  'Português',
  'Deutsch',
  '中文',
  'Kiswahili',
  'বাংলা',
  '日本語',
] as const;

const READOUT = [
  { k: 'Overall', v: 'NOMINAL', signal: true },
  { k: 'Kickoff', v: 'T−40 MIN', signal: false },
  { k: 'Languages', v: '30+', signal: false },
  { k: 'Decision latency', v: '~2 S', signal: false },
] as const;

function RunningHead() {
  return (
    <div className="flex items-center gap-4 font-[family-name:var(--font-jetbrains)] text-[0.7rem] uppercase tracking-[0.22em] text-[#8B8474]">
      <span className="whitespace-nowrap">Venue Ops</span>
      <span aria-hidden="true" className="rule-draw h-px flex-1 bg-[#2A251D]" />
      <span className="hidden whitespace-nowrap sm:inline">FIFA World Cup 2026</span>
      <span aria-hidden="true" className="hidden h-px w-14 bg-[#2A251D] sm:block" />
      <span className="whitespace-nowrap text-[#ECE6D7]">Citadel Stadium</span>
    </div>
  );
}

function StatusReadout() {
  return (
    <dl className="grid grid-cols-2 gap-x-8 gap-y-5 self-start border-l border-[#2A251D] pl-6 font-[family-name:var(--font-jetbrains)]">
      {READOUT.map((r) => (
        <div key={r.k}>
          <dt className="text-[0.62rem] uppercase tracking-[0.2em] text-[#8B8474]">{r.k}</dt>
          <dd className={`mt-1.5 text-sm tnum ${r.signal ? 'text-[#FF5A2C]' : 'text-[#ECE6D7]'}`}>
            {r.v}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function Ticker() {
  return (
    <div className="relative z-10 border-t border-[#2A251D]">
      <div className="marquee-mask overflow-hidden py-4">
        <div className="marquee font-[family-name:var(--font-jetbrains)] text-sm uppercase tracking-[0.14em] text-[#8B8474]">
          {[...TICKER, ...TICKER].map((t, i) => (
            <span key={i} className="flex items-center gap-3 px-6">
              <span aria-hidden="true" className="text-[#FF5A2C]">
                ›
              </span>
              {t}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export function Hero() {
  return (
    <section id="top" className="grain relative overflow-hidden bg-[#100E0B] text-[#ECE6D7]">
      <div className="relative z-10 mx-auto max-w-[80rem] px-6 pt-28 sm:pt-32">
        <RunningHead />

        <div className="mt-14 grid gap-8 lg:grid-cols-[auto_1fr]">
          <div
            aria-hidden="true"
            className="hidden select-none flex-col items-start justify-between self-stretch lg:flex"
          >
            <span className="rotate-180 font-[family-name:var(--font-jetbrains)] text-[0.7rem] uppercase tracking-[0.22em] text-[#8B8474] [writing-mode:vertical-rl]">
              Dispatch № 001 — Live Ops
            </span>
            <span className="font-[family-name:var(--font-fraunces)] text-7xl font-black leading-none text-[#FF5A2C]">
              01
            </span>
          </div>

          <h1 className="font-[family-name:var(--font-fraunces)] text-[clamp(2.7rem,8vw,7rem)] font-black leading-[0.9] tracking-[-0.02em]">
            <span className="rise block">
              <span style={{ animationDelay: '0.05s' }}>The control room</span>
            </span>
            <span className="rise block">
              <span style={{ animationDelay: '0.16s' }}>that thinks in</span>
            </span>
            <span className="rise block">
              <span style={{ animationDelay: '0.27s' }}>
                every <em className="not-italic text-[#FF5A2C]">language</em>.
              </span>
            </span>
          </h1>
        </div>

        <div aria-hidden="true" className="rule-draw mt-14 h-px w-full bg-[#2A251D]" />

        <div className="grid gap-10 py-10 lg:grid-cols-[1.5fr_1fr]">
          <div className="max-w-xl">
            <p className="text-lg leading-relaxed text-[#C9C2B2]">
              SENTINEL reads every operational feed at Citadel Stadium, flags the risk that matters
              before it happens, and hands the duty manager a decision — with the reasoning
              attached. A volunteer reports an incident in any of 30+ languages and gets an instant,
              triaged response. The safety math is deterministic; the AI explains it, never invents
              it.
            </p>
            <Link
              href="/dashboard"
              className="ink-link mt-8 inline-flex items-center gap-2 pb-1 font-[family-name:var(--font-jetbrains)] text-sm uppercase tracking-[0.18em] text-[#ECE6D7]"
            >
              Enter the command center
              <span aria-hidden="true">⟶</span>
            </Link>
          </div>

          <StatusReadout />
        </div>
      </div>

      <Ticker />
    </section>
  );
}
