import Link from 'next/link';

// The sign-off, kept in the dispatch voice: a mono colophon strip with a running
// rule, the venue coordinates, and the operations links.
export function SiteFooter() {
  return (
    <footer className="border-t border-[#2A251D] bg-[#0A0806] text-[#8B8474]">
      <div className="mx-auto max-w-[80rem] px-6 py-12">
        <div className="flex flex-wrap items-center gap-4 font-[family-name:var(--font-jetbrains)] text-[0.7rem] uppercase tracking-[0.22em]">
          <span className="text-[#ECE6D7]">
            <span aria-hidden="true" className="text-[#FF5A2C]">
              ▮
            </span>{' '}
            Sentinel
          </span>
          <span aria-hidden="true" className="h-px flex-1 bg-[#2A251D]" />
          <span>Citadel Stadium · 33.44°N 112.07°W</span>
        </div>

        <div className="mt-10 flex flex-wrap items-end justify-between gap-6">
          <nav className="flex flex-wrap gap-x-8 gap-y-2 font-[family-name:var(--font-jetbrains)] text-[0.7rem] uppercase tracking-[0.2em]">
            {(
              [
                ['Command center', '/dashboard'],
                ['Incidents', '/incidents'],
                ['Methodology', '/methodology'],
              ] as const
            ).map(([label, href]) => (
              <Link key={href} href={href} className="transition-colors hover:text-[#ECE6D7]">
                {label}
              </Link>
            ))}
          </nav>
          <p className="max-w-md text-[0.7rem] leading-relaxed">
            FIFA World Cup 2026 operations demo · GenAI-central, safety-deterministic. Venue, feeds
            and scenarios are simulated.
          </p>
        </div>
      </div>
    </footer>
  );
}
