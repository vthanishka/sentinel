import Link from 'next/link';

import { Reveal } from '@/components/marketing/Reveal';

// DISPATCH 08 — the close, staged as opening the control room. A darkened field,
// a faint stadium ghost, console LEDs, and a broadcast "MATCH READY" board over
// a single door-sized action. Not a CTA button — an entrance.

const GRID_BG = {
  backgroundImage:
    'linear-gradient(#241f18 1px, transparent 1px), linear-gradient(90deg, #241f18 1px, transparent 1px)',
  backgroundSize: '60px 60px',
  maskImage: 'radial-gradient(ellipse 70% 60% at 50% 45%, #000 20%, transparent 75%)',
  WebkitMaskImage: 'radial-gradient(ellipse 70% 60% at 50% 45%, #000 20%, transparent 75%)',
} as const;

function ConsoleLeds() {
  return (
    <div className="mb-10 flex items-center justify-center gap-2" aria-hidden="true">
      {['#34C759', '#F5C518', '#FF3B30', '#46E0D0'].map((c, i) => (
        <span
          key={c}
          className="h-1.5 w-1.5 rounded-full"
          style={{ backgroundColor: c, boxShadow: `0 0 8px ${c}`, opacity: 0.9 - i * 0.12 }}
        />
      ))}
    </div>
  );
}

export function ControlRoomSection() {
  return (
    <section
      id="control-room"
      className="relative overflow-hidden border-t border-[#2A251D] bg-[#0A0806] py-32 text-[#ECE6D7]"
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={GRID_BG} />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-1/2 h-px led-bar opacity-40"
      />

      <Reveal className="relative mx-auto max-w-3xl px-6 text-center">
        <p className="font-[family-name:var(--font-jetbrains)] text-xs uppercase tracking-[0.3em] text-[#8B8474]">
          Dispatch 08 — Control Room
        </p>

        <ConsoleLeds />

        <h2 className="font-[family-name:var(--font-fraunces)] text-6xl font-black leading-[0.9] tracking-tight sm:text-8xl">
          Match
          <br />
          <span className="text-[#FF5A2C]">ready.</span>
        </h2>

        <p className="mx-auto mt-8 max-w-md font-[family-name:var(--font-jetbrains)] text-xs uppercase leading-relaxed tracking-[0.16em] text-[#8B8474]">
          Systems nominal · AI online · Engine deterministic · Every zone watched
        </p>

        <div className="mt-12 flex justify-center">
          <Link
            href="/dashboard"
            className="group relative inline-flex items-center gap-4 border border-[#FF5A2C] px-10 py-5 font-[family-name:var(--font-jetbrains)] text-sm uppercase tracking-[0.24em] text-[#FF5A2C] transition-colors duration-300 hover:bg-[#FF5A2C] hover:text-[#0A0806]"
          >
            Enter operations
            <span
              aria-hidden="true"
              className="transition-transform duration-300 group-hover:translate-x-1"
            >
              ⟶
            </span>
          </Link>
        </div>
      </Reveal>
    </section>
  );
}
