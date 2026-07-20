import { Reveal } from '@/components/marketing/Reveal';

// DISPATCH 02 — the match-day timeline. The incident escalates minute by minute;
// the type colour climbs bone → referee-yellow → vermilion as it does, and the
// spine draws a broadcast timeline down the left. No cards, no centred layout.

const EVENTS = [
  { t: '07:00', e: 'Stadium gates open. Every system reads nominal.', lvl: 0 },
  { t: '11:30', e: 'A volunteer reports a blocked stairwell in Sector B.', lvl: 0 },
  { t: '12:15', e: 'Crowd density at Gate E1 starts to climb.', lvl: 1 },
  { t: '12:17', e: 'A camera flags an anomaly in the East concourse.', lvl: 1 },
  { t: '12:18', e: 'Radio traffic spikes — three incidents, one channel.', lvl: 2 },
  { t: '12:19', e: 'The duty operator is out of hands and out of time.', lvl: 2 },
  { t: '12:20', e: 'SENTINEL intervenes — triaged, translated, dispatched.', lvl: 3 },
] as const;

function toneOf(lvl: number): string {
  if (lvl === 3) return '#FF5A2C';
  if (lvl >= 2) return '#F5C518';
  return '#ECE6D7';
}

function Row({ t, e, lvl, i }: { t: string; e: string; lvl: number; i: number }) {
  const tone = toneOf(lvl);
  return (
    <Reveal
      as="li"
      delay={i * 70}
      className="grid grid-cols-[3.5rem_1.25rem_1fr] items-start gap-4 sm:grid-cols-[6rem_2rem_1fr]"
    >
      <span className="pt-1.5 text-right font-[family-name:var(--font-jetbrains)] text-xs tnum text-[#8B8474] sm:text-sm">
        {t}
      </span>
      <span aria-hidden="true" className="relative flex justify-center self-stretch">
        <span className="absolute inset-y-0 top-2 w-px bg-[#2A251D]" />
        <span
          className="relative mt-1.5 h-2.5 w-2.5 rounded-full"
          style={{ backgroundColor: tone, boxShadow: `0 0 0 4px ${tone}22` }}
        />
      </span>
      <p
        className="pb-9 font-[family-name:var(--font-fraunces)] text-xl leading-snug sm:text-2xl"
        style={{ color: tone }}
      >
        {e}
      </p>
    </Reveal>
  );
}

export function TimelineSection() {
  return (
    <section id="what" className="border-t border-[#2A251D] bg-[#100E0B] py-24 text-[#ECE6D7]">
      <div className="mx-auto max-w-5xl px-6">
        <header className="mb-16 flex items-end justify-between gap-6">
          <div>
            <p className="font-[family-name:var(--font-jetbrains)] text-xs uppercase tracking-[0.24em] text-[#8B8474]">
              Dispatch 02 — Match Day Timeline
            </p>
            <h2 className="mt-4 font-[family-name:var(--font-fraunces)] text-4xl font-black leading-[0.95] tracking-tight sm:text-6xl">
              Ninety seconds
              <br />
              to overwhelmed.
            </h2>
          </div>
          <span className="hidden text-right font-[family-name:var(--font-jetbrains)] text-[0.7rem] uppercase leading-relaxed tracking-[0.2em] text-[#8B8474] sm:block">
            T−minus
            <br />
            to incident
          </span>
        </header>
        <ol>
          {EVENTS.map((ev, i) => (
            <Row key={ev.t} t={ev.t} e={ev.e} lvl={ev.lvl} i={i} />
          ))}
        </ol>
      </div>
    </section>
  );
}
