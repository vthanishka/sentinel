'use client';

// The only stateful component on the dashboard: it owns the scenario selection,
// the clock, and the acknowledged set, and hands everything else down as props —
// which is what keeps every panel below it a pure function of its inputs and
// testable without a network. The shell (rail, command bar, KPI strip, bento
// grid) is split into small presentational functions below.
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useState } from 'react';

import { StatusPill } from '@/components/ui/StatusPill';
import { formatCount } from '@/lib/engine/situation';
import type { RiskLevel } from '@/lib/engine/types';
import type { ScenarioId } from '@/lib/sim/scenarios';
import { VENUE_NAME } from '@/lib/sim/venue';
import { LEVEL_SETTLE_MS, SUSTAINABILITY_REFRESH_MS } from '@/lib/ui/constants';
import { useBriefing, useRecommendations, useSituation, useSnapshot } from '@/lib/ui/hooks';
import { useDebouncedValue } from '@/lib/ui/useDebouncedValue';
import { useEscalation } from '@/lib/ui/useEscalation';
import { useSimClock } from '@/lib/ui/useSimClock';

import { BriefingPanel } from './BriefingPanel';
import { EscalationFlash } from './EscalationFlash';
import { RecommendationsPanel } from './RecommendationsPanel';
import { ScenarioPicker } from './ScenarioPicker';
import { StadiumMap } from './StadiumMap';
import { SustainabilityStrip } from './SustainabilityStrip';
import { ZoneGrid } from './ZoneGrid';

type SnapshotRes = ReturnType<typeof useSnapshot>;
type BriefingRes = ReturnType<typeof useBriefing>;
type RecsRes = ReturnType<typeof useRecommendations>;

const NAV = [
  { href: '/dashboard', label: 'Command Center', glyph: '▚' },
  { href: '/incidents', label: 'Incidents', glyph: '◈' },
  { href: '/methodology', label: 'Methodology', glyph: '❯' },
] as const;

function kickoffLabel(minutes: number | null): string {
  if (minutes === null) return '—';
  if (minutes > 0) return `T−${minutes}`;
  if (minutes === 0) return 'LIVE';
  return `+${Math.abs(minutes)}`;
}

