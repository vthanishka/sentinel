import { Reveal } from '@/components/marketing/Reveal';

// DISPATCH 05 — the numbers, scattered like telemetry readouts rather than lined
// up in a stat row. Each reading sits at its own coordinate, its own size, its
// own alignment, annotated in mono like a broadcast lower-third.

const READINGS = [
  {
    num: '30+',
    unit: 'Languages triaged',
    note: 'A volunteer reports in Hindi at Gate D; the operator reads it in English, already triaged.',
    pos: 'md:col-span-6 md:col-start-1',
    align: 'text-left',
    accent: '#FF5A2C',
  },
  {
    num: '480',
    unit: 'Automated tests · all green',
    note: 'Engine, simulator, routes, components — the safety math is pinned by tests, not by hope.',
    pos: 'md:col-span-5 md:col-start-8 md:mt-24',
    align: 'text-right',
    accent: '#ECE6D7',
  },
  {
    num: '95%+',
    unit: 'Safety-engine coverage',
    note: 'The deterministic core is held to a far higher bar than the interface around it.',
    pos: 'md:col-span-5 md:col-start-2 md:mt-16',
    align: 'text-left',
    accent: '#F5C518',
  },
  {
    num: '100%',
    unit: 'Deterministic safety math',
    note: 'Every threshold, ETA and impact figure is computed — the model only ever explains them.',
    pos: 'md:col-span-6 md:col-start-7 md:mt-8',
    align: 'text-right',
    accent: '#46E0D0',
  },
] as const;

function Reading({
  num,
  unit,
  note,
  pos,
  align,
  accent,
  i,
}: (typeof READINGS)[number] & { i: number }) {
  return (
    <Reveal delay={i * 90} className={`${pos} ${align}`}>
      <p
        className="font-[family-name:var(--font-fraunces)] text-7xl font-black leading-none tracking-tight sm:text-8xl"
        style={{ color: accent }}
      >
        {num}
      </p>
      <p className="mt-3 font-[family-name:var(--font-jetbrains)] text-[0.7rem] uppercase tracking-[0.22em] text-[#8B8474]">
        {unit}
      </p>
      <p
        className={`mt-4 max-w-sm text-sm leading-relaxed text-[#C9C2B2] ${align === 'text-right' ? 'md:ml-auto' : ''}`}
      >
        {note}
      </p>
    </Reveal>
  );
}

export function NumbersSection() {
  return (
    <section id="features" className="border-t border-[#2A251D] bg-[#16130E] py-24 text-[#ECE6D7]">
      <div className="mx-auto max-w-6xl px-6">
        <p className="mb-16 font-[family-name:var(--font-jetbrains)] text-xs uppercase tracking-[0.24em] text-[#8B8474]">
          Dispatch 05 — By the Numbers / Telemetry
        </p>
        <div className="grid gap-y-16 md:grid-cols-12">
          {READINGS.map((r, i) => (
            <Reading key={r.num} {...r} i={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
