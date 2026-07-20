import { Reveal } from '@/components/marketing/Reveal';

// DISPATCH 07 — the FAQ, replayed as mission logs. Each incident runs as a
// console transcript: report in, translation, engine verdict, dispatch, resolve.
// A terminal, not an accordion. Green resolves, amber cautions, red for SEV-1.

const LOGS = [
  {
    time: '14:22:07',
    tag: 'GATE D · INCIDENT 032',
    sev: 'SEV-1',
    sevColor: '#FF3B30',
    lines: [
      { p: 'report(es)', t: '"hay una persona inconsciente que no respira"', c: '#C9C2B2' },
      { p: 'translate →', t: '"unconscious person, not breathing"', c: '#ECE6D7' },
      { p: 'severity →', t: 'SEV-1 · MEDICAL · life-safety keyword override', c: '#FF3B30' },
      { p: 'dispatch →', t: 'Medical Response · East Aid Station', c: '#ECE6D7' },
      { p: 'resolved ✓', t: '41s to responder on scene', c: '#34C759' },
    ],
  },
  {
    time: '14:48:19',
    tag: 'GATE E1 · INCIDENT 037',
    sev: 'HIGH',
    sevColor: '#F5C518',
    lines: [
      { p: 'sensor →', t: 'density climbing · 167% of gate capacity', c: '#C9C2B2' },
      { p: 'engine →', t: 'reroute 30% of arrivals to Gate N1', c: '#ECE6D7' },
      { p: 'impact →', t: 'utilisation 167% → 118% projected', c: '#F5C518' },
      { p: 'operator ✓', t: 'acknowledged · overflow lane opened', c: '#34C759' },
    ],
  },
] as const;

function LogEntry({ log, last }: { log: (typeof LOGS)[number]; last: boolean }) {
  return (
    <Reveal className="border border-[#2A251D] bg-[#0C0A08] p-6 font-[family-name:var(--font-jetbrains)] text-sm sm:p-8">
      <div className="flex items-center justify-between border-b border-[#2A251D] pb-3">
        <span className="tnum text-[#8B8474]">
          {log.time} <span className="text-[#ECE6D7]">· {log.tag}</span>
        </span>
        <span className="text-[0.7rem] uppercase tracking-[0.2em]" style={{ color: log.sevColor }}>
          {log.sev}
        </span>
      </div>
      <div className="mt-4 space-y-2">
        {log.lines.map((l) => (
          <p key={l.p} className="flex gap-3 leading-relaxed">
            <span className="w-24 shrink-0 text-[#8B8474]">{l.p}</span>
            <span style={{ color: l.c }}>{l.t}</span>
          </p>
        ))}
        {last && (
          <p className="flex gap-3 text-[#8B8474]">
            <span className="w-24 shrink-0">standby</span>
            <span className="caret" aria-hidden="true" />
          </p>
        )}
      </div>
    </Reveal>
  );
}

export function MissionLogsSection() {
  return (
    <section id="demo" className="border-t border-[#2A251D] bg-[#16130E] py-24 text-[#ECE6D7]">
      <div className="mx-auto max-w-4xl px-6">
        <header className="mb-12 flex items-center gap-4">
          <span className="font-[family-name:var(--font-jetbrains)] text-xs uppercase tracking-[0.24em] text-[#8B8474]">
            Dispatch 07 — Mission Logs
          </span>
          <span aria-hidden="true" className="rule-draw h-px flex-1 bg-[#2A251D]" />
          <span className="font-[family-name:var(--font-jetbrains)] text-xs uppercase tracking-[0.24em] text-[#34C759]">
            ● Replay
          </span>
        </header>
        <div className="space-y-5">
          {LOGS.map((log, i) => (
            <LogEntry key={log.time} log={log} last={i === LOGS.length - 1} />
          ))}
        </div>
      </div>
    </section>
  );
}
