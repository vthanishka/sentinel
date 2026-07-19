import Link from 'next/link';

import { MiniConsole } from '@/components/marketing/MiniConsole';
import { Typewriter } from '@/components/marketing/Typewriter';

function HeroStat({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <dt className="sr-only">{label}</dt>
      <dd className="text-2xl font-bold text-[var(--color-ink)] tnum sm:text-3xl">{value}</dd>
      <span
        aria-hidden="true"
        className="text-xs uppercase tracking-wider text-[var(--color-ink-dim)]"
      >
        {label}
      </span>
    </div>
  );
}

/**
 * A centred launch hero: a full-width wordmark and tagline over the aurora, then
 * the live console presented head-on as a glowing product showcase rather than a
 * side card. The composition leads the eye straight down — badge, name, promise,
 * action, proof — instead of splitting attention left and right.
 */
export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden border-b border-[var(--color-border)]">
      <div className="aurora" aria-hidden="true" />
      <div className="grid-drift" aria-hidden="true" />

      <div className="relative mx-auto flex max-w-4xl flex-col items-center px-6 pt-32 text-center lg:pt-40">
        <p className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)]/60 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-accent-strong)] backdrop-blur">
          <span aria-hidden="true" className="text-[var(--color-status-normal)]">
            ●
          </span>
          Real-Time Crowd Safety · FIFA World Cup 2026
        </p>

        <h1 className="mt-8 text-6xl font-bold leading-[0.9] tracking-tight sm:text-7xl md:text-[7rem]">
          <span className="text-gradient">SENTINEL</span>
        </h1>

        <p className="mt-6 text-2xl font-semibold text-[var(--color-ink-muted)] sm:text-3xl">
          The AI teammate that{' '}
          <span className="text-[var(--color-accent-strong)]">
            <Typewriter
              phrases={[
                'spots crowd danger first.',
                'explains every decision.',
                'speaks 30+ languages.',
                'never invents a number.',
              ]}
            />
          </span>
        </p>

        <p className="mt-7 max-w-2xl text-lg leading-relaxed text-[var(--color-ink-muted)]">
          From ingress to final whistle, SENTINEL reads every feed, flags the risk that actually
          matters, and hands the duty manager a decision with the reasoning attached. The safety
          math is deterministic — the AI explains it, it never makes it up.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/dashboard"
            className="glow inline-flex items-center gap-2 rounded-lg bg-[var(--color-accent)] px-7 py-3.5 font-semibold text-[var(--color-void)] transition-colors hover:bg-[var(--color-accent-strong)]"
          >
            Open command center
            <span aria-hidden="true">→</span>
          </Link>
          <a
            href="#how"
            className="inline-flex items-center gap-2 rounded-lg border border-[var(--color-border-strong)] px-7 py-3.5 font-semibold text-[var(--color-ink)] transition-colors hover:border-[var(--color-accent)] hover:text-[var(--color-accent-strong)]"
          >
            See how it works
          </a>
        </div>

        <dl className="mt-12 flex flex-wrap justify-center gap-x-12 gap-y-6">
          <HeroStat value="30+" label="languages triaged" />
          <HeroStat value="~2s" label="AI briefing latency" />
          <HeroStat value="480" label="tests green" />
        </dl>
      </div>

      {/* Live console, presented head-on as the product showcase. A soft violet
          halo behind it lifts it off the aurora; it floats gently on its own. */}
      <div className="relative mx-auto mt-16 flex max-w-3xl justify-center px-6 pb-24">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 -top-8 bottom-16 mx-auto max-w-xl rounded-[50%] opacity-70 blur-3xl"
          style={{
            background:
              'radial-gradient(closest-side, var(--color-accent), var(--color-accent-cyan) 45%, transparent 75%)',
          }}
        />
        <div className="float relative">
          <MiniConsole />
        </div>
      </div>
    </section>
  );
}