/** The fixed left rail: brand, primary nav, and a live venue marker. */
function Rail() {
  const pathname = usePathname();
  return (
    <aside className="z-40 border-b border-[var(--color-border)] bg-[var(--color-void)]/80 backdrop-blur lg:fixed lg:inset-y-0 lg:left-0 lg:w-60 lg:border-b-0 lg:border-r">
      <div className="flex items-center justify-between gap-4 px-5 py-4 lg:h-full lg:flex-col lg:items-stretch lg:justify-start lg:py-6">
        <Link href="#top" className="flex items-center gap-2 lg:px-2">
          <span aria-hidden="true" className="text-lg text-[var(--color-accent-strong)]">
            ◆
          </span>
          <span className="font-[family-name:var(--font-jetbrains)] text-lg font-bold tracking-tight text-[var(--color-ink)]">
            SENTINEL
          </span>
        </Link>

        <nav aria-label="Primary" className="lg:mt-8 lg:flex-1">
          <ul className="flex gap-1 lg:flex-col lg:gap-1.5">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={pathname === item.href ? 'page' : undefined}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    pathname === item.href
                      ? 'bg-[var(--color-accent-dim)] text-[var(--color-accent-strong)] shadow-[inset_0_0_0_1px_var(--color-accent)]'
                      : 'text-[var(--color-ink-dim)] hover:bg-[var(--color-surface-raised)] hover:text-[var(--color-ink)]'
                  }`}
                >
                  <span aria-hidden="true" className="text-xs opacity-80">
                    {item.glyph}
                  </span>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="hidden items-center gap-2 rounded-lg border border-[var(--color-border)] px-3 py-2 text-xs lg:flex">
          <span aria-hidden="true" className="text-[var(--color-status-normal)]">
            ●
          </span>
          <span className="text-[var(--color-ink-dim)]">{VENUE_NAME}</span>
        </div>
      </div>
    </aside>
  );
}

/** Slim command bar: live overall status and the scenario control. */
function CommandBar({
  overall,
  tMinusKickoffMin,
  scenario,
  onScenarioChange,
}: {
  overall: RiskLevel | null;
  tMinusKickoffMin: number | null;
  scenario: ScenarioId;
  onScenarioChange: (value: ScenarioId) => void;
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-[var(--color-border)] bg-[var(--color-surface)]/70 backdrop-blur">
      <div className="flex flex-wrap items-center gap-x-5 gap-y-3 px-5 py-3">
        <div aria-live="polite" className="flex h-9 min-w-[11rem] items-center">
          {overall === null ? (
            <span className="text-xs text-[var(--color-ink-dim)]">Assessing…</span>
          ) : (
            <StatusPill level={overall} size="lg" prefix="Overall:" />
          )}
        </div>
        <span className="text-xs text-[var(--color-ink-dim)]">
          {VENUE_NAME} · kickoff{' '}
          <span className="tnum font-semibold text-[var(--color-ink)]">
            {kickoffLabel(tMinusKickoffMin)}
          </span>
        </span>
        <div className="ms-auto">
          <ScenarioPicker value={scenario} onChange={onScenarioChange} />
        </div>
      </div>
    </header>
  );
}

/** One headline metric in the KPI strip. */
function Kpi({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <div className="panel px-4 py-3">
      <p className="text-[0.6875rem] uppercase tracking-wider text-[var(--color-ink-dim)]">
        {label}
      </p>
      <p
        className={`mt-1 font-[family-name:var(--font-jetbrains)] text-2xl font-bold tnum ${tone ?? 'text-[var(--color-ink)]'}`}
      >
        {value}
      </p>
    </div>
  );
}

/** Peak gate utilisation and total headcount from a snapshot (null-safe). */
function snapshotNumbers(snapshot: SnapshotRes['data']) {
  const gates = snapshot?.gates ?? [];
  const peak = gates.length > 0 ? Math.max(...gates.map((g) => g.utilizationPct)) : null;
  const inside = (snapshot?.zones ?? []).reduce((sum, z) => sum + z.occupancy, 0);
  return { peak, inside };
}

/** Derives the KPI-strip display strings from the live snapshot. */
function kpiMetrics(snapshot: SnapshotRes['data'], risks: number | null) {
  const { peak, inside } = snapshotNumbers(snapshot);
  return {
    kickoff: kickoffLabel(snapshot?.tMinusKickoffMin ?? null),
    risks: risks === null ? '—' : String(risks),
    riskTone: risks && risks > 0 ? 'text-[var(--color-status-high-text)]' : undefined,
    peak: peak === null ? '—' : `${Math.round(peak)}%`,
    inside: inside > 0 ? formatCount(inside) : '—',
  };
}

/** Four headline metrics derived from the live snapshot. */
function KpiStrip({ snapshot, risks }: { snapshot: SnapshotRes['data']; risks: number | null }) {
  const m = kpiMetrics(snapshot, risks);
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <Kpi label="Kickoff" value={m.kickoff} />
      <Kpi label="Detected risks" value={m.risks} tone={m.riskTone} />
      <Kpi label="Peak gate load" value={m.peak} />
      <Kpi label="Inside venue" value={m.inside} />
    </div>
  );
}

/** The bento of live panels: AI briefing leads, then recommendations, schematic,
 *  zones, and the sustainability strip across the foot. */
function PanelGrid({
  escalationToken,
  briefing,
  recommendations,
  sustainability,
  snapshot,
  onAcknowledge,
  acknowledged,
}: {
  escalationToken: ReturnType<typeof useEscalation>;
  briefing: BriefingRes;
  recommendations: RecsRes;
  sustainability: BriefingRes;
  snapshot: SnapshotRes;
  onAcknowledge: (riskId: string) => void;
  acknowledged: ReadonlySet<string>;
}) {
  const zones = snapshot.data?.zones ?? [];
  const gates = snapshot.data?.gates ?? [];

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <EscalationFlash token={escalationToken}>
          <BriefingPanel
            briefing={briefing.data}
            loading={briefing.loading}
            error={briefing.error}
            onRetry={briefing.refresh}
          />
        </EscalationFlash>
      </div>
      <div className="lg:col-span-1">
        <RecommendationsPanel
          recommendations={recommendations.data}
          loading={recommendations.loading}
          error={recommendations.error}
          onRetry={recommendations.refresh}
          onAcknowledge={onAcknowledge}
          acknowledged={acknowledged}
        />
      </div>
      <div className="lg:col-span-2">
        <StadiumMap zones={zones} />
      </div>
      <div className="lg:col-span-1">
        <ZoneGrid zones={zones} gates={gates} loading={snapshot.loading} />
      </div>
      <div className="lg:col-span-3">
        <SustainabilityStrip snapshot={snapshot.data} insight={sustainability.data} />
      </div>
    </div>
  );
}

/** The command center. */
export function DashboardView() {
  const [scenario, setScenario] = useState<ScenarioId>('normal');
  const [acknowledged, setAcknowledged] = useState<ReadonlySet<string>>(new Set());
  const { tick } = useSimClock();

  const snapshot = useSnapshot(scenario, tick);
  const situation = useSituation(scenario, tick);

  // Keep the AI panels coherent with the live status: when the overall level
  // changes, re-fetch them immediately rather than waiting out their slow cadence.
  const level = situation.data?.overall;
  // Debounced level drives the costly AI refetch, so band-boundary jitter cannot
  // flap it and burn quota; the live status pill uses the raw level.
  const settledLevel = useDebouncedValue(level, LEVEL_SETTLE_MS);
  const briefing = useBriefing({ scenario, tick, kind: 'situation', revalidateKey: settledLevel });
  const sustainability = useBriefing({
    scenario,
    tick,
    kind: 'sustainability',
    refreshMs: SUSTAINABILITY_REFRESH_MS,
  });
  const recommendations = useRecommendations(scenario, tick, settledLevel);
  const escalationToken = useEscalation(settledLevel ?? null);

  const handleScenarioChange = useCallback((next: ScenarioId) => {
    setScenario(next);
    setAcknowledged(new Set());
  }, []);

  const handleAcknowledge = useCallback((riskId: string) => {
    setAcknowledged((prev) => new Set(prev).add(riskId));
  }, []);

  return (
    <div id="top" className="min-h-dvh">
      <a href="#main" className="skip-link">
        Skip to main content
      </a>

      <Rail />

      <div className="lg:pl-60">
        <CommandBar
          overall={level ?? null}
          tMinusKickoffMin={snapshot.data?.tMinusKickoffMin ?? null}
          scenario={scenario}
          onScenarioChange={handleScenarioChange}
        />

        <main id="main" className="mx-auto max-w-[100rem] space-y-4 px-5 py-5">
          <h2 className="sr-only">Live operations overview</h2>
          <KpiStrip snapshot={snapshot.data} risks={situation.data?.risks.length ?? null} />
          <PanelGrid
            escalationToken={escalationToken}
            briefing={briefing}
            recommendations={recommendations}
            sustainability={sustainability}
            snapshot={snapshot}
            onAcknowledge={handleAcknowledge}
            acknowledged={acknowledged}
          />
        </main>
      </div>
    </div>
  );
}
