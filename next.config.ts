import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // No `output` override: Vercel builds and serves Next.js natively, so the
  // standalone server bundle a container image needs is unnecessary here (and
  // would only get in the way of Vercel's own output tracing).
  reactStrictMode: true,
  poweredByHeader: false,
  eslint: {
    // Lint runs as its own CI gate; keeping it out of `next build` keeps the
    // build fast and failures attributable to a single step.
    ignoreDuringBuilds: true,
  },
  experimental: {
    // Charts are heavy and only used on the dashboard; keep them out of the
    // shared bundle so public pages stay within the performance budget.
    optimizePackageImports: ['recharts', 'firebase'],
  },
};

export default nextConfig;
