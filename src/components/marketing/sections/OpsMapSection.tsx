import { Reveal } from '@/components/marketing/Reveal';

// DISPATCH 03 — the live operations map. A tactical broadcast stadium: pitch
// markings, a rotating radar sweep, and seven zones pinging around the bowl,
// annotated in mono like a match-ops overlay. Pure SVG + CSS, no libraries.

const ZONES = [
  { id: 'NG', name: 'North Gate', x: 450, y: 92, anchor: 'middle', dy: -14 },
  { id: 'MD', name: 'Media', x: 214, y: 150, anchor: 'end', dy: -12 },
  { id: 'VP', name: 'VIP', x: 686, y: 150, anchor: 'start', dy: -12 },
  { id: 'VL', name: 'Volunteer', x: 132, y: 262, anchor: 'end', dy: 4 },
  { id: 'ES', name: 'East', x: 768, y: 262, anchor: 'start', dy: 4 },
  { id: 'PK', name: 'Parking', x: 214, y: 374, anchor: 'end', dy: 18 },
  { id: 'MC', name: 'Medical', x: 686, y: 374, anchor: 'start', dy: 18 },
] as const;

function ZoneMarker({ x, y, name, id, anchor, dy, i }: (typeof ZONES)[number] & { i: number }) {
  const labelX = anchor === 'end' ? x - 12 : anchor === 'start' ? x + 12 : x;
  return (
    <g>
      <circle
        className="zone-ring"
        style={{ animationDelay: `${i * 0.32}s` }}
        cx={x}
        cy={y}
        r={5}
        fill="none"
        stroke="#46E0D0"
        strokeWidth={1.2}
      />
      <circle cx={x} cy={y} r={3.4} fill="#46E0D0" />
      <text
        x={labelX}
        y={y}
        dy={dy}
        textAnchor={anchor}
        className="font-[family-name:var(--font-jetbrains)]"
        fontSize="12"
        letterSpacing="1.5"
        fill="#ECE6D7"
      >
        {id} · {name.toUpperCase()}
      </text>
    </g>
  );
}

function StadiumSvg() {
  return (
    <svg
      viewBox="0 0 900 520"
      className="h-auto w-full"
      role="img"
      aria-label="Live operations map"
    >
      <defs>
        <linearGradient id="sweep" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#46E0D0" stopOpacity="0.28" />
          <stop offset="1" stopColor="#46E0D0" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* bowl */}
      <rect x="40" y="40" width="820" height="440" rx="210" fill="none" stroke="#2A251D" />
      <rect x="120" y="96" width="660" height="328" rx="150" fill="#16130E" stroke="#2A251D" />

      {/* pitch markings */}
      <g stroke="#34C759" strokeOpacity="0.5" fill="none">
        <rect x="330" y="180" width="240" height="160" rx="6" />
        <line x1="450" y1="180" x2="450" y2="340" />
        <circle cx="450" cy="260" r="42" />
      </g>
      <circle cx="450" cy="260" r="3" fill="#34C759" />

      {/* radar sweep */}
      <g className="spin-slow" style={{ transformOrigin: '450px 260px' }}>
        <path d="M450 260 L450 70 A190 190 0 0 1 610 130 Z" fill="url(#sweep)" />
        <line x1="450" y1="260" x2="450" y2="70" stroke="#46E0D0" strokeOpacity="0.5" />
      </g>

      {ZONES.map((z, i) => (
        <ZoneMarker key={z.id} {...z} i={i} />
      ))}
    </svg>
  );
}

function Legend() {
  return (
    <dl className="grid grid-cols-2 gap-x-8 gap-y-6 font-[family-name:var(--font-jetbrains)] sm:block sm:space-y-6">
      {[
        ['Zones monitored', '08'],
        ['Gates', '06'],
        ['Transit lines', '04'],
        ['Refresh', '3s'],
      ].map(([k, v]) => (
        <div key={k} className="border-l border-[#2A251D] pl-4">
          <dt className="text-[0.62rem] uppercase tracking-[0.22em] text-[#8B8474]">{k}</dt>
          <dd className="mt-1 text-2xl tnum text-[#ECE6D7]">{v}</dd>
        </div>
      ))}
    </dl>
  );
}

export function OpsMapSection() {
  return (
    <section id="trust" className="border-t border-[#2A251D] bg-[#16130E] py-24 text-[#ECE6D7]">
      <div className="mx-auto max-w-6xl px-6">
        <header className="mb-12 flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="font-[family-name:var(--font-jetbrains)] text-xs uppercase tracking-[0.24em] text-[#8B8474]">
              Dispatch 03 — Live Operations Map
            </p>
            <h2 className="mt-4 font-[family-name:var(--font-fraunces)] text-4xl font-black tracking-tight sm:text-5xl">
              Every zone, watched at once.
            </h2>
          </div>
          <span className="font-[family-name:var(--font-jetbrains)] text-[0.7rem] uppercase tracking-[0.22em] text-[#46E0D0]">
            ● Live · Citadel Stadium
          </span>
        </header>

        <div className="grid items-center gap-10 lg:grid-cols-[1fr_14rem]">
          <Reveal>
            <StadiumSvg />
          </Reveal>
          <Legend />
        </div>
      </div>
    </section>
  );
}
