'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

// The landing top bar, in the editorial "dispatch" voice: mono labels, a bone
// wordmark with a vermilion tally, a hairline scroll-progress rail, and a frosted
// ink backdrop that fades in past the hero. Plain anchors so it works pre-hydration.

const SECTIONS = [
  { id: 'what', label: 'Timeline' },
  { id: 'trust', label: 'Live Map' },
  { id: 'how', label: 'VAR' },
  { id: 'features', label: 'Numbers' },
  { id: 'demo', label: 'Logs' },
] as const;

function NavLinks({ active }: { active: string }) {
  return (
    <ul className="hidden items-center gap-6 md:flex">
      {SECTIONS.map((section) => (
        <li key={section.id}>
          <a
            href={`#${section.id}`}
            aria-current={active === section.id ? 'true' : undefined}
            className={`border-b py-1 font-[family-name:var(--font-jetbrains)] text-[0.7rem] uppercase tracking-[0.2em] transition-colors ${
              active === section.id
                ? 'border-[#FF5A2C] text-[#FF5A2C]'
                : 'border-transparent text-[#8B8474] hover:text-[#ECE6D7]'
            }`}
          >
            {section.label}
          </a>
        </li>
      ))}
    </ul>
  );
}

export function LandingNav() {
  const [progress, setProgress] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState<string>(SECTIONS[0].id);

  useEffect(() => {
    const onScroll = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      setProgress(max > 0 ? (doc.scrollTop / max) * 100 : 0);
      setScrolled(doc.scrollTop > 24);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
        }
      },
      { rootMargin: '-45% 0px -50% 0px' },
    );
    for (const { id } of SECTIONS) {
      const node = document.getElementById(id);
      if (node) observer.observe(node);
    }
    return () => observer.disconnect();
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        scrolled
          ? 'border-b border-[#2A251D] bg-[color-mix(in_srgb,#100E0B_86%,transparent)] backdrop-blur-md'
          : 'border-b border-transparent'
      }`}
    >
      <div
        aria-hidden="true"
        className="h-0.5 origin-left bg-gradient-to-r from-[#FF5A2C] to-[#46E0D0]"
        style={{ transform: `scaleX(${progress / 100})` }}
      />
      <nav className="mx-auto flex h-16 max-w-[80rem] items-center justify-between gap-4 px-6">
        <a
          href="#top"
          className="flex items-center gap-2 font-[family-name:var(--font-jetbrains)] text-sm font-bold uppercase tracking-[0.14em] text-[#ECE6D7]"
        >
          <span aria-hidden="true" className="text-[#FF5A2C]">
            ▮
          </span>
          Sentinel
        </a>

        <NavLinks active={active} />

        <Link
          href="/dashboard"
          className="inline-flex items-center border border-[#2A251D] px-4 py-2 font-[family-name:var(--font-jetbrains)] text-[0.7rem] uppercase tracking-[0.2em] text-[#ECE6D7] transition-colors hover:border-[#FF5A2C] hover:text-[#FF5A2C]"
        >
          Launch console
        </Link>
      </nav>
    </header>
  );
}
