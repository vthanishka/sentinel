import type { Metadata, Viewport } from 'next';
import { Fraunces, Inter, JetBrains_Mono } from 'next/font/google';
import { headers } from 'next/headers';

import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  preload: true,
});

// JetBrains Mono carries the display type — headings, the wordmark, and the
// tabular metrics. A monospaced display face gives the console a technical,
// terminal-room identity and keeps numerals perfectly aligned as they tick.
const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
  preload: true,
});

// Fraunces carries the editorial display voice on the landing — a high-contrast
// serif with real optical character, deliberately unlike the app's technical mono.
const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  display: 'swap',
  preload: true,
});

export const metadata: Metadata = {
  title: {
    default: 'SENTINEL — AI Command Center for Stadium Operations',
    template: '%s · SENTINEL',
  },
  description:
    'SENTINEL turns live stadium operations data into plain-language situational awareness, ' +
    'AI decision recommendations with reasoning, and multilingual incident triage.',
  applicationName: 'SENTINEL',
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: '#0c0a12',
  width: 'device-width',
  initialScale: 1,
};

/**
 * Reading `headers()` here is load-bearing, not incidental. The middleware
 * issues a per-request CSP nonce, and a nonce cannot exist in a statically
 * prerendered page — so the browser would refuse every one of Next's own
 * scripts and the app would ship with no JavaScript. Touching `headers()` opts
 * the tree into dynamic rendering, which is what lets Next stamp the nonce onto
 * its script tags. Nothing is worth caching anyway: this is an authenticated
 * console behind `min-instances=1`, so there is no cold start to amortise and
 * every page shows live state.
 */
export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // The value is unused; the read is what forces dynamic rendering.
  await headers();

  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable} ${fraunces.variable}`}>
      <body className="min-h-dvh antialiased">{children}</body>
    </html>
  );
}
