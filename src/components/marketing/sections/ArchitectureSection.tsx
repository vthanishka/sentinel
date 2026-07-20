import { Reveal } from '@/components/marketing/Reveal';

// DISPATCH 06 — the system, drawn like an engineering blueprint. The signal path
// runs top to bottom as a numbered spine on a faint grid; each node reveals in
// sequence so the diagram assembles itself. Mono throughout, one vermilion tick.

const NODES = [
  { n: '01', label: 'Gemini', role: 'Reads the raw report in any language', coord: 'IN · x00' },
  { n: '02', label: 'Translator', role: '30+ languages → English, faithfully', coord: 'x01' },
  { n: '03', label: 'Parser', role: 'Structures the incident — carries no severity', coord: 'x02' },
  { n: '04', label: 'Risk Engine', role: 'Deterministic density, flow & thresholds', coord: 'x03' },
  { n: '05', label: 'Decision Engine', role: 'Severity, team, routing — rules only', coord: 'x04' },
  {
    n: '06',
    label: 'Control Room',
    role: 'Operator sees the call and the reasoning',
    coord: 'x05',
  },
  {
    n: '07',
    label: 'Dispatch',
    role: 'Medical · security · stewards, on their way',
    coord: 'OUT · x06',
  },
] as const;

const GRID_BG = {
  backgroundImage:
    'linear-gradient(#2A251D 1px, transparent 1px), linear-gradient(90deg, #2A251D 1px, transparent 1px)',
  backgroundSize: '48px 48px',
  backgroundPosition: 'center',
} as const;

function Node({
  n,
  label,
  role,
  coord,
  i,
  last,
}: (typeof NODES)[number] & { i: number; last: boolean }) {
  const signal = i === 0 || last;
  return (
    <Reveal as="li" delay={i * 90} className="relative grid grid-cols-[3rem_1fr] gap-5">
      <div className="relative flex justify-center">
        {!last && (
          <span aria-hidden="true" className="absolute top-6 bottom-[-2rem] w-px bg-[#2A251D]" />
        )}
        <span
          className="relative mt-1 flex h-11 w-11 items-center justify-center rounded-sm border font-[family-name:var(--font-jetbrains)] text-xs tnum"
          style={{
            borderColor: signal ? '#FF5A2C' : '#2A251D',
            color: signal ? '#FF5A2C' : '#8B8474',
            background: '#100E0B',
          }}
        >
          {n}
        </span>
      </div>
      <div className="pb-8">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="font-[family-name:var(--font-jetbrains)] text-lg uppercase tracking-[0.12em] text-[#ECE6D7]">
            {label}
          </h3>
          <span className="font-[family-name:var(--font-jetbrains)] text-[0.6rem] uppercase tracking-[0.2em] text-[#8B8474]">
            {coord}
          </span>
        </div>
        <p className="mt-1.5 text-sm text-[#C9C2B2]">{role}</p>
      </div>
    </Reveal>
  );
}

export function ArchitectureSection() {
  return (
    <section
      id="stack"
      className="relative border-t border-[#2A251D] bg-[#100E0B] py-24 text-[#ECE6D7]"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={GRID_BG}
      />
      <div className="relative mx-auto max-w-3xl px-6">
        <header className="mb-14">
          <p className="font-[family-name:var(--font-jetbrains)] text-xs uppercase tracking-[0.24em] text-[#8B8474]">
            Dispatch 06 — System Architecture / Signal Path
          </p>
          <h2 className="mt-4 font-[family-name:var(--font-fraunces)] text-4xl font-black tracking-tight sm:text-5xl">
            One path, end to end.
          </h2>
        </header>
        <ol>
          {NODES.map((node, i) => (
            <Node key={node.n} {...node} i={i} last={i === NODES.length - 1} />
          ))}
        </ol>
      </div>
    </section>
  );
}
