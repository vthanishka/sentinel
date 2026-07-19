// Static physical configuration of the demo venue: a fictional ~99,000-seat
// national stadium (8 zones, 6 gates, 4 transit lines). Capacities are *safe*
// capacities, set so 100% density corresponds to the ~4 people/m² high-risk
// onset documented in engine/thresholds.

export interface ZoneConfig {
  id: string;
  name: string;
  /** Safe capacity in people. */
  capacity: number;
  /** Id of the nearest first-aid point serving this zone. */
  firstAidZoneId: string;
}

export interface GateConfig {
  id: string;
  name: string;
  /** Sustained processing capacity in people per minute at normal staffing. */
  baseThroughputPerMin: number;
  /** Share of total arrivals this gate normally receives, 0–1. */
  arrivalShare: number;
  /** Zone this gate feeds. */
  feedsZoneId: string;
}

export interface TransitConfig {
  line: string;
  /** Share of arriving spectators using this line, 0–1. */
  arrivalShare: number;
}

export const VENUE_NAME = 'Citadel Stadium';

/** Total safe capacity across all zones. */
export const VENUE_CAPACITY = 99_000;

/** First-aid points, referenced by zones for deterministic incident routing. */
export const FIRST_AID_POINTS: readonly { id: string; name: string }[] = [
  { id: 'fa-north', name: 'North Aid Station' },
  { id: 'fa-south', name: 'South Aid Station' },
  { id: 'fa-east', name: 'East Aid Station' },
  { id: 'fa-west', name: 'West Aid Station' },
];

export const ZONES: readonly ZoneConfig[] = [
  { id: 'z1', name: 'North Stand Lower', capacity: 14_400, firstAidZoneId: 'fa-north' },
  { id: 'z2', name: 'North Stand Upper', capacity: 11_400, firstAidZoneId: 'fa-north' },
  { id: 'z3', name: 'East Atrium', capacity: 9_600, firstAidZoneId: 'fa-east' },
  { id: 'z4', name: 'East Grandstand', capacity: 13_800, firstAidZoneId: 'fa-east' },
  { id: 'z5', name: 'South Stand Lower', capacity: 14_400, firstAidZoneId: 'fa-south' },
  { id: 'z6', name: 'South Stand Upper', capacity: 11_400, firstAidZoneId: 'fa-south' },
  { id: 'z7', name: 'West Atrium', capacity: 9_600, firstAidZoneId: 'fa-west' },
  { id: 'z8', name: 'West Grandstand', capacity: 14_400, firstAidZoneId: 'fa-west' },
];

/**
 * The six gates of the venue. Arrival shares sum to 1.
 *
 * Two properties are deliberate and are asserted by tests:
 *
 *  - **Throughput is per *gate*, not per turnstile.** Each gate runs a bank of
 *    turnstiles in parallel, which is why the figures are in the hundreds. Total
 *    throughput (~2,160/min) is sized with deliberate headroom over the ~1,980/min
 *    peak arrival rate, exactly as a real venue is: gates run hot through the rush
 *    (utilisation in the 80–100% band) but a normal matchday never saturates them.
 *    Undersizing them would make every ordinary rush read 'critical' and train an
 *    operator to ignore the alarm.
 *
 *  - **Each gate's arrival share is proportional to the capacity of the zone it
 *    feeds.** Ticket allocation follows the stand a fan sits in, so a gate serving
 *    a 14,400-seat stand receives more of the crowd than one serving a 9,600
 *    atrium. Getting this wrong makes zones fill past capacity on a normal
 *    matchday and pins every density readout to critical.
 */
export const GATES: readonly GateConfig[] = [
  {
    id: 'gA',
    name: 'Gate N1',
    baseThroughputPerMin: 424.8,
    arrivalShare: 14_400 / 73_200,
    feedsZoneId: 'z1',
  },
  {
    id: 'gB',
    name: 'Gate N2',
    baseThroughputPerMin: 336,
    arrivalShare: 11_400 / 73_200,
    feedsZoneId: 'z2',
  },
  {
    id: 'gC',
    name: 'Gate E1',
    baseThroughputPerMin: 283.2,
    arrivalShare: 9_600 / 73_200,
    feedsZoneId: 'z3',
  },
  {
    id: 'gD',
    name: 'Gate E2',
    baseThroughputPerMin: 406.8,
    arrivalShare: 13_800 / 73_200,
    feedsZoneId: 'z4',
  },
  {
    id: 'gE',
    name: 'Gate S1',
    baseThroughputPerMin: 424.8,
    arrivalShare: 14_400 / 73_200,
    feedsZoneId: 'z5',
  },
  {
    id: 'gF',
    name: 'Gate W1',
    baseThroughputPerMin: 283.2,
    arrivalShare: 9_600 / 73_200,
    feedsZoneId: 'z7',
  },
];

/** The transit lines serving the venue. Arrival shares sum to 1. */
export const TRANSIT_LINES: readonly TransitConfig[] = [
  { line: 'Central Line', arrivalShare: 0.35 },
  { line: 'Harbour Line', arrivalShare: 0.25 },
  { line: 'Airport Rail', arrivalShare: 0.2 },
  { line: 'Park & Ride', arrivalShare: 0.2 },
];

/** Ids of zones served directly by a gate. */
const FED_ZONE_IDS: ReadonlySet<string> = new Set(GATES.map((g) => g.feedsZoneId));

/**
 * Reports whether a zone is entered directly through a gate. Zones without their
 * own gate (upper tiers, far stands) fill by internal circulation instead.
 */
export function isGateFedZone(zoneId: string): boolean {
  return FED_ZONE_IDS.has(zoneId);
}

/** Combined safe capacity of every gate-fed zone. */
export const FED_CAPACITY: number = ZONES.filter((z) => isGateFedZone(z.id)).reduce(
  (sum, z) => sum + z.capacity,
  0,
);

/** Combined safe capacity of every zone reached only by internal circulation. */
export const UNFED_CAPACITY: number = VENUE_CAPACITY - FED_CAPACITY;

/**
 * Share of admitted spectators who pass through their entry zone and continue on
 * to a zone with no gate of its own.
 *
 * Derived from capacity rather than tuned: if 26% of the venue's seats can only
 * be reached by walking on from a concourse, then 26% of the crowd must do so.
 * This is what keeps the simulation conserving people.
 */
export const TRANSIT_SHARE: number = UNFED_CAPACITY / VENUE_CAPACITY;

/**
 * Finds the first-aid point nearest a zone, or the north post as a safe default
 * when the zone is unknown — routing a responder to a real post beats failing.
 */
export function nearestFirstAid(zoneId: string): string {
  return ZONES.find((z) => z.id === zoneId)?.firstAidZoneId ?? 'fa-north';
}

/** Looks up a zone's display name, or the id itself when unknown. */
export function zoneName(zoneId: string): string {
  return ZONES.find((z) => z.id === zoneId)?.name ?? zoneId;
}
